import json
import traceback

import numpy
import torch
from fastapi import Body, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from torch import nn, optim
from torch.utils.data import Dataset, DataLoader

from transformers import BertTokenizer, BertForSequenceClassification, Trainer, BertModel


class FastSA2 (FastAPI):
    cache = {}
    def __init__(self):
        FastAPI.__init__(self)

        max_len = 300
        class_names = ['negative', 'neutral', 'positive']

        with open('./config/run.json') as f:
            self.config = json.load(f)

        model_name = self.config['runningModel']['base_model_name']
        num_labels = self.config['runningModel']['num_labels']
        path = f"{self.config['runningModel']['path']}"

        self.tokenizer = BertTokenizer.from_pretrained(model_name)

        # model = BertForSequenceClassification.from_pretrained(model_name, num_labels=num_labels)
        # model.load_state_dict(torch.load(path, map_location=torch.device('cpu')))
        self.model = SentimentClassifier(num_labels, model_name)
        self.model.load_state_dict(torch.load(path))

        # self.classifier = Trainer(model)


app = FastSA2()
app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
)


class GPReviewDataset(Dataset):

    def __init__(self, reviews, targets, tokenizer, max_len):
        self.reviews = reviews
        self.targets = targets
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.reviews)

    def __getitem__(self, item):
        review = str(self.reviews[item])
        target = self.targets[item]

        encoding = self.tokenizer.encode_plus(
                review,
                add_special_tokens=True,
                max_length=self.max_len,
                return_token_type_ids=False,
                padding='max_length',
                truncation=True,
                return_attention_mask=True,
                return_tensors='pt',
        )

        return {
            'review_text'   : review,
            'input_ids'     : encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'targets'       : torch.tensor(target, dtype=torch.long)
        }


class SentimentClassifier(nn.Module):

    def __init__(self, n_classes, model_name):
        super(SentimentClassifier, self).__init__()
        self.bert = BertModel.from_pretrained(model_name)
        # self.drop = nn.Dropout(p=0.1)
        # self.relu = nn.ReLU()
        # self.L1 = nn.Linear(self.bert.config.hidden_size,self.bert.config.hidden_size//2)
        self.out = nn.Linear(self.bert.config.hidden_size, n_classes)

    def forward(self, input_ids, attention_mask):
        pooled_output = self.bert(
                input_ids=input_ids,
                attention_mask=attention_mask
        )[1]

        # output = self.drop(pooled_output)
        # # output = self.L1(output)
        output = self.out(pooled_output)

        return output



@app.post("/predict")
async def predictTweet(data=Body(...)):
    # {"text": ["this is so beautiful"]}
    # result = 'PROCESSING'
    result = ['ERROR'] * len(data['text'])

    # for a in data['text']: print(f'***{a}\n')
    try:
        dataset = app.create_data_loader(data['text'])
        pred, _, _ = app.classifier.predict(dataset)
        for i in range(len(data['text'])):
            print(f"{pred[i]}\t{data['text'][i]}")
            result[i] = app.config['runningModel']['labels'][(str(numpy.argmax(pred[i])))]
            # result[i] = numpy.argmax(pred[i])

    except Exception as e:
        # result = ["FAILED"]
        print(traceback.print_exc())
    # print(result)
    return result
    # return {"result":result}

