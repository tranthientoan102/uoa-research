import json
import traceback

from fastapi import Body, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ModelNero import *


from transformers import BertTokenizer


class FastSA2 (FastAPI):
    cache = {}
    def __init__(self):
        FastAPI.__init__(self)

        max_len = 300
        class_names = ['negative', 'neutral', 'positive']

        with open('./config/run.json') as f:
            self.config = json.load(f)

        base_model_name = self.config['runningModel']['base_model_name']
        num_labels = self.config['runningModel']['num_labels']
        path = f"{self.config['runningModel']['path']}"

        self.tokenizer = BertTokenizer.from_pretrained(base_model_name)

        self.model = ModelNero(base_model_name, num_labels, path)


app = FastSA2()
app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
)

@app.get("/")
async def root():
    modelInfo = app.config['runningModel']['path']
    return {"message": f'running model {modelInfo}'}





@app.post("/predict")
async def predictTweet(data=Body(...)):
    # {"text": ["this is so beautiful"]}
    # result = 'PROCESSING'
    result = ['ERROR'] * len(data['text'])

    # for a in data['text']: print(f'***{a}\n')
    try:
        dataLoader = app.model.create_data_loader(data['text'])
        preds = app.model.get_predictions(dataLoader)
        # for i in range(len(data['text'])):
        #     print(f"{pred[i]}\t{data['text'][i]}")
        #     result[i] = app.config['runningModel']['labels'][(str(numpy.argmax(pred[i])))]
        #     # result[i] = numpy.argmax(pred[i])

        for i,p in enumerate(preds):
            t = data['text'][i]
            result[i] = app.config['runningModel']['labels'][str(p)]
            print(f'{t}\n{result[i]}')

    except Exception as e:
        # result = ["FAILED"]
        print(traceback.print_exc())
    # print(result)
    return result
    # return {"result":result}

