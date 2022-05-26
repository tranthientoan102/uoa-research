import torch
from torch import nn
from torch.utils.data import Dataset, DataLoader

from transformers import BertTokenizer, BertModel




class ModelNeroED:
    def __init__(self, base_model_name, path, max_len=300, batch_size=16):
        self.class_names = ['cancer journey', 'qum', 'health inequity/disparity', 'patient centricity', 'phc',
                       'innovation/innovative therapies', 'affordability', 'initiatives/education', 'timely access',
                       'advocary/reform']
        self.THRESHOLD = 0
        self.tokenizer = BertTokenizer.from_pretrained(base_model_name)
        self.model = SentimentClassifier(len(self.class_names), base_model_name)
        self.model.load_state_dict(torch.load(path, map_location=torch.device('cpu')))

        self.max_len = max_len
        self.batch_size = batch_size

    def create_data_loader(self, data):
        ds = GPReviewDataset(
                # reviews=df.text.to_numpy(),
                reviews=data,
                # targets=df.iloc[:, 2:12].values.tolist(),
                tokenizer=self.tokenizer,
                max_len=self.max_len
        )

        return DataLoader(
                ds,
                batch_size=self.batch_size,
                num_workers=4
        )

    def get_predictions(self, data_loader):
        model = self.model.eval()
        predictions = []
        with torch.no_grad():

            for d in data_loader:

                outputs = model(
                        input_ids=d["input_ids"],
                        attention_mask=d["attention_mask"]
                )
                # print(f'{outputs=}')

                # predictions.append(outputs.numpy())
                for pred in outputs.numpy():
                    tmpRes = []
                    for label, p in zip(self.class_names, pred):
                        if p >= self.THRESHOLD:
                            tmpRes.append(label)
                    predictions.append(tmpRes)

        return predictions


class GPReviewDataset(Dataset):

    def __init__(self, reviews, tokenizer, max_len):
        self.reviews = reviews
        # self.targets = targets
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.reviews)

    def __getitem__(self, item):
        review = str(self.reviews[item])
        # target = self.targets[item]

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
            # 'targets'       : torch.tensor(target, dtype=torch.long)
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


if __name__ == '__main__':
    base_model_name = "bert-base-uncased"
    # num_labels = len(self.class_names)
    path = "./checkpoints/ed_best_model_state.bin"
    model = ModelNeroED(base_model_name, path)

    allData = ['''The National Medicines Policy Review will start in August. This is the first time it has ever been reviewed. One of the key elements will be making sure the NMP has a strong patient focus. #MedicinesMatter [newLine][newLine]https://t.co/eOyG9rltpd https://t.co/AMAWQA3iB2''', '''It's the end of the road for an Australian relic - the Prince Alfred Bridge in Gundagai. The timber crossing, the longest in the Southern Hemisphere, is being demolished but will always retain an important place in our country's history.  https://t.co/39AyjPfSVs #7NEWS https://t.co/XQTBBFXofm
''']
    dataLoader = model.create_data_loader(allData)
    preds = model.get_predictions(dataLoader)

    print(preds)

