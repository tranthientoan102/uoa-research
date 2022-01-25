import json
import traceback

from fastapi import Body, FastAPI
from fastapi.middleware.cors import CORSMiddleware
import multiprocessing

import main2
import main3


class MyFast (FastAPI):
    cache = {}
    def __init__(self):
        FastAPI.__init__(self)
        # self.updateCache()

    # def updateCache(self):
    #     myfirebase = myFirebase.MyFirebaseService()
    #     myfirebase.updateLocalDbState(self.cache)
    #     myfirebase.disconnect()


app = MyFast()
app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
)



def getDefaultRunConfig():
    with open('./config/run.json')as f:
        default = json.load(f)
    return default


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/cache")
async def loadCache():
    result = []
    for key in app.cache.keys():
        # result.append([app.cache[key][0], app.cache[key][1]])
        result.append([key, app.cache[key]])
    return result

@app.get("/cache/count")
async def countCache():
    return len(app.cache)

@app.post("/cache")
async def postToCache(initConfig=Body(...)):
    # print(f'{initConfig}')
    update = json.loads(initConfig)
    app.cache[update['hash']] = [update['acc'], update['postAt'], update['text']]

@app.delete("/cache")
async def clearCache():
    app.cache.clear()
    # app.updateCache()

@app.post("/trigger/account")
async def triggerAccount(initConfig=Body(...)):
    result = 'PROCESSING'
    try:
        print(f'{initConfig}')
        default = getDefaultRunConfig()
        # default['twitter']['account'] = json.loads(initConfig)['list']

        # accs = json.loads(initConfig)
        # print(f'{accs=}')
        default['twitter']['runMode'] = 'account'
        for acc in initConfig['list'].split(','):
            default['twitter']['account'] = [acc.replace('@','')]
            proc = multiprocessing.Process(target=main2.run, args=(default,))
            proc.start()
    except Exception as e:
        result = "FAILED \n" + traceback.print_exc()
    return result


@app.post("/trigger/keyword")
async def triggerKeyword(initConfig=Body(...)):
    result = 'PROCESSING'
    try:
        default = getDefaultRunConfig()
        default['twitter']['runMode'] = 'keyword'
        # default['twitter']['keyword'] = json.loads(initConfig)['list']
        default['twitter']['keyword'] = initConfig['list']
        multiprocessing.Process(target=main2.run, args=(default,)).start()

    except Exception as e:
        result = "FAILED \n" + traceback.print_exc()
    return result


@app.post("/trigger/combine")
async def triggerCombine(initConfig=Body(...)):
    default = getDefaultRunConfig()

    # {"account": ["@sahealth","@7newsadelaide"], "keyword": ["mask"]}
    # {"account": ["@7newsadelaide"], "keyword": ["restriction"]}
    # {"account": ["@ap","@afp"], "keyword": ["BREAKING"]}

    # update = json.loads(initConfig)
    # print(update['account'])
    for x in initConfig['account']:
        print(x)
        default['twitter']['runMode'] = 'combine'
        # default['twitter']['account'] = update['account'].__str__().replace('@','')
        default['twitter']['account'] = [x.replace('@', '')]
        default['twitter']['keyword'] = initConfig['keyword']
        default['twitter']['outsideTagIsAND'] = initConfig['outsideTagIsAND']

        # proc = multiprocessing.Process(target=main3.run, args=(default,app.cache))
        # proc.start()
        # multiprocessing.Process(target=main3.run, args=(default, app.cache)).start()
        multiprocessing.Process(target=main2.run, args=(default,)).start()
    return "PROCESSING"

@app.post("/trigger/full")
async def triggerFull(initConfig=Body(...)):
    default = getDefaultRunConfig()

    # {"account": ["@sahealth","@7newsadelaide"], "keyword": ["mask"]}
    # {"account": ["@7newsadelaide"], "keyword": ["restriction"]}
    # {"account": ["@ap","@afp"], "keyword": ["BREAKING"]}

    # update = json.loads(initConfig)
    # print(update['account'])

    print(initConfig)

    default['twitter']['runMode'] = 'full'
    # default['twitter']['account'] = update['account'].__str__().replace('@','')
    default['twitter']['full']['account'] = []
    default['twitter']['full']['keyword'] = initConfig['keyword']
    default['twitter']['outsideTagIsAND'] = initConfig['outsideTagIsAND']

    if len(initConfig['account']) > 0:
        for x in initConfig['account']:
            default['twitter']['full']['account'] = [x.replace('@' , '')]
            multiprocessing.Process(target=main2.run, args=(default,)).start()
    else:
        multiprocessing.Process(target=main2.run, args=(default,)).start()

        # proc = multiprocessing.Process(target=main3.run, args=(default,app.cache))
        # proc.start()
        # multiprocessing.Process(target=main3.run, args=(default, app.cache)).start()

    return "PROCESSING"

@app.get("/search/combine")
async def searchCombine(initConfig):
    # {"account": ["@sahealth", "@7newsadelaide"], "keyword": ["mask"]}
    # {"account": ["@ap","@afp"], "keyword": ["BREAKING"]}

    update = json.loads(initConfig)
    print(f'initConfig: {update}')
    accList = update['account']
    kwList = update['keyword']

    hashList = []
    for key in app.cache.keys():
        # print(f'finding for {accList}\'s tweets containing {kwList} in {app.cache[key]}')

        if findElementFromList(accList, app.cache[key][0]) and findKeywordFromText(kwList, app.cache[key][2]):
            hashList.append(key)

    print(f'found {len(hashList)} tweets')
    return hashList

@app.post("/count/recent")
async def countRecent(initConfig=Body(...)):
    default = getDefaultRunConfig()
    default['twitter']['runMode'] = 'countRecent'

    print(initConfig)
    default['twitter']['countRecent']['account'] = []
    default['twitter']['countRecent']['keyword'] = initConfig['keyword']
    default['twitter']['outsideTagIsAND'] = initConfig['outsideTagIsAND']

    return main3.get_recent_tweets_count(default)

def findElementFromList(eleList, destList):

    result = False
    if len(eleList)==0: result = True
    for ele in eleList:
        for dest in destList:
            if ele.__eq__(dest):
                result = True
                # print('found ' + ele)
                break
    return result

def findKeywordFromText(kwList, text:str):
    result = False
    if len(kwList) == 0: result = True
    else :
        for kw in kwList:
            if text.lower().find(kw.lower()) >= 0:
                # print('found ' + kw)
                result = True
                break
    return result

@app.get('/about')
async def about():
    result = []
    with open('./config/firebase.json') as f:
        default = json.load(f)
        result.append(f'firebase: {default["project_id"]}')
    with open('./config/run.json') as f:
        default = json.load(f)
        result.append(f'twitter license: {default["twitter"]["auth"]["consumer_key"]}')
    return result
