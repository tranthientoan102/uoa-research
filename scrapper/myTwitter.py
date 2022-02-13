from hashlib import md5
from datetime import datetime
import json



def buildTwitterUrl_search(keywords, hashtags=None):
    base = 'https://twitter.com/search?q='
    addup = buildQueryPart(keywords)
    if hashtags:
        addup += '%20' + buildQueryPart(hashtags)
    return [f'{base}{addup}']


def buildTwitterUrl_account(accs):
    return [f'https://twitter.com/{acc}' for acc in accs]


def buildTwitterUrl_advanced(accs, keywords, withBase=False, filterReplies=True):
    result = []
    base = 'https://twitter.com/search?q='
    for acc in accs:
        addup = ''
        if keywords is not None:
            addup += f'{buildQueryPart(keywords)}'

        if acc != None:
            addup += f' from:{acc}'

        if filterReplies:
            addup += ' -filter:replies'
        addup = translateSpecialChar(addup) + '&src=typed_query&f=live'
        if withBase: addup = base + addup
        result.append(addup)

    return result


def buildQueryPart(queryParts, translate=True):
    result = ''
    if len(queryParts) >= 1:
        result = f"{' OR '.join(queryParts)}"
    else:
        result = queryParts
    if translate: result = translateSpecialChar(result)
    return f'{result}'


def translateSpecialChar(query):
    return query.replace(' ', '%20').replace('#', '%23') \
        .replace(':', '%3A').replace('&', '%26') \
        .replace('+', '%20AND%20')


# class MyTweet:
#     # def __init__(self, initText):
#     #     self.hash = md5(initText.encode()).hexdigest()
#     #     self.isRelated = None
#     #     self.rating = None
#     #     self.text = initText
#     #     self.insertDbAt = None
#
#     # def __init__(self, infoStr:str):
#     #     info = json.loads(infoStr)
#     #     print(info)
#
#     def __init__(self, webEle: WebElement, mainTarget: str, configPath='./config/cssSelector.json'):
#         with open(configPath) as f:
#             config = json.load(f)
#
#         tmpAcc = webEle.find_element_by_css_selector(f"{config['tweet']['account']}").text.lower()
#         self.account = [tmpAcc]
#         if (not mainTarget.__eq__(tmpAcc)) & (len(mainTarget) > 0):
#             self.account.append(mainTarget)
#
#         self.orig = webEle.find_element_by_css_selector(f"{config['tweet']['orig']}").get_property('href')
#
#         dtFormat = '%Y-%m-%dT%H:%M:%S'
#         self.postAt = datetime.strptime(webEle.find_element_by_css_selector(f"{config['tweet']['orig']}")
#                                         .find_element_by_css_selector('time').get_attribute('datetime')
#                                         .split('.')[0],
#                                         dtFormat)
#
#         self.text = webEle.find_element_by_css_selector(f"{config['tweet']['text']}").text
#         self.hash = md5(self.text.encode()).hexdigest()
#         self.rating = -10
#         self.insertDbAt = None
#
#     def to_dict(self):
#         return {
#             'account'     : self.account
#             , 'orig'      : self.orig
#             , 'postAt'    : self.postAt
#             , 'hash'      : self.hash
#             , 'text'      : self.text
#             , 'rating'    : self.rating
#             , 'insertDbAt': self.insertDbAt
#         }


class MyTweet2:
    def __init__(self):
        self.account = None
        self.id = None
        self.orig = None
        self.postAt = None
        self.hash = None
        self.text = None
        self.retweet = 0
        self.fav = 0
        self.comment = 0
        self.engage = 0
        self.geo = 'unknown location'
        self.query = ''
        self.rating = None
        self.event = []
        self.labelledBy = None
        self.insertDbAt = None

    def parse(self, initDict, query):
        if 'retweeted_status' in initDict.keys():
            self.parse(initDict['retweeted_status'], query=query)
        else:
            self.account = ['@' + initDict['user']['screen_name'].lower()]
            self.id = initDict['id']
            self.orig = f'https://twitter.com/{initDict["user"]["screen_name"]}/status/{self.id}'
            dt = initDict['created_at'].split(' ')
            dt2 = f'{dt[1]} {dt[2]} {dt[5]} {dt[3]}'
            self.postAt = datetime.strptime(dt2, '%b %d %Y %H:%M:%S')
            # print(f'converting {dt2} -> {self.postAt}')

            tmpText = ''
            if 'full_text' in initDict.keys(): tmpText = initDict['full_text']
            elif 'extended_tweet' in initDict.keys() : tmpText = initDict['extended_tweet']['full_text']
            else: tmpText = initDict['text']
            self.text = tmpText

            self.retweet = initDict['retweet_count']
            self.fav = initDict['favorite_count']
            self.comment = initDict['reply_count'] if 'reply_count' in initDict.keys() else 0
            self.engage = self.retweet + self.fav + self.comment
            self.geo = 'unknown location'
            if initDict['place']:
                self.geo = f'{initDict["place"]["full_name"]}, {initDict["place"]["country"]}'


            self.query = query
            self.rating = -10
            self.hash = md5(self.text.encode()).hexdigest()
            self.insertDbAt = None
        return self

    def parseFromCSV(self, csvData: list):
        i = 0
        self.hash = csvData[i];
        i += 1
        self.account = csvData[i];
        i += 1
        # 2021-11-13T01:25:11.000Z
        # tmpTime = csvData[i]; i += 1
        self.postAt = datetime.strptime(csvData[i], '%Y-%m-%dT%H:%M:%S.%fZ');
        i += 1
        self.insertDbAt = datetime.strptime(csvData[i], '%Y-%m-%dT%H:%M:%S.%fZ');
        i += 1
        self.text = csvData[i];
        i += 1
        if (len(csvData[i]) > 0):
            # print(csvData[i].length > 0)
            self.event = csvData[i].split(',')
        i += 1
        self.rating = csvData[i]
        i += 1
        self.labelledBy = csvData[i]
        return self

    def to_dict(self):
        return {
            'account'     : self.account
            , 'orig'      : self.orig
            , 'postAt'    : self.postAt
            , 'hash'      : self.hash
            , 'text'      : self.text

            , 'retweet'   : self.retweet
            , 'fav'       : self.fav
            , 'comment'   : self.comment
            , 'engage'    : self.engage
            , 'geo'       : self.geo

            , 'query'     : self.query
            , 'rating'    : self.rating
            , 'event'     : self.event
            , 'labelledBy': self.labelledBy
            , 'insertDbAt': self.insertDbAt
        }


if __name__ == '__main__':
    # test = MyTweet("""test
    # newline""")
    # print(test.text)
    # print(test.to_dict())

    # text = 'sahealthsahealth'
    # obj = AES.new('sH9NM6goFrv0o3W2y2YvCw==', AES.MODE_ECB)
    # a = obj.encrypt(text)
    # print(f'{a=}')
    # ciphertext = base64.b16encode(obj.encrypt(text))
    # print(f'{ciphertext=}')
    # print(ciphertext)
    #
    # b = obj.decrypt(base64.b16decode('9731ECD1E8FFAC1A067B2D4610EDED5D'))
    # print(f'{b=}')

    text = 'sahealth'
    obj = md5(text.encode()).hexdigest()
    print(f'{obj=}')
