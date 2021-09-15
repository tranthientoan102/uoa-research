import requests
import tweepy

import myFirebase
from myTwitter import *
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
    runMode = runConfig[scrapFrom]['runMode']
    if runMode=='keyword':
        query = ' OR '.join(runConfig[scrapFrom]['keyword'])
    elif runMode=='account':
        tmp = [f'from:{x}' for x in runConfig[scrapFrom]["account"]]
        query = ' OR '.join(tmp)
    print(f'init Tweepy search with q={query}')
    counter = 0
    for status in tweepy.Cursor(api.search
            , q=query
            , tweet_mode="extended"
            ).items(runConfig[scrapFrom]['tweetLoad']):
        tweet = MyTweet2().parse(status._json)

        if not myfirebase.checkExisted(tweet.hash):
            myfirebase.insertData(tweet)
            counter +=1
            print(tweet.to_dict())
    print(f'done scrapping {counter} tweets with q={query}')


if __name__ == '__main__':
    with open('./config/run.json') as f:
        runconfig = json.load(f)
    run(runconfig)
