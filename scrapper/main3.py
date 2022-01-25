
import json
import tweepy

import myFirebase
# from fast import getDefaultRunConfig
from main2 import buildQuery


def setup(runConfig, scrapFrom='twitter'):
    api = tweepy.Client(runConfig[scrapFrom]["auth"]["bearer_token"])
    myfirebase = myFirebase.MyFirebaseService()
    return api, myfirebase

def get_recent_tweets_count(runConfig, scrapFrom='twitter', demoMode=False):
    api, myfirebase = setup(runConfig)
    runMode = runConfig[scrapFrom]["runMode"]
    query = buildQuery(runConfig[scrapFrom][runMode]['keyword']
                            , runConfig[scrapFrom]['outsideTagIsAND'])

    result = api.get_recent_tweets_count(query).meta['total_tweet_count']
    print(f'{query}: {result} times')
    return result


if __name__ == '__main__':
    # runConfig = getDefaultRunConfig()

    with open('./config/run.json')as f:
        config = json.load(f)


        scrapFrom = 'twitter'
        runMode = 'countRecent'

        # auth = tweepy.OAuth2Bearer(
        #         runConfig[scrapFrom]["auth"]["bearer_token"]
        #         # , runConfig[scrapFrom]["auth"]["consumer_secret"]
        # )
        # auth.set_access_token(
        #         runConfig[scrapFrom]["auth"]["access_token"]
        #         , runConfig[scrapFrom]["auth"]["access_token_secret"]
        # )
        #
        # auth = tweepy.AppAuthHandler(runConfig[scrapFrom]["auth"]["consumer_key"]
        #                              , runConfig[scrapFrom]["auth"]["consumer_secret"]
        #                              )

        api = tweepy.Client(config[scrapFrom]["auth"]["bearer_token"])
        query = buildQuery(config[scrapFrom][runMode]['keyword'], config[scrapFrom]['outsideTagIsAND'])

        print(query)
        result = get_recent_tweets_count(config)
        # result = api.get_recent_tweets_count(query=query, granularity='day')
        print(result)
        # print(result.meta['total_tweet_count'])


