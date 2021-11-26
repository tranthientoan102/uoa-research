import datetime
from myFirebase import *
import csv

from myTwitter import MyTweet2

if __name__ == '__main__':

    service = MyFirebaseService(certPath='./config/firebase_prod.json')


    # for d in pd.read_csv('./test/server20_20211123.csv'):
    with open('./test/server20_20211123.csv','r') as f:
        csvReader = csv.reader(f)
        next(csvReader,None)
        for row in csvReader:
            tweet = MyTweet2().parseFromCSV(row)
            print(tweet.to_dict())

            service.insertData(tweet)


