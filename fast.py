import json
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
    # initConfig = Body(...)
    print(f'{initConfig}')
    default = getDefaultRunConfig()
    # default['twitter']['account'] = json.loads(initConfig)['list']
    default['twitter']['account'] = initConfig['list']
    proc = multiprocessing.Process(target=main.run, args=(default,))
    proc.start()
    return "PROCESSING"


@app.post("/trigger/keyword")
async def triggerKeyword(initConfig):
    default = getDefaultRunConfig()
    default['twitter']['runMode'] = 'keyword'
    default['twitter']['keyword'] = json.loads(initConfig)['list']
    proc = multiprocessing.Process(target=main.run, args=(default,))
    proc.start()
    return "PROCESSING"