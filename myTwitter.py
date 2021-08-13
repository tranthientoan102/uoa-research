from hashlib import md5

def buildTwitterUrl_search(keywords, hashtags=None):
    base ='https://twitter.com/search?q='
    addup = buildQueryPart(keywords)
    if hashtags:
        addup += '%20' + buildQueryPart(hashtags)
    return f'{base}{addup}'


def buildQueryPart(queryParts):
    result = ''
    if len(queryParts) > 1:
        result = f"({'%20OR%20'.join(queryParts)})"
    else:
        result = queryParts
    return f'{translateSpecialChar(result)}'


def translateSpecialChar(query):
    return query.replace(' ', '%20').replace('#', '%23') \
        .replace(':', '%3A').replace('&', '%26')\
        .replace('+', '%20AND%20')

class MyTweet:
    def __init__(self, initText):
        self.hash = md5(initText.encode()).hexdigest()
        self.isRelated = None
        self.rating = None
        self.text = initText

    def to_dict(self):
        return {
            'isRelated': self.isRelated,
            'rating': self.rating,
            'text': self.text
                # .replace('\n','\\n')
        }

if __name__ =='__main__':

    test = MyTweet("""test
    newline""")
    print(test.text)
    print(test.to_dict())