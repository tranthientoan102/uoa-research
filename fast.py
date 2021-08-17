import json
from fastapi import FastAPI

import main


app = FastAPI()

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


@app.put("/trigger/account")
async def triggerAccount(initConfig):
    default = getDefaultRunConfig()
    default['twitter']['account'] = json.loads(initConfig)
    return main.run(default)

@app.put("/trigger/keyword")
async def triggerKeyword(initConfig):
    default = getDefaultRunConfig()
    default['twitter']['runMode'] = 'keyword'
    default['twitter']['keyword'] = json.loads(initConfig)
    print(default)
    print()
    return main.run(default)
