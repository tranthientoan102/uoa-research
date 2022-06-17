from datetime import datetime
import re

import bertopic
import spacy
import streamlit as st
from streamlit_option_menu import option_menu
import pandas as pd
import plotly
import gdown
from os.path import exists

from bertopic import BERTopic
from sentence_transformers import SentenceTransformer

import myFirebase


@st.experimental_singleton
def getFirebaseService():
    return myFirebase.MyFirebaseService(certPath='./firebase.json'
                     , collectionName='tweets_health')


def downloadTweets(myfirebase, kws, fromDate):
    tmp = []
    # st.session_state.status_downloadTweets = True
    print(kws)
    # with st.spinner(f'Downloading data filtered by {kws} from {fromDate} ...'):
    try:

        data = myfirebase.getCollectionRef().where("postAt", ">=", fromDate).stream()

        for t in data:
            td = t.to_dict()
            if 'text' in td.keys() and checkContainKws(kws, td['text']):
                tmp.append({'text':td['text'],'postAt':td['postAt'].isoformat()})

    except Exception as e:
        print(e.__str__())




    st.session_state.tweets = tmp
    st.session_state.rawTweets = list(map(lambda x: x['text'], tmp))
    st.session_state.cleanTweets = list(map(lambda x: cleaning(x['text'],nlp), tmp))

    st.success(f'Downloaded {len(st.session_state.tweets)} tweets filtered by {kws} from {fromDate}' )

    # return tmp

def checkContainKws(kws, text):
    if len(kws)==0: return True
    else:
        pattern_kws = re.compile('|'.join([f'{kw}\\w*' for kw in kws]), re.I)
        return re.search(pattern_kws, text)

removeKw =   ['ausvot','auspol']
re_removeKw = re.compile('|'.join([f'{kw}\\w*' for kw in removeKw]) , re.I)

re_hashtag = re.compile(r"#.+", re.I)
re_shortform = re.compile(r"n't|n’t|'.+|’.+", re.I)
re_nonChars = re.compile(r"[!\"#$%&'()*+,./:;<=>?@[\]^_`{|}~]+", re.I)
re_link = re.compile(r'https*://\S+', re.I)
re_whitespace = re.compile(r'\s+', re.I)

# customPunctuation = f"[{string.punctuation.replace('.','')}]+"
# re_punctuation = re.compile(r"[!\"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]+", re.I)

nlp = spacy.load('en_core_web_sm', disable=['parser', 'ner'])
stopwords = nlp.Defaults.stop_words

def cleaning(input, spacyModel=None):
    input = input.lower()
    input = re.sub(re_removeKw, " ", input)
    input = re.sub(re_link, " ", input)
    input = re.sub(re_hashtag, " ", input)
    input = re.sub(re_shortform, " ", input)
    input = re.sub(re_nonChars, " ", input)
    input = re.sub(re_whitespace, " ", input)

    tmp = []
    for w in input.split():
        if w not in stopwords: tmp.append(w)

    if spacyModel:
        tmpSentence = ' '.join(tmp)
        tmp = []
        for token in spacyModel(tmpSentence):
            tmp.append(token.lemma_)
    return ' '.join(tmp)


def cleaningStringList(stringList, cleanFunc=cleaning):
    result = []

    for s in stringList:
        result.append(cleanFunc(s, nlp))
    return result


def loadTrainedBerTopicModel(modelName='tweetBerTopic_clean'):
    if not exists(f'./models/{modelName}'):
        embedding_model = SentenceTransformer('distilbert-base-nli-mean-tokens')
        model = BERTopic(embedding_model=embedding_model, calculate_probabilities=True, verbose=True, n_gram_range=(1,2))
        if modelName == 'tweetBerTopic_clean':
            _ = model.fit_transform(st.session_state.cleanTweets)
        else: _ = model.fit_transform(st.session_state.rawTweets)
        model.save(f'./models/{modelName}')

    return bertopic.BERTopic.load(f'./models/{modelName}')



    # return bertopic.BERTopic.load('./tweetBerTopic_20220616')



def main():

    title = 'Topic modelling with BERTopic'
    st.set_page_config(
            page_title=title,
            layout="wide",
            initial_sidebar_state="expanded",
    )

    st.title('Topic modelling with BERTopic')


    # st.sidebar.text()

    st.session_state.tweets = []
    st.session_state.status_downloadTweets = False

    print(f'{st.session_state.status_downloadTweets=}')

    myfirebase = getFirebaseService()

    with st.sidebar:
        section = option_menu("Section"
                                , ['explore models', 'predict']
                                , icons=['circle-fill', 'circle-fill']
                                , menu_icon="book", default_index=0)

        selected = st.radio("Select model"
                                , ['trained with cleaned text', 'trained with raw text']
                                # , icons=['check-circle-fill', 'circle-fill']
                                # , menu_icon="book"
                                # , default_index=0

                               )
    modelName = 'tweetBerTopic_clean' if selected == 'trained with cleaned text' else 'tweetBerTopic_raw'
    with st.spinner(f'Load BerTopic model...'):
        tweetBerTopic = loadTrainedBerTopicModel(modelName)


    if section == 'explore models':




        st.success(f'Model {modelName} is loaded')
        st.table(tweetBerTopic.get_topic_info()[:20])
        st.plotly_chart(tweetBerTopic.visualize_hierarchy(top_n_topics=20))
        st.plotly_chart(tweetBerTopic.visualize_topics())
        st.plotly_chart(tweetBerTopic.visualize_barchart(height=400, width=300, n_words=10))






    elif section == 'predict':
        with st.form('initForm'):
            input_kws = st.text_input('Filter by:', value='ausvot,auspol'
                                      # , disabled=True
                                      )
            lastDate = st.date_input('From:', value=datetime.strptime('01-04-2022', '%d-%m-%Y'))

            # button = st.button('Get data', on_click=(downloadTweets), args=(myfirebase, input_kws.split(','),datetime.fromisoformat(lastDate.isoformat())))
            button = st.form_submit_button('Get data')

        if button:
            with st.spinner(f'Downloading data filtered by {input_kws} from {lastDate} ...'):
                downloadTweets(myfirebase, input_kws.split(','), datetime.fromisoformat(lastDate.isoformat()))

        # if st.session_state.refreshReview:
        st.text_area('Samples'
                     , value='\n-----\n\n'.join(list(map(lambda x: x['text'], st.session_state.tweets[:5])))
                     , disabled=True
                     , height=250
                     )


if __name__ == "__main__":
    main()