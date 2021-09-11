import json
import traceback

from fastapi import Body, FastAPI
from fastapi.middleware.cors import CORSMiddleware
import multiprocessing
import main
import main3
import myFirebase

class MyFast (FastAPI):
    cache = {}
    def __init__(self):
        FastAPI.__init__(self)
        myfirebase = myFirebase.MyFirebaseService()
        myfirebase.updateLocalDbState(self.cache)
        myfirebase.disconnect()


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
async def loadCach():
    result = []
    for key in app.cache.keys():
        result.append([app.cache[key][0], app.cache[key][1] ])
    return result

@app.get("/cache/count")
async def countCache():
    return len(app.cache)

@app.post("/cache")
async def postToCache(initConfig=Body(...)):
    # print(f'{initConfig}')
    update = json.loads(initConfig)
    app.cache[update['hash']] = [update['acc'], update['text']]


@app.post("/trigger/account")
async def triggerAccount(initConfig=Body(...)):
    result = 'PROCESSING'
    try:
        print(f'{initConfig}')
        default = getDefaultRunConfig()
        # default['twitter']['account'] = json.loads(initConfig)['list']

        # accs = json.loads(initConfig)
        # print(f'{accs=}')
        for acc in initConfig['list'].split(','):
            default['twitter']['account'] = [acc.replace('@','')]
            proc = multiprocessing.Process(target=main.run, args=(default,))
            proc.start()
    except Exception as e:
        result = "FAILED \n" + traceback.print_exc()
    return result


@app.post("/trigger/keyword")
async def triggerKeyword(initConfig):
    default = getDefaultRunConfig()
    default['twitter']['runMode'] = 'keyword'
    default['twitter']['keyword'] = json.loads(initConfig)['list']
    proc = multiprocessing.Process(target=main.run, args=(default,))
    proc.start()
    return "PROCESSING"


@app.post("/trigger/combine")
async def triggerCombine(initConfig):
    default = getDefaultRunConfig()

    # {"account": ["@sahealth","@7newsadelaide"], "keyword": ["mask"]}
    # {"account": ["@7newsadelaide"], "keyword": ["restriction"]}
    update = json.loads(initConfig)
    print(update['account'])
    for x in update['account']:
        print(x)
        default['twitter']['runMode'] = 'combine'
        # default['twitter']['account'] = update['account'].__str__().replace('@','')
        default['twitter']['account'] = [x.replace('@ ', '')]
        default['twitter']['keyword'] = update['keyword']

        # proc = multiprocessing.Process(target=main3.run, args=(default,app.cache))
        # proc.start()
        multiprocessing.Process(target=main3.run, args=(default, app.cache)).start()
    return "PROCESSING"

@app.get("/search/combine")
async def searchCombine(initConfig):
    # {"account": ["@sahealth", "@7newsadelaide"], "keyword": ["mask"]}
    # {"account": ["@ap","@afp"], "keyword": ["BREAKING"]}
    update = json.loads(initConfig)

    accList = update['account']
    kwList = update['keyword']

    hashList = []
    for key in app.cache.keys():
        # print(f'finding for {accList}\'s tweets containing {kwList} in {app.cache[key]}')

        if findElementFromList(accList, app.cache[key][0]) and findKeywordFromText(kwList, app.cache[key][1]):
            hashList.append(key)

    # print(f'found tweets:\n{hashList}')
    return hashList

def findElementFromList(eleList, destList):

    result = False
    for ele in eleList:
        for dest in destList:
            if ele.__eq__(dest):
                result = True
                print('found ' + ele)
                break
    return result

def findKeywordFromText(kwList, text:str):
    result = False
    for kw in kwList:
        if text.find(kw) >= 0:
            print('found ' + kw)
            result = True
            break
    return result


