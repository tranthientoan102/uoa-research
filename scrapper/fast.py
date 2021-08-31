import json
import traceback

from fastapi import Body, FastAPI
from fastapi.middleware.cors import CORSMiddleware
import multiprocessing
import main

app = FastAPI()
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


@app.get("/items/{item_id}")
async def read_item(item_id):
    return {"item_id": item_id}


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