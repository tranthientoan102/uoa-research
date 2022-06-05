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


# class FastED (FastAPI):
#     cache = {}
#     def __init__(self):
#         super().__init__()
#         self.model = EDModel().model
#
#         device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
#         self.model = self.model.to(device)
#


# app = FastED()
# app.add_middleware(
#         CORSMiddleware,
#         allow_origins=["*"],
#         allow_credentials=True,
#         allow_methods=["*"],
#         allow_headers=["*"],
# )

model = EDModel().model
