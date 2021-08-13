import hashlib
import time
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import traceback
import myTwitter
import myFirebase


# Press the green button in the gutter to run the script.

def run(keywords, hashtags, repeat=20):
    browser = webdriver.Chrome()
    myfirebase = myFirebase.MyFirebaseService()

    try:
        url = myTwitter.buildTwitterUrl_search(keywords, hashtags)
        print(f'looking for {url}\n')
        browser.get(url)
        time.sleep(5)
        body = browser.find_element_by_tag_name('body')

        # tweet_full_cssClass = 'css-1dbjc4n r-1iusvr4 r-16y2uox r-1777fci r-kzbkwu'
        tweet_text_cssClass = 'css-901oao r-18jsvk2 r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-bnwqim r-qvutc0'

        counter_find = 0
        counter_insert = 0

        for _ in range(repeat):

            for x in browser.find_elements_by_css_selector(f"div[class='{tweet_text_cssClass}']"):
                tweet = myTwitter.MyTweet(x.text)
                counter_find += 1

                if not myfirebase.checkExisted(tweet.hash):
                    myfirebase.insertData(tweet)
                    counter_insert += 1
            body.send_keys(Keys.PAGE_DOWN)
            time.sleep(1)

    except Exception as e:
        print(f'!!!!!!!!!!!!!\n Execution fail: {e}!!!!!!!!!!!!!\n')
        traceback.print_exc()
    finally:
        print(f'grab {counter_find} tweets\n insert into db {counter_insert} tweets\n')
        # for id in tweets.keys():
        #     print(f'######\n{id=}\n{tweets[id]}')
        #
        # print('DONE')
        # browser.quit()


if __name__ == '__main__':
    keywords = ['covid', 'jab', '(covid+jab)', 'vaccin', 'mask']

    hashtags = None
    # hashtags = ['#Pfizer', '#AstraZeneca', '#Moderna']
    result = run(keywords, hashtags)
