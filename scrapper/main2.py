import requests
import tweepy

import myFirebase
from myTwitter import *
from datetime import datetime, timedelta
import json


# Press the green button in the gutter to run the script.

def run(runConfig, scrapFrom='twitter', demoMode=False):

    # with open('./config/backup_run.json') as f:
    # # with open('./config/run.json') as f:
    #     authConfig = json.load(f)

    auth = tweepy.OAuthHandler(
            authConfig[scrapFrom]["auth"]["consumer_key"]
            , authConfig[scrapFrom]["auth"]["consumer_secret"]
    )
    auth.set_access_token(
            authConfig[scrapFrom]["auth"]["access_token"]
            , authConfig[scrapFrom]["auth"]["access_token_secret"]
    )

    api = tweepy.API(auth)
    myfirebase = myFirebase.MyFirebaseService()


    query = ''
    apiMethod = None
    runMode = runConfig[scrapFrom]['runMode']
    if runMode=='keyword':
        subRun_kws(api, myfirebase
                   , runConfig[scrapFrom]['keyword']
                   , runConfig[scrapFrom]['outsideTagIsAND']
                   , runConfig[scrapFrom]['tweetLoad']
                   , datetime.now()
                   , demoMode)
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
        # acc = runConfig[scrapFrom][runMode]['account'][0] if len(runConfig[scrapFrom][runMode]['account']) > 0 else ''
        subRun_acc_kws_full(api, myfirebase
                            , runConfig[scrapFrom][runMode]['account']
                            , runConfig[scrapFrom][runMode]['keyword']
                            , runConfig[scrapFrom]['outsideTagIsAND']
                            , runConfig[scrapFrom][runMode]['tweetLoad']

                            , runConfig[scrapFrom][runMode]['fromDate']
                            , runConfig[scrapFrom][runMode]['toDate']

                            , demoMode
                            )
    elif runMode == '30days':
        subRun_acc_kws_30(api, myfirebase
                          , runConfig[scrapFrom][runMode]['account']
                          , runConfig[scrapFrom][runMode]['keyword']
                          , runConfig[scrapFrom]['outsideTagIsAND']
                          , runConfig[scrapFrom][runMode]['tweetLoad']

                          , runConfig[scrapFrom][runMode]['fromDate']
                          , runConfig[scrapFrom][runMode]['toDate']

                          , demoMode
                          )
    else:
        subRun_acc_kws_recent(api, myfirebase
                          , runConfig[scrapFrom][runMode]['account']
                          , runConfig[scrapFrom][runMode]['keyword']
                          , runConfig[scrapFrom]['outsideTagIsAND']
                          , runConfig[scrapFrom][runMode]['tweetLoad']

                        #   , runConfig[scrapFrom][runMode]['fromDate']
                        #   , runConfig[scrapFrom][runMode]['toDate']

                          , demoMode
                          )


def subRun_kws(api, myfirebase, kws, outsideTagIsAND, expectingCount, startTime, demoMode):
    query = buildQuery(kws, outsideTagIsAND )
    print(f'init Tweepy search with keywords {query}')
    counter = 0
    try:
        tmp = 0
        for status in tweepy.Cursor(api.search_tweets
                , q=query
                , tweet_mode="extended"
                , lang='en'
                , result_type='popular'
                                    ).items(expectingCount * 5):
            tmp += 1
            if demoMode:
                # print(f'${status._json}\n\n')
                tweet = MyTweet2().parse(status._json, query)
                print(tweet.to_dict())
            else :
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
                    print(status._json)
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
                            , acc, kws, outsideTagIsAND, expectingCount, fromDate, toDate, demoMode
                        ):
    counter = 0
    # query = f'({buildQuery(kws, outsideTagIsAND )}) (from:{acc})'
    maxTweetId = None

    if fromDate: fromDate = datetime.fromisoformat(fromDate).strftime('%Y%m%d%H%M')
    if toDate: toDate = datetime.fromisoformat(toDate).strftime('%Y%m%d%H%M')

    queryKws = buildQuery(kws, outsideTagIsAND )

    # fromAcc = f'(from:{acc})' if len(acc) > 0 else ''
    fromAcc = f"({' OR '.join(list(map(lambda x: f'from:{x}', acc)))})"
    # fromAcc = ' OR '.join(list(map(lambda x: f'from:{x}', acc)))

    query = f'{queryKws} {fromAcc}'

    print(f'init Tweepy search FULL: {query} ; {fromDate} -> {toDate}')
    # toDate = datetime.now()
    try:
        # iter=0
        totalCounter=0
        counter = 0
        # while (iter < 1):
        for status in tweepy.Cursor(api.search_full_archive
                                        , label='aiml'
                                        , query=query
                                        , fromDate=fromDate
                                        , toDate=toDate
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
                        , accs, kws, outsideTagIsAND, expectingCount, fromDate, toDate, demoMode
                        ):
    counter = 0
    # query = f'({buildQuery(kws, outsideTagIsAND )}) (from:{acc})'
    maxTweetId = None
    print(f'init Tweepy search 30 days')

    if fromDate: fromDate = datetime.fromisoformat(fromDate).strftime('%Y%m%d%H%M')
    else:
        fd = datetime.now() - timedelta(days=14)
        fromDate = fd.strftime('%Y%m%d%H%M')

    if toDate: toDate = datetime.fromisoformat(toDate).strftime('%Y%m%d%H%M')
    else:
        td = datetime.now() - timedelta(days=7)
        toDate = td.strftime('%Y%m%d%H%M')

    queryKws = buildQuery(kws, outsideTagIsAND )

    fromAccs = buildQuery_accs(accs)
    # fromAcc = ' OR '.join(list(map(lambda x: f'from:{x}', acc)))

    query = f'{queryKws} {fromAccs}'

    print(f'init Tweepy search 30 days: {query} ; from {fromDate} to {toDate}')


    # expectingCount = 100
    # toDate = datetime.now()
    try:

        totalCounter = 0
        fname = f"./output/30-{datetime.now().strftime('%Y%m%d%H%M')}.txt"
        f = open(fname, 'w')

        for status in tweepy.Cursor(api.search_30_day
                , label='30days'
                , query=query
                , fromDate=fromDate
                , toDate=toDate

        ).items(expectingCount):
            totalCounter += 1


            # fname = f'./output/30-{datetime.now()}.txt'
            if demoMode:
                f.write(f'{str(status)}\n')
            else:
                try:
                    tweet = MyTweet2().parse(status._json, query)
                    if not myfirebase.checkExisted(tweet.hash):
                        tmp = f'{queryKws} -> {tweet.hash} , {tweet.postAt}'
                        print(tmp)
                        f.write(tmp+'\n')
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

def subRun_acc_kws_recent(api, myfirebase
                        , accs, kws, outsideTagIsAND, expectingCount
                        # , fromDate, toDate
                        , demoMode
                        ):
    counter = 0
    # query = f'({buildQuery(kws, outsideTagIsAND )}) (from:{acc})'
    maxTweetId = None
    print(f'init Tweepy SearchRecent')
    queryKws = buildQuery(kws, outsideTagIsAND )

    fromAccs = buildQuery_accs(accs)
    # fromAcc = ' OR '.join(list(map(lambda x: f'from:{x}', acc)))

    query = f'{queryKws} {fromAccs}'

    print(f'init Tweepy search RECENT: {query}, {expectingCount=}')

    try:

        totalCounter = 0
        fname = f"./output/recent-{datetime.now().strftime('%Y%m%d%H%M')}.txt"
        f = open(fname, 'w')

        for status in tweepy.Cursor(api.search_tweets
                , q=query
                , tweet_mode="extended"
                , lang='en'
                # , result_type='popular'
        ).items(expectingCount):
            totalCounter += 1

            if demoMode:
                f.write(f'{str(status)}\n')
            else:
                try:
                    tweet = MyTweet2().parse(status._json, query)
                    if not myfirebase.checkExisted(tweet.hash):
                        tmp = f'{queryKws} -> {tweet.hash} , {tweet.postAt}'
                        print(tmp)
                        f.write(tmp+'\n')
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
            result.append(f'({tmp})')
        return ' OR '.join(result)
def buildQuery_accs (accs):
    return f"({' OR '.join(list(map(lambda x: f'from:{x}', accs)))})" if len(accs) > 0 else ''

def checkAccQuota():
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


def buildConfig_30(fromDate, toDate):
    with open('./config/run.json') as f:
        runconfig = json.load(f)
        runMode = '30days'
        runconfig['twitter']['runMode'] = runMode
        runconfig['twitter'][runMode]['account'] = [
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
        # runconfig['twitter'][runMode]['account'] = []
        runconfig['twitter'][runMode]['keyword'] = [
                ["auspol", "ausvotes"]
        ]
        fromDateStr = fromDate.isoformat().split('T')[0]
        toDateStr = toDate.isoformat().split('T')[0]
        runconfig['twitter'][runMode]['fromDate'] = f'{fromDateStr}T00:00:00'
        runconfig['twitter'][runMode]['toDate'] = f'{toDateStr}T23:59:59'
    return runconfig

def buildConfig_searchRecent():
    with open('./config/run.json') as f:
        runconfig = json.load(f)
        runMode = 'searchRecent'
        runconfig['twitter']['runMode'] = runMode

        runconfig['twitter'][runMode]['account'] = [
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
        # runconfig['twitter'][runMode]['account'] = []

    return runconfig

def run30():
    # fromDateStr = ''
    delta = 30
    toDate = datetime.fromisoformat('2022-05-26')
    fromDate = toDate - timedelta(days=delta)

    runconfig = buildConfig_30(fromDate, toDate)
    run(runconfig, demoMode=False)

def runSearchRecent():
    runconfig = buildConfig_searchRecent()

    run(runconfig, demoMode=False)

if __name__ == '__main__':
    run30()
    # runSearchRecent()
    # testAccQuota()

    # print(datetime.now().isoformat())
    # dt = datetime.fromisoformat('2022-05-18')
    # dt2 = dt -timedelta(days=2)
    # print(dt2.isoformat())



