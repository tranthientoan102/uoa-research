import requests
import tweepy

import myFirebase
from myTwitter import *
from datetime import datetime
import json


# Press the green button in the gutter to run the script.

def run(runConfig, scrapFrom='twitter', demoMode=False):

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
        subRun_kws(api, myfirebase
                   , runConfig[scrapFrom]['keyword']
                   , runConfig[scrapFrom]['outsideTagIsAND']
                   , runConfig[scrapFrom]['tweetLoad']
                   , datetime.now())
    elif runMode == 'account':
        subRun_acc_kws(api, myfirebase
                       , runConfig[scrapFrom]["account"][0]
                       , []
                       , runConfig[scrapFrom]['outsideTagIsAND']
                       , runConfig[scrapFrom]['tweetLoad']
                       , datetime.now()
                       , demoMode)
    elif runMode == 'combine':
        subRun_acc_kws(api, myfirebase
                       , runConfig[scrapFrom]['account'][0]
                       , runConfig[scrapFrom]['keyword']
                       , runConfig[scrapFrom]['outsideTagIsAND']
                       , runConfig[scrapFrom]['tweetLoad']
                       , datetime.now())
    elif runMode == 'full':
        acc = runConfig[scrapFrom][runMode]['account'][0] if len(runConfig[scrapFrom][runMode]['account']) > 0 else ''
        subRun_acc_kws_full(api, myfirebase
                            , acc
                            , runConfig[scrapFrom][runMode]['keyword']
                            , runConfig[scrapFrom]['outsideTagIsAND']
                            , runConfig[scrapFrom][runMode]['tweetLoad']
                            , datetime.now()
                            , False
                            )
    else:
        subRun_acc_kws_30(api, myfirebase)

def subRun_kws(api, myfirebase, kws, outsideTagIsAND, expectingCount, startTime):
    query = buildQuery(kws, outsideTagIsAND )
    print(f'init Tweepy search with keywords {query}')
    counter = 0
    try:
        tmp = 0
        for status in tweepy.Cursor(api.search_tweets
                , q=query
                , tweet_mode="extended"
                , lang='en'
                                    ).items(expectingCount * 5):
            tmp+=1
            tweet = MyTweet2().parse(status._json, query)
            if not myfirebase.checkExisted(tweet.hash):
                print(f'{tweet.hash}')
                myfirebase.insertData(tweet)
                counter += 1
            elif not myfirebase.checkContentIncluded(tweet.hash, 'query'):
                myfirebase.update(tweet.hash, {'query': query})

            # print(f'current insert: {counter}, trigger again with max id = {maxTweetId}')

            if (counter >= expectingCount): break
        print(f'current insert: {counter} (found total {tmp})')
    except Exception as e:
        print(e)

    endTime = datetime.now()
    print(f'done scrapping {counter} tweets with keywords {kws} in {(endTime - startTime).total_seconds()}s')


def subRun_acc_kws(api, myfirebase, acc, kws, outsideTagIsAND, expectingCount, startTime, demoMode=False):
    counter = 0
    query = f'({buildQuery(kws, outsideTagIsAND )}) (from:{acc})'
    maxTweetId = None
    print(f'init Tweepy search: acc=@{acc} with {kws=}')
    toDate = datetime.now()
    try:
        iter=0
        totalCounter = 0
        while (iter < 2):
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
                tweet = MyTweet2().parse(status._json, buildQuery(kws, outsideTagIsAND))
                
                if demoMode:
                    print(tweet.to_dict())
                    # print(toDate.)
                else:
                    if checkTextIncludeKeywords(tweet.text, kws) and not myfirebase.checkExisted(tweet.hash):
                        print(f'{tweet.hash}')
                        myfirebase.insertData(tweet)
                        counter +=1
                    if maxTweetId is None:
                        maxTweetId = tweet.id
                    else:
                        maxTweetId = min(maxTweetId, tweet.id)
                    # toDate = min(toDate, tweet.postAt)

                    if counter >= expectingCount:
                        break

            iter +=1
            print(f'current insert: {counter}, trigger again with max id = {maxTweetId} (found total {totalCounter})')
            if totalCounter == 0: break
    except Exception as e:
        print(e)


    endTime = datetime.now()
    print(f'done scrapping {counter} tweets from @{acc} with {kws} in {(endTime - startTime).total_seconds()}s')

def subRun_acc_kws_full(api, myfirebase
                            , acc, kws, outsideTagIsAND, expectingCount, startTime, demoMode
                        ):
    counter = 0
    # query = f'({buildQuery(kws, outsideTagIsAND )}) (from:{acc})'
    maxTweetId = None

    queryKws = buildQuery(kws, outsideTagIsAND )
    fromAcc = f'(from:{acc})' if len(acc) > 0 else ''
    query = f'{queryKws} {fromAcc}'

    print(f'init Tweepy search FULL: {query}')
    # toDate = datetime.now()
    try:
        # iter=0
        totalCounter=0
        counter = 0
        # while (iter < 1):
        for status in tweepy.Cursor(api.search_full_archive
                                        , label='aiml'
                                        , query=query
                                        # , fromDate='201501010000'
                                        # , maxResults= expectingCount
                                        # , tweet_mode="extended"
                                    ).items(expectingCount):
            # tweet = MyTweet2().parse(status._json, kws)
            # print(tweet.to_dict())
            totalCounter += 1
            if demoMode:
                fname = datetime.now()
                with open(f'./output/{fname}.txt', 'w') as file:
                    file.write(f'{str(status)}\n')
            else:
                try:
                    tweet = MyTweet2().parse(status._json, query)
                    if not myfirebase.checkExisted(tweet.hash):
                        print(f'{queryKws} -> {tweet.hash}')
                        myfirebase.insertData(tweet)
                        counter += 1
                except Exception as e:
                    fname = datetime.now()
                    with open(f'./output/exception_{fname}.txt', 'w') as file:
                        file.write(f'{status._json}\n{e}\n\n')
        print(f'inserted {counter}/{totalCounter} tweets ')

    except Exception as e:
        print(e)

def subRun_acc_kws_30(api, myfirebase
                        # , acc, kws, outsideTagIsAND, expectingCount, startTime, demoMode
                        ):
    counter = 0
    # query = f'({buildQuery(kws, outsideTagIsAND )}) (from:{acc})'
    maxTweetId = None
    print(f'init Tweepy search 30 days')
    kws='"apple"'
    expectingCount = 100
    toDate = datetime.now()
    try:

        totalCounter = 0
        f = open('./output/my_file.txt', 'w')
        for status in tweepy.Cursor(api.search_30_day
                , label='30days'
                , query=kws
                # , fromDate='201101012315'
                # , tweet_mode="extended"
                # , max_id=maxTweetId
                                    # , exclude_replies = True
        ).items(1000):
            # tweet = MyTweet2().parse(status._json, kws)
            # print(tweet.to_dict())
            f.write(str(status))
            print('...')
    except Exception as e:
        print(e)


def checkTextIncludeKeywords(text, keywords):
    result = False
    if len(keywords)==0: return True
    for kw in keywords:
        if text.lower().find(kw.lower()) >=0 :
            result = True
            break
    return result

def buildQuery( kwTags, outsideTagIsAND):
    result = []
    if outsideTagIsAND:
        for kwTag in kwTags:
            tmp = ' OR '.join(kwTag)
            result.append(f'({tmp})' )
        return ' '.join(result)
    else:
        for kwTag in kwTags:
            tmp = ' '.join(kwTag)
            result.append(f'({tmp})' )
        return ' OR '.join(result)

def testAccQuota():
    with open('./config/run.json') as f:
        runConfig = json.load(f)
        scrapFrom= 'twitter'
        auth = tweepy.OAuthHandler(
                runConfig[scrapFrom]["auth"]["consumer_key"]
                , runConfig[scrapFrom]["auth"]["consumer_secret"]
        )
        auth.set_access_token(
                runConfig[scrapFrom]["auth"]["access_token"]
                , runConfig[scrapFrom]["auth"]["access_token_secret"]
        )

        api = tweepy.API(auth)
        print(api.rate_limit_status())



if __name__ == '__main__':
    with open('./config/run.json') as f:
        runconfig = json.load(f)
        runconfig['twitter']['runMode'] = 'full'
        # runconfig['twitter']['account'] = ['elonmusk']
        runconfig['twitter']['full']['account'] = ''
        runconfig['twitter']['full']['keyword'] = [['"national medicines policy"']]
        run(runconfig, demoMode=False)

        # runconfig['twitter']['runMode'] = 'keyword'
        # runconfig['twitter']['keyword'] = [['"medicine policy"']]
        # run(runconfig, demoMode=True)

    # testAccQuota()

