from hashlib import md5
from datetime import datetime
import json

from selenium.webdriver.remote.webelement import WebElement


def buildTwitterUrl_search(keywords, hashtags=None):
    base = 'https://twitter.com/search?q='
    addup = buildQueryPart(keywords)
    if hashtags:
        addup += '%20' + buildQueryPart(hashtags)
    return [f'{base}{addup}']


def buildTwitterUrl_account(accs):
    return [f'https://twitter.com/{acc}' for acc in accs]


def buildQueryPart(queryParts):
    result = ''
    if len(queryParts) > 1:
        result = f"({'%20OR%20'.join(queryParts)})"
    else:
        result = queryParts
    return f'{translateSpecialChar(result)}'


def translateSpecialChar(query):
    return query.replace(' ', '%20').replace('#', '%23') \
        .replace(':', '%3A').replace('&', '%26') \
        .replace('+', '%20AND%20')


class MyTweet:
    # def __init__(self, initText):
    #     self.hash = md5(initText.encode()).hexdigest()
    #     self.isRelated = None
    #     self.rating = None
    #     self.text = initText
    #     self.insertDbAt = None

    def __init__(self, webEle: WebElement, mainTarget:str, configPath='./config/cssSelector.json'):
        with open(configPath) as f:
            config = json.load(f)

        tmpAcc = webEle.find_element_by_css_selector(f"{config['tweet']['account']}").text.lower()
        self.account = [tmpAcc]
        if (not mainTarget.__eq__(tmpAcc)) & (len(mainTarget) > 0):
            self.account.append(mainTarget)

        self.orig = webEle.find_element_by_css_selector(f"{config['tweet']['orig']}").get_property('href')

        dtFormat = '%Y-%m-%dT%H:%M:%S'
        self.postAt = datetime.strptime(webEle.find_element_by_css_selector(f"{config['tweet']['orig']}")
                                        .find_element_by_css_selector('time').get_attribute('datetime')
                                        .split('.')[0],
                                        dtFormat)

        self.text = webEle.find_element_by_css_selector(f"{config['tweet']['text']}").text
        self.hash = md5(self.text.encode()).hexdigest()
        self.rating = -10
        self.insertDbAt = None

    def to_dict(self):
        return {
            'account'     : self.account
            , 'orig'      : self.orig
            , 'postAt'    : self.postAt
            , 'text'      : self.text
            , 'hash'      : self.hash
            , 'text'      : self.text
            , 'rating'    : self.rating
            , 'insertDbAt': self.insertDbAt
        }


if __name__ == '__main__':
    test = MyTweet("""test
    newline""")
    print(test.text)
    print(test.to_dict())
