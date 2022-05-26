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


class FastED (FastAPI):
    cache = {}
    def __init__(self):
        super().__init__()
        self.model = EDModel().model

        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = self.model.to(device)



app = FastED()
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
        for i in range(len(data['text'])):
            text = data['text'][i]
            encoding = app.model.tokenizer.encode_plus(
                    text,
                    add_special_tokens=True,
                    max_length=512,
                    return_token_type_ids=False,
                    padding="max_length",
                    return_attention_mask=True,
                    return_tensors='pt',
            )
            _, test_prediction = app.model(encoding["input_ids"], encoding["attention_mask"])

            test_prediction = test_prediction.flatten().numpy()
            print(f'{text}\n{test_prediction}')
            result[i] = []
            for label, prediction in zip(detector.LABEL_COLUMNS, test_prediction):
                if prediction >= detector.THRESHOLD:
                    result[i].append(label)


    except Exception as e:
        # result = ["FAILED"]
        print(traceback.print_exc())

    return result

