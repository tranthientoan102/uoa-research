
import json
from datetime import datetime

import tweepy

import myFirebase

from main2 import buildQuery

from scrapper.myTwitter import MyTweet2


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

def subRun_acc_kws_fullArchive(api, myfirebase
                        , acc, kws, outsideTagIsAND, expectingCount, fromDate, toDate, demoMode
                        ):
    counter = 0
    # query = f'({buildQuery(kws, outsideTagIsAND )}) (from:{acc})'
    maxTweetId = None
    print(f'init Tweepy search 30 days')

    if fromDate: fromDate = datetime.fromisoformat(fromDate).strftime('%Y%m%d%H%M')
    if toDate: toDate = datetime.fromisoformat(toDate).strftime('%Y%m%d%H%M')

    queryKws = buildQuery(kws, outsideTagIsAND )

    fromAcc = f"({' OR '.join(list(map(lambda x: f'from:{x}', acc)))})"
    # fromAcc = ' OR '.join(list(map(lambda x: f'from:{x}', acc)))

    query = f'{queryKws} {fromAcc}'

    print(f'init Tweepy search 30 days: {query} ; from {fromDate} to {toDate}')


    # expectingCount = 100
    # toDate = datetime.now()
    try:

        totalCounter = 0
        fname = f"./output/30-{datetime.now().strftime('%Y%m%d%H%M')}.txt"
        f = open(fname, 'w')

        # for status in tweepy.Cursor(api.search_all_tweets
        #         , label='fullArchive'
        #         , query=query
        #         , fromDate=fromDate
        #         , toDate=toDate
        #
        # ).items(expectingCount):
        for status in api.search_all_tweets(
                query=query
                # , label='fullArchive'
                # , fromDate=fromDate
                # , toDate=toDate

                                    ):

            totalCounter += 1


            # fname = f'./output/30-{datetime.now()}.txt'
            if demoMode:
                f.write(f'{str(status)}\n')
            else:
                try:
                    tweet = MyTweet2().parse(status._json, query)
                    if not myfirebase.checkExisted(tweet.hash):
                        print(f'{queryKws} -> {tweet.hash}')
                        f.write(f'{queryKws} -> {tweet.hash}')
                        myfirebase.insertData(tweet)
                        counter += 1
                except Exception as e:
                    fname = datetime.now()
                    with open(f'./output/exception_{fname}.txt', 'w') as file:
                        file.write(f'{status._json}\n{e}\n\n')

        f.close()
        print(f'inserted {counter}/{totalCounter} tweets ')

    except Exception as e:
        print(e)

def testAll():
    scrapFrom = 'twitter'
    demoMode = False
    # runFunction = subRun_acc_kws_fullArchive

    with open('./config/run.json') as f:
        runConfig = json.load(f)

        runMode = '30days'
        runConfig['twitter']['runMode'] = runMode
        runConfig['twitter'][runMode]['account'] = [
                "ABCaustralia"
                , "abcnews"
                , "9NewsAUS"
                , "10NewsFirst"
                , "SBSNews"
                , "GuardianAus"
                , "SkyNewsAust"
                , "AustralianLabor"
                , "LiberalAus"
            ]
        runConfig['twitter'][runMode]['keyword'] = [
               ["auspol", "vote", "election" , "Liberal", "Labor"]
            ]

        api, myfirebase = setup(runConfig)

        subRun_acc_kws_fullArchive(api,myfirebase
                          , runConfig[scrapFrom][runMode]['account']
                          , runConfig[scrapFrom][runMode]['keyword']
                          , runConfig[scrapFrom]['outsideTagIsAND']
                          , runConfig[scrapFrom][runMode]['tweetLoad']

                          , None
                          # , runConfig[scrapFrom][runMode]['fromDate']
                          , None
                          # , runConfig[scrapFrom][runMode]['toDate']

                          , demoMode

                          )


if __name__ == '__main__':
    testAll()


