from datetime import datetime
import re

import bertopic
import pandas
import spacy
import streamlit as st
from streamlit_option_menu import option_menu
import pandas as pd
from plotly import express as px
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
    text = []
    postAt = []
    # st.session_state.status_downloadTweets = True
    print(kws)
    # with st.spinner(f'Downloading data filtered by {kws} from {fromDate} ...'):
    try:

        data = myfirebase.getCollectionRef()\
            .where("postAt", ">=", fromDate)\
            .stream()

        for t in data:
            td = t.to_dict()
            if 'text' in td.keys() and checkContainKws(kws, td['text']):
                # tmp.append({'text':td['text'],'postAt':td['postAt'].isoformat()})
                text.append(td['text'])
                postAt.append(pd.Timestamp(td['postAt'].isoformat()))
    except Exception as e:
        print(e.__str__())

    st.session_state.status_downloadTweets = True

    # st.session_state.df =
    # st.session_state.tweets = tmp
    # st.session_state.rawTweets = list(map(lambda x: x['text'], tmp))
    # st.session_state.cleanTweets = list(map(lambda x: cleaning(x['text'],nlp), tmp))

    result = pandas.DataFrame({'raw':text
                                , 'clean': list(map(lambda x: cleaning(x, nlp), text))
                                , 'postAt': postAt}
                              )
    print(result)
    #
    # st.success(f'Downloaded {len(st.session_state.tweets)} tweets filtered by {kws} from {fromDate}')

    # return text,postAt
    return result

@st.experimental_singleton
def downloadDataset():
    return downloadTweets(getFirebaseService(), ['ausvot','auspol'], datetime.strptime('01-04-2022','%d-%m-%Y'))

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

@st.experimental_singleton
def loadTrainedBerTopicModel_clean():
    # if not exists(f'./models/{modelName}'):
    #     embedding_model = SentenceTransformer('distilbert-base-nli-mean-tokens')
    #     model = BERTopic(embedding_model=embedding_model, calculate_probabilities=True, verbose=True, n_gram_range=(1,2))
    #     if modelName == 'tweetBerTopic_clean':
    #         _ = model.fit_transform(st.session_state.cleanTweets)
    #     else: _ = model.fit_transform(st.session_state.rawTweets)
    #     model.save(f'./models/{modelName}')

    return bertopic.BERTopic.load(f'./models/tweetBerTopic_clean')

@st.experimental_singleton
def loadTrainedBerTopicModel_raw():
    return bertopic.BERTopic.load(f'./models/tweetBerTopic_raw')



def main():

    title = 'Topic modelling with BERTopic'
    st.set_page_config(
            page_title=title,
            layout="wide",
            initial_sidebar_state="expanded",
    )

    st.title('Topic modelling with BERTopic')


    # st.sidebar.text()

    st.session_state.df = None
    st.session_state.tweets = []
    st.session_state.status_downloadTweets = False

    print(f'{st.session_state.status_downloadTweets=}')

    myfirebase = getFirebaseService()

    selected = 'trained with cleaned text'
    with st.sidebar:
        section = option_menu("Sections"
                                , ['dataset', 'explore models',  'similar topics']
                                # , icons=['circle-fill', 'circle-fill']
                                , menu_icon="book", default_index=0)

        if section != 'dataset':
            selected = st.radio("Select model"
                                    , ['trained with cleaned text', 'trained with raw text']
                                    # , icons=['check-circle-fill', 'circle-fill']
                                    # , menu_icon="book"
                                    # , default_index=0

                                   )
    modelName = 'tweetBerTopic_clean' if selected == 'trained with cleaned text' else 'tweetBerTopic_raw'

    if section == 'explore models':

        # with st.spinner(f'Load BerTopic model...'):
        #     tweetBerTopic = loadTrainedBerTopicModel(modelName)
        # st.success(f'Model {modelName} is loaded')

        tweetBerTopic = loadTrainedBerTopicModel_clean() if modelName == 'tweetBerTopic_clean' else loadTrainedBerTopicModel_raw()

        st.header('Overview')
        st.plotly_chart(tweetBerTopic.visualize_topics(), use_container_width=True)
        st.plotly_chart(tweetBerTopic.visualize_barchart(height=400, width=300, n_words=10), use_container_width=True)

        st.header('Details')
        totalTopics = len(tweetBerTopic.get_topic_info())
        totalTopics
        showingTopics = st.selectbox('Number of top topics to display: '
                                     , options= list(range(0, totalTopics))
                                     , index=min(30,totalTopics-2)
                                     )

        df = tweetBerTopic.get_topic_info()[:showingTopics].set_index('Topic')
        for id in df.index:
            # print(f'{id}, {df[id]}')
            name = ', '.join(list(map(lambda x: x[0], tweetBerTopic.get_topic(id))))

            df.loc[id, 'Keywords'] = name

        # df.Name = list(map(lambda x: ', '.join(list(map(lambda y: y[0], x)))
        #               , df
        #               ))

        st.table(df)
        st.plotly_chart(tweetBerTopic.visualize_hierarchy(top_n_topics=showingTopics), use_container_width=True)


        st.header('Topic\'s similarity matrix')
        st.plotly_chart(tweetBerTopic.visualize_heatmap(), use_container_width=True)




    elif section == 'dataset':
        # with st.form('initForm'):
        #     input_kws = st.text_input('Filter by:', value='ausvot,auspol'
        #                               # , disabled=True
        #                               )
        #     lastDate = st.date_input('From:', value=datetime.strptime('01-04-2022', '%d-%m-%Y'))
        #
        #     # button = st.button('Get data', on_click=(downloadTweets), args=(myfirebase, input_kws.split(','),datetime.fromisoformat(lastDate.isoformat())))
        #     button = st.form_submit_button('Get data')
        #
        # if button:
        #     with st.spinner(f'Downloading data filtered by {input_kws} from {lastDate} ...'):
        #         downloadTweets(myfirebase, input_kws.split(','), datetime.fromisoformat(lastDate.isoformat()))


        with st.spinner(f'Downloading data...'):
            fullDf = downloadDataset()
        st.header('Data sample')
        st.table(fullDf[:20])

        # st.table(fullDf.groupby(['postAt']).count().reset_index())
        groupByWeekDf = fullDf.groupby(pd.Grouper(key='postAt',freq='D')).count().reset_index()

        st.header('Data distribution')
        # st.line_chart(fullDf.groupby(pd.Grouper(key='postAt', freq='W')).count().reset_index())
        fig = px.bar(groupByWeekDf, x="postAt", y="raw")
        st.plotly_chart(fig, use_container_width=True)




    elif section == 'similar topics':



        # with st.spinner(f'Load BerTopic model...'):
        #     tweetBerTopic = loadTrainedBerTopicModel(modelName)
        # st.success(f'Model {modelName} is loaded')
        tweetBerTopic = loadTrainedBerTopicModel_clean() if modelName == 'tweetBerTopic_clean' \
                            else loadTrainedBerTopicModel_raw()
        fullTopic = tweetBerTopic.get_topic_info().set_index('Topic')
        for id in fullTopic.index:
            newName = ', '.join(list(map(lambda x: x[0], tweetBerTopic.get_topic(id))))
            fullTopic.loc[id,'Name'] = newName

        st.header('Similar topics from keywords')
        # listTopics = st.multiselect('Topic to display'
        #                                 , options=['a']
        #                             )

        kw = st.text_input('BERTopic.find_topics', value='Anthony Albanese')
        kwTopics, kwProbs = tweetBerTopic.find_topics(kw, top_n=10)
        # fullTopic['Prob'] = kwProbs
        filterDf = fullTopic.loc[kwTopics, :]
        filterDf['Probs']= kwProbs

        st.table(filterDf)

        st.header('Similar topics from text')
        defaultValue = ['gasoline prices are over 2 AUD now'
                                    ,'the liberal has lost the 2022 election'
                                    ,'the labor has won the 2022 election'
                                    ,'how amazing today is']
        # textList = cleaningStringList(st.text_area('BERTopic.transform',key='predictText'
        #                                            , value=defaultValue
        #                                            ).split('\n'))
        textList = st.text_area('BERTopic.transform',key='predictText'
                                                    , value='\n'.join( defaultValue)
                                                    , height=200
                                                   ).split('\n')
        textTopic, textProb = tweetBerTopic.transform(textList)
        st.table(textTopic)
        # textProb

        for id,_ in enumerate(textList):
            st.info(textList[id])
            possitiveTopic = fullTopic.loc[0:]
            possitiveTopic['Probs'] = textProb[id]
            st.table(possitiveTopic.sort_values(by=['Probs'], ascending=False)[:5])

if __name__ == "__main__":
    main()
