
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

def get_recent_tweets_withExtraInfo(runConfig, scrapFrom='twitter', demoMode=False):
    tweet_fields = ['public_metrics']
    place_fields = ['contained_within', 'country', 'country_code', 'full_name', 'geo', 'id', 'name', 'place_type']
    expansions = ['geo.place_id']

    api, myfirebase = setup(runConfig)
    runMode = runConfig[scrapFrom]["runMode"]
    print(runMode)

    fromAccTmp = []
    for a in config[scrapFrom][runMode]['account']:
        fromAccTmp.append(f'from:{a}')
    fromAcc = ' OR '.join(fromAccTmp)
    queryTmp = buildQuery(runConfig[scrapFrom][runMode]['keyword']
                            , runConfig[scrapFrom]['outsideTagIsAND'])

    query = '' if queryTmp == '()' else queryTmp
    print(f'({fromAcc}) {query}')

    result = api.search_recent_tweets(query=f'{fromAcc} {query}', tweet_fields=tweet_fields
                                      , place_fields=place_fields
                                      , expansions=expansions
                                      )
    # result = api.search_recent_tweets(query=query, tweet_fields=tweet_fields, place_fields=place_fields)

    # print(f'{query}: {result} times')
    return result


if __name__ == '__main__':
    # runConfig = getDefaultRunConfig()

    with open('./config/run.json')as f:
        config = json.load(f)


        scrapFrom = 'twitter'
        runMode = 'full'
        config[scrapFrom]["runMode"] = 'full'


        api = tweepy.Client(config[scrapFrom]["auth"]["bearer_token"])

        fromAccTmp = []
        for a in config[scrapFrom][runMode]['account']:
            fromAccTmp.append(f'from:{a}')
        fromAcc = ' OR '.join(fromAccTmp)
        query = fromAcc + ' ' + buildQuery(config[scrapFrom][runMode]['keyword'], config[scrapFrom]['outsideTagIsAND'])

        print(query)

        result = get_recent_tweets_withExtraInfo(config)
        # result = api.get_recent_tweets_count(query=query, granularity='day')

        print(result)
        print('\n\n\n')

        for r in result.data:

            print(f'{r}\n{r["public_metrics"]}\n{r["geo"]} \n\n')
            # print(f'{r["public_metrics"]}')

        print('\n\n')
        for r in result.includes["places"]:

            print(f'{r["id"]}: {r},{r["country"]}')



