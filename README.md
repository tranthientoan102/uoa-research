# SentimentToan

### Dependencies
* Selenium
    ```angular2html
    pip install selenium
    ```
    [setup instruction](https://selenium-python.readthedocs.io/installation.html)
  
* Firebase
    ```angular2html
    pip install --upgrade firebase-admin
    ```
    [setup instruction](https://firebase.google.com/docs/firestore/quickstart#python)

### Workflow
#### 1. Scrap data from social media
This project will collect data from:
- [x] Twitter:
  - [x] Tweets with specifice keywords and/or hashtags
    - [ ] dynamic keywords and/or hashtags
    - [x] Tweet's text
    - [ ] Tweet's replies
    - [ ] Tweet's retweet
    - [ ] Tweet's likes
  - [x] Tweets from specific accounts
    - [ ] dynamic accounts list
    - [ ] Tweet's text
    - [ ] Tweet's replies
    - [ ] Tweet's retweet
    - [ ] Tweet's likes
  
#### 2. Store online
- [x] Collected data will be stored in [this Google's Firestore project](https://console.firebase.google.com/u/0/project/cobalt-entropy-272613/firestore/). You will need permission for accessing it. Current data structure is:
> `tweets_health` collection name
> > `id` data.text's MD5 hash
> >> `isRelated` `= null` indicates this text is related to health topic \
> \
> >> `rating` `=null` -2 (very negative), -1(negative), 0 (neutral), 1(possitive) 2 (very possitive) \
> \
> >> `text` collected data

![example](./images/readme_firebase_view.png)
#### 3. Label
- [ ] Access to [this web app]() for updating:
  - [ ] Text's `isRelated`
  - [ ] Text's `rating`
    - [ ] will be disabled if not related
  
#### 4. Sentiment analys data
(tbd)