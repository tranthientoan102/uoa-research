import requests
import tweepy

import myFirebase
from myTwitter import *
from datetime import datetime
import json


# Press the green button in the gutter to run the script.

def run(runConfig, scrapFrom='twitter'):

    auth = tweepy.OAuthHandler(
            runConfig[scrapFrom]["auth"]["consumer_key"]
            , runConfig[scrapFrom]["auth"]["consumer_secret"]
    )
    auth.set_access_token(
            runConfig[scrapFrom]["auth"]["access_token"]
            , runConfig[scrapFrom]["auth"]["access_token_secret"]
    )

    api = tweepy.API(auth)
    myfirebase = myFirebase.MyFirebaseService()

    # logFile = open('output/log.txt', 'w')

    # for status in tweepy.Cursor(api.user_timeline
    #         , screen_name='@sahealth'
    #         , tweet_mode="extended"
    #         , exclude_replies=True
    #         ).items(10):
    #     print(status._json, file = demo)
    #     print(status.full_text + '\n' + endTweetMark, file = demo)
    #     print('.')

    # queries = buildTwitterUrl_advanced(
    #         runConfig[scrapFrom]['account']
    #         , runconfig[scrapFrom]['keyword']
    #         , withBase=False
    # )

    query = ''
    apiMethod = None
    runMode = runConfig[scrapFrom]['runMode']
    if runMode=='keyword':
        # query = ' OR '.join(runConfig[scrapFrom]['keyword'])
        # apiMethod = api.search
        # print(f'init Tweepy search with q={query}')
        # counter = 0
        # for status in tweepy.Cursor(apiMethod
        #         , q=query
        #         , tweet_mode="extended"
        #                             ).items(runConfig[scrapFrom]['tweetLoad'] * 3):
        #     tweet = MyTweet2().parse(status._json)
        #     print(tweet.to_dict())
        #     if not myfirebase.checkExisted(tweet.hash):
        #         myfirebase.insertData(tweet)
        #         counter += 1
        #     if (counter >= runConfig[scrapFrom]['tweetLoad']): break
        # print(f'done scrapping {counter} tweets with q={query}')
        subRun_kws(api, myfirebase, runConfig[scrapFrom]['keyword'], runConfig[scrapFrom]['tweetLoad'], datetime.now())

    elif runMode=='account':
        subRun_acc_kws(api, myfirebase, runConfig[scrapFrom]["account"][0], [], runConfig[scrapFrom]['tweetLoad'], datetime.now())
    else:
        subRun_acc_kws(api, myfirebase, runConfig[scrapFrom]['account'][0], runConfig[scrapFrom]['keyword'], runConfig[scrapFrom]['tweetLoad'], datetime.now())

def subRun_kws(api, myfirebase, kws, expectingCount, startTime):
    query = ' OR '.join(kws)
    print(f'init Tweepy search with keywords {query}')
    counter = 0
    try:
        tmp = 0
        for status in tweepy.Cursor(api.search
                , q=query
                , tweet_mode="extended"
                                    ).items(expectingCount * 5):
            tmp+=1
            tweet = MyTweet2().parse(status._json)
            if not myfirebase.checkExisted(tweet.hash):
                print(f'{tweet.hash}')
                myfirebase.insertData(tweet)
                counter += 1

            # print(f'current insert: {counter}, trigger again with max id = {maxTweetId}')

            if (counter >= expectingCount): break
        print(f'current insert: {counter} (found total {tmp})')
    except Exception as e:
        print(e)

    endTime = datetime.now()
    print(f'done scrapping {counter} tweets with keywords {kws} in {(endTime - startTime).total_seconds()}s')

# def subRun_acc(api, myfirebase, acc, expectingCount, startTime):
#     print(f'init Tweepy search with acc={acc}')
#     counter = 0
#
#     maxTweetId = None
#     try:
#         while (counter < expectingCount):
#             for status in tweepy.Cursor(api.user_timeline
#                     # , query
#                     , screen_name=acc
#                     , tweet_mode="extended"
#                     , max_id= maxTweetId
#                     # , exclude_replies = True
#                     ).items(expectingCount * 3):
#                 tweet = MyTweet2().parse(status._json)
#
#
#                 if not myfirebase.checkExisted(tweet.hash):
#                     print(f'{tweet.hash}')
#                     myfirebase.insertData(tweet)
#                     counter +=1
#                 if (maxTweetId == None): maxTweetId = tweet.id
#                 else: maxTweetId = min(maxTweetId, tweet.id)
#
#                 if (counter >= expectingCount): break
#             print(f'current insert: {counter}, trigger again with max id = {maxTweetId}')
#     except Exception as e:
#         print(e)
#
#     endTime = datetime.now()
#     print(f'done scrapping {counter} tweets from @{acc} in {(endTime - startTime).total_seconds()}s')

def subRun_acc_kws(api, myfirebase, acc, kws, expectingCount, startTime):
    counter = 0

    query = f'({" OR ".join(kws)}) (from:{acc})'
    maxTweetId = None
    print(f'init Tweepy search: @{acc} with {kws}')
    toDate = datetime.now()
    try:
        totalCounter = 0
        while (counter < expectingCount):


            for status in tweepy.Cursor(api.user_timeline
                    # , query
                    , screen_name=acc
                    , tweet_mode="extended"
                    , max_id= maxTweetId
                    # , exclude_replies = True
                    ).items(expectingCount * 3):

            # query = f'({" OR ".join(kws)}) (from:{acc}) (until:{toDate.year}-{toDate.month}-{toDate.day})'
            # print(f'{query=}')
            # for status in tweepy.Cursor(api.search
            #         , q=query
            #         # , screen_name=acc
            #         , tweet_mode="extended"
            #         # , max_id= maxTweetId
            #         # , exclude_replies = True
            #         ).items(expectingCount * 3):

                totalCounter += 1
                tweet = MyTweet2().parse(status._json)


                if checkTextIncludeKeywords(tweet.text, kws) and not myfirebase.checkExisted(tweet.hash):
                    print(f'{tweet.hash}')
                    myfirebase.insertData(tweet)
                    counter +=1
                if (maxTweetId == None): maxTweetId = tweet.id
                else: maxTweetId = min(maxTweetId, tweet.id)
                # toDate = min(toDate, tweet.postAt)

                if (counter >= expectingCount): break

            print(f'current insert: {counter}, trigger again with max id = {maxTweetId} (found total {totalCounter})')
            # print(f'current insert: {counter} (last round found {tmp})')
            if totalCounter == 0: break
    except Exception as e:
        print(e)


    endTime = datetime.now()
    print(f'done scrapping {counter} tweets from @{acc} with {kws} in {(endTime - startTime).total_seconds()}s')

def checkTextIncludeKeywords(text, keywords):
    result = False
    if len(keywords)==0: return True
    for kw in keywords:
        if text.lower().find(kw.lower()) >=0 :
            result = True
            break
    return result

if __name__ == '__main__':
    with open('./config/run.json') as f:
        runconfig = json.load(f)
    run(runconfig)
