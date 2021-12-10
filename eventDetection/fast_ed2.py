import json
import traceback
import numpy
import pandas as pd
import torch

from torch.utils.data import Dataset, DataLoader
import pytorch_lightning as pl

from fastapi import Body, FastAPI
from fastapi.middleware.cors import CORSMiddleware

# from KwDetector import *


from transformers import BertTokenizer, BertForSequenceClassification, Trainer

import detector
from EDModel import EDModel
from ModelNeroED import ModelNeroED


class FastED2 (FastAPI):
    cache = {}
    def __init__(self):
        super().__init__()

        with open('./config/run.json') as f:
            self.config = json.load(f)

        base_model_name = self.config['runningModel']['base_model_name']
        path = f"{self.config['runningModel']['path']}"

        self.tokenizer = BertTokenizer.from_pretrained(base_model_name)
        self.model = ModelNeroED(base_model_name, path)
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        # self.model = self.model.to(device)



app = FastED2()
app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
)



# def getDefaultRunConfig():
#     with open('./config/run.json')as f:
#         default = json.load(f)
#     return default


@app.get("/")
async def root():
    return {"message": "Hello World"}




@app.post("/predict")
async def predictTweet(data=Body(...)):
    # {"text": ["this is so beautiful"]}
    # result = 'PROCESSING'
    result = [['ERROR']] * len(data['text'])

    # for a in data['text']: print(f'***{a}\n')
    try:
        dataLoader = app.model.create_data_loader(data['text'])
        preds = app.model.get_predictions(dataLoader)

        for i,p in enumerate(preds):
            t = data['text'][i]
            result[i] = preds[i]
            print(f'{t}\n{result[i]}')


    except Exception as e:
        # result = ["FAILED"]
        print(traceback.print_exc())

    return result

