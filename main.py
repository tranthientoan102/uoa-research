import hashlib
import time
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
import json
import traceback
import myTwitter
import myFirebase


# Press the green button in the gutter to run the script.

def run(runConfig, scrapFrom='twitter'):
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--window-size=1920x1080")
    browser = webdriver.Chrome(options=chrome_options)
    myfirebase = myFirebase.MyFirebaseService()

    runMode = runConfig[scrapFrom]['runMode']
    queryInput = runConfig[scrapFrom][runMode]
    maxScrolling = runConfig['maxScrolling']
    count = runConfig[scrapFrom]['tweetLoad']

    if (runMode == 'account'):
        urls = myTwitter.buildTwitterUrl_account(queryInput)
    else:
        urls = myTwitter.buildTwitterUrl_search(queryInput)
    res = []
    for url in urls:
        res.append(subRun(url, browser, maxScrolling, count, myfirebase))


    browser.quit()
    myfirebase.disconnect()

    return res


def subRun(url, browser, maxSrolling, count, myfirebase):
    try:
        print(f'looking for {url}\n')
        browser.get(url)
        time.sleep(2)
        body = browser.find_element_by_tag_name('body')

        with open('./config/cssSelector.json') as f:
            config = json.load(f)

        counter_insert = 0
        iter = 0

        # maxSrollingIn = config['maxScrolling']
        stopScrollingIn = maxSrolling
        goingDown = True

        while (counter_insert < count) and (stopScrollingIn > 0):
            try:
                if goingDown:
                    body.send_keys(Keys.PAGE_DOWN)
                    time.sleep(0.5)
                    body.send_keys(Keys.PAGE_DOWN)
                tmp_insert = 0
                for x in browser.find_elements_by_css_selector(f"{config['tweet']['full']}"):
                    tweet = myTwitter.MyTweet(x)
                    if not myfirebase.checkExisted(tweet.hash):
                        myfirebase.insertData(tweet)
                        tmp_insert += 1
                        counter_insert += 1
                    if (counter_insert == count) | (stopScrollingIn == 0):
                        break
                goingDown = True
            except Exception as e:
                goingDown = False
                # traceback.print_exc()

            if tmp_insert == 0:
                stopScrollingIn -= 1

            print(f'#{iter}: insert {counter_insert} tweets\n')

            iter += 1

        return "SUCCESS"
    except Exception as e:
        print(f'!!!!!!!!!!!!!\n Execution fail: {e}!!!!!!!!!!!!!\n')
        traceback.print_exc()
        return "FAIL"


if __name__ == '__main__':
    with open('./config/run.json') as f:
        runconfig = json.load(f)
    run(runconfig)
