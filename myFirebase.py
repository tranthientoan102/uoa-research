import datetime

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

from myTwitter import MyTweet


class MyFirebaseService:
    def __init__(self
                 , certPath='./config/cobalt-entropy-272613-95e25772de3a.json'
                 ,collectionName = 'tweets_health'
                 ):
        self.collectionRef = None
        self.certPath = certPath
        self.collectionName = collectionName

    def getCollectionRef(self):
        if self.collectionRef is None:
            self.collectionRef = self.__initCollectionRef()
        return self.collectionRef

    def __initCollectionRef(self):
        # Use a service account
        cred = credentials.Certificate(self.certPath)
        firebase_admin.initialize_app(cred)

        db = firestore.client()
        return db.collection(self.collectionName)

    def insertData(self, data: MyTweet):
        data.insertDbAt = datetime.datetime.now()
        self.getCollectionRef().document(data.hash).set(data.to_dict())

    def checkExisted(self, key):
        return self.getCollectionRef().document(key).get().exists

    def getDoc(self, key):
        return self.getCollectionRef().document(key).get().to_dict()


if __name__ == '__main__':
    # docs = initCollectionRef().stream()
    # for doc in docs:
    #     print(f'{doc.id} => {doc.to_dict()}')

    # doc = initCollectionRef().document('abc').get()
    # if doc.exists:
    #     print(doc.to_dict())
    # else:
    #     print('No such document!')

    tweet = MyTweet('test2')
    service = MyFirebaseService()
    doc = service.getCollectionRef().document(tweet.hash).set(tweet.to_dict())
    docRead = service.getCollectionRef().document(tweet.hash).get()
    if docRead.exists:
        print(docRead.to_dict())
    else:
        print('No such document!')
