import json
import traceback

import numpy
import torch
from fastapi import Body, FastAPI
from fastapi.middleware.cors import CORSMiddleware

# from KwDetector import *


from transformers import BertTokenizer, BertForSequenceClassification, Trainer



class FastSA (FastAPI):
    cache = {}
    def __init__(self):
        FastAPI.__init__(self)

        with open('./config/run.json') as f:
            self.config = json.load(f)

        model_name = self.config['runningModel']['base_model_name']
        num_labels = self.config['runningModel']['num_labels']
        path = f"{self.config['runningModel']['path']}/state_dict.pt"

        self.tokenizer = BertTokenizer.from_pretrained(model_name)
        model = BertForSequenceClassification.from_pretrained(model_name, num_labels=num_labels)
        model.load_state_dict(torch.load(path, map_location=torch.device('cpu')))

        self.classifier = Trainer(model)

        # self.detector = KwDetector()


app = FastSA()
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

# Create torch dataset
class Dataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels=None):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        if self.labels:
            item["labels"] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.encodings["input_ids"])

def buildDataset (tweetList:[str]):
    tokenized = app.tokenizer(tweetList, padding=True, truncation=True, max_length= app.config['runningModel']['max_length'])
    return Dataset(tokenized)


@app.get("/")
async def root():
    return {"message": "Hello World"}




@app.post("/predict")
async def predictTweet(data=Body(...)):
    # {"text": ["this is so beautiful"]}
    # result = 'PROCESSING'
    result = ['ERROR'] * len(data['text'])

    # for a in data['text']: print(f'***{a}\n')
    try:
        dataset = buildDataset(data['text'])
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


    # final = {"result":result}
    # print(final)
    # return JSONResponse(final)



#
# @app.post("/trigger/combine")
# async def triggerCombine(initConfig=Body(...)):
#     default = getDefaultRunConfig()
#
#     # {"account": ["@sahealth","@7newsadelaide"], "keyword": ["mask"]}
#     # {"account": ["@7newsadelaide"], "keyword": ["restriction"]}
#     # {"account": ["@ap","@afp"], "keyword": ["BREAKING"]}
#
#     # update = json.loads(initConfig)
#     # print(update['account'])
#     for x in initConfig['account']:
#         print(x)
#         default['twitter']['runMode'] = 'combine'
#         # default['twitter']['account'] = update['account'].__str__().replace('@','')
#         default['twitter']['account'] = [x.replace('@', '')]
#         default['twitter']['keyword'] = initConfig['keyword']
#
#         # proc = multiprocessing.Process(target=main3.run, args=(default,app.cache))
#         # proc.start()
#         # multiprocessing.Process(target=main3.run, args=(default, app.cache)).start()
#         multiprocessing.Process(target=main2.run, args=(default,)).start()
#     return "PROCESSING"
#
# @app.get("/search/combine")
# async def searchCombine(initConfig):
#     # {"account": ["@sahealth", "@7newsadelaide"], "keyword": ["mask"]}
#     # {"account": ["@ap","@afp"], "keyword": ["BREAKING"]}
#
#     update = json.loads(initConfig)
#     print(f'initConfig: {update}')
#     accList = update['account']
#     kwList = update['keyword']
#
#     hashList = []
#     for key in app.cache.keys():
#         # print(f'finding for {accList}\'s tweets containing {kwList} in {app.cache[key]}')
#
#         if findElementFromList(accList, app.cache[key][0]) and findKeywordFromText(kwList, app.cache[key][2]):
#             hashList.append(key)
#
#     print(f'found {len(hashList)} tweets')
#     return hashList
#
#
# def findElementFromList(eleList, destList):
#
#     result = False
#     if len(eleList)==0: result = True
#     for ele in eleList:
#         for dest in destList:
#             if ele.__eq__(dest):
#                 result = True
#                 # print('found ' + ele)
#                 break
#     return result
#
# def findKeywordFromText(kwList, text:str):
#     result = False
#     if len(kwList) == 0: result = True
#     else :
#         for kw in kwList:
#             if text.lower().find(kw.lower()) >= 0:
#                 # print('found ' + kw)
#                 result = True
#                 break
#     return result


