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
        self.appName = ''
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
        try:
            app = firebase_admin.initialize_app(cred)
            self.appName = app.name
        except Exception as e:
            print('ERROR when init new Firebase App')
        db = firestore.client()
        return db.collection(self.collectionName)

    def getDbSnapshot(self):
        return self.getCollectionRef()\
            .limit(10)\
            .stream()

    def updateLocalDbState(self, cache):
        print('updating local db state')
        cloudDbState = self.getDbSnapshot()
        for doc in cloudDbState:
            try:
                hash = doc.to_dict()['hash']
                acc = doc.to_dict()['account']
                text = doc.to_dict()['text']
                cache[hash] = [acc, text]
            except Exception as e:
                print(f'ERROR fail to get info from {doc.to_dict()}')
        print(f'dbState contains {len(cache)} records')

    def insertData(self, data: MyTweet):
        data.insertDbAt = datetime.datetime.now()
        self.getCollectionRef().document(data.hash).set(data.to_dict())

    def checkExisted(self, key):
        return self.getCollectionRef().document(key).get().exists

    def getDoc(self, key):
        return self.getCollectionRef().document(key).get().to_dict()

    def disconnect(self):
        if not self.appName.__eq__(''):
            firebase_admin.delete_app(firebase_admin.get_app())

if __name__ == '__main__':
    # docs = initCollectionRef().stream()
    # for doc in docs:
    #     print(f'{doc.id} => {doc.to_dict()}')

    # doc = initCollectionRef().document('abc').get()
    # if doc.exists:
    #     print(doc.to_dict())
    # else:
    #     print('No such document!')

    service = MyFirebaseService()

    # tweet = MyTweet('test2')
    # doc = service.getCollectionRef().document(tweet.hash).set(tweet.to_dict())
    docRead = service.getCollectionRef().where("account", "array_contains", "@abcaustralia").get()

    # .collection("tweets_health")
    # .where("account", "array-contains-any", ["@abcaustralia"])


    # if docRead.exists:
    #     print(docRead.to_dict())
    # else:
    #     print('No such document!')

    for doc in docRead:
        a = doc.to_dict()['hash']
        service.getCollectionRef().document(a).delete()
        print(f'done delete {a}')
