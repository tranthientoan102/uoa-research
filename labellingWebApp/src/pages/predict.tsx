import {
    Box,
    Container,
    Divider,
    Flex,
    Heading,
    SimpleGrid,
    Text,
    HStack,
    Button,
    Spacer,
    Checkbox, Grid, Spinner
} from '@chakra-ui/react';
import Head from 'next/head';
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from "../lib/auth";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TagsInput2 from "../components/TagsInput2";
import {
    convertTimeToString, displayTag, displayTagSentiment, displayTagED, explainKws,
    fetchData, getEDPrediction, getKwInput,
    getSAPrediction,
    getTagsInput,
    isAdmin,
    isMasked, maskPersonalDetails_AtSign, isChecked, calcPercentage
} from "../utils/common";
import {downloadData} from "../utils/db";

import TagInput2 from "../components/TagsInput2";
import TagsInputKws from "../components/TagsInputKws";
import PredictionDownload from "../components/PredictionDownload";
import PostView2Decoration from "../components/PostView2Decoration";

interface Props {
    data: string[]
}

const Predict = (props) => {
    const id = 'Predict'

    // const formData = JSON.parse(props.formData);
    // console.log(formData)

    toast.configure()
    const { auth, signinWithGoogle } = useAuth();
    const [data, setData] = useState("init data");

    const [downloadAvailable, setDownloadAvailable] = useState(false)
    const [buttonExport, setButtonExport] = useState(<PredictionDownload text={[]} sa={[]} ed={[]}
                                                    isMasked={true}
                                                    disabled={true}/>)

    const [text, setText] = useState([])

    let numberPredict = 25
    // const [ pred_sa, setPred_sa] = useState([])
    // const [ pred_ed, setPred_ed] = useState([])


    let tweetList = []

    const processPredict = async () => {

        setButtonExport(<PredictionDownload text={[]} sa={[]} ed={[]}
                                                    isMasked={true}
                                                    disabled={true}/>)

        let result = []
        // let tweetList = []

        // let eventFullList = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate', 'friendly']
        let eventFullList = ['cancer journey', 'qum', 'health inequity/disparity', 'patient centricity', 'phc',
                       'innovation/innovative therapies', 'affordability', 'initiatives/education', 'timely access',
            'advocary/reform', 'no event detected']

        let sentimentFullList = ['negative', 'neutral', 'positive']
        // @ts-ignore
        setData(<Flex my={2} align="center" justify="center" >Loading tweets ...
                    <Spinner size="md" m={1} thickness="4px"
                              speed="0.65s"
                              emptyColor="gray.200"
                              color="blue.500"/>
                    </Flex>)
        let tweets = await fetchData(
                                        getTagsInput('searchAcc',true )
                                        , getKwInput('searchKeyPredict', false)
                                        , numberPredict
                                    ).then((res) => {
            res.forEach(a =>{
                // console.log(`converting ${a.id}`)
                // a.postAt = convertTimeToString(a.postAt)
                // a.insertDbAt = convertTimeToString(a.insertDbAt)

                tweetList.push(a.text)

            })
            return res
        })
        // toast.info('Predicting...')

        // @ts-ignore
        setData(<Flex my={2} align="center" justify="center" >Running Prediction for {tweets.length} tweets
                    <Spinner size="md" m={1} thickness="4px"
                              speed="0.65s"
                              emptyColor="gray.200"
                              color="blue.500"/>
                    </Flex>)
        // let pred_sa = await getSAPrediction(tweetList)
        // let pred_ed = await getEDPrediction(tweetList)

        let pred_sa
        let pred_ed
        let promise1 = getSAPrediction(tweetList)
        let promise2 = getEDPrediction(tweetList)
        await Promise.all([promise1, promise2]).then(promises=>{
            pred_sa= promises[0].data
            pred_ed = promises[1].data

            // setText(tweets)
            // setPred_sa(promises[0].data)
            // setPred_ed(promises[1].data)
        })



        console.log(tweets)
        console.log(pred_sa)
        console.log(`${pred_ed}`)

        let buttonView = []

        setButtonExport(<PredictionDownload text={tweetList} sa={pred_sa} ed={pred_ed}
                                                    isMasked={isChecked('isMasked')}
                                                    disabled={false}/>)

        // result.push(<PredictionDownload text={tweetList} sa={pred_sa} ed={pred_ed} isMasked={isChecked('isMasked')} />)

        let percentage = calcPercentage(pred_sa, sentimentFullList)
        result.push(`Among the ${numberPredict} latest tweets, there are predicted to have`)
        for (let k in percentage){
            console.log(`${percentage[k]*100}% ${k}`)
            result.push(<div>{(percentage[k]*100).toFixed(2)}% {k}</div>)
        }

        for (const i in tweets) {
            let tweet = tweets[i]
            result.push(
                <Box align="left" m={3} borderWidth="1px" borderRadius="lg" p={6} boxShadow="xl" id={tweet.hash}>
                    {isMasked(auth) ? '' :
                        <Text color="blue.300">
                            <a href={tweet.orig}>{tweet.orig}</a>
                        </Text>}
                    <Text colorScheme="teal">
                        {isMasked(auth) ? '' :
                            <b>{tweet.account}</b>} {(new Date(tweet.postAt['seconds'] * 1000).toString())}
                    </Text>
                    <Text color="teal">
                        {tweet.hash}
                    </Text>
                    <PostView2Decoration
                            text={tweet.text}
                            hash={tweet.hash}
                            kws={getKwInput('searchKeyPredict', false, false)} />

                    <Flex align="center" justify="center">
                        {/*Sentiment: {displayTagSentiment([pred_sa.data[i]], sentimentFullList)}*/}
                        Sentiment: {displayTagSentiment([pred_sa[i]], sentimentFullList)}
                    </Flex>

                    <Container position="relative" maxW="6xl">

                        <Flex flexDirection="row" flexWrap="wrap"
                            // templateColumns={'repeat(5,auto)'}
                              templateRows={'repeat(3,auto)'} align="center" justify="center">
                            Event:{
                                // (pred_ed.data[i].length>0)? displayTagED(pred_ed.data[i], eventFullList)
                                //     : displayTagED(['no event detected'], eventFullList)
                                (pred_ed[i].length>0)? displayTagED(pred_ed[i], eventFullList)
                                    : displayTagED(['no event detected'], eventFullList)
                            }
                        </Flex>
                    </Container>
                </Box>
            )
        }
        // @ts-ignore
        setData(result)

        console.log(`done download data`)

        // return result



    }

    return (
        <div>
            <Head>
                <title>Text Labelling tool</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <Navbar />
                {auth?(
                    <div>
                        <Container position="relative" maxW="8xl">
                            <Flex  my={2} align="center" justify="center" >

                                <Container mx={2} p={0}>
                                    <Text>Twitter account</Text>
                                    <TagInput2 id="searchAcc" defaultEvents={[]} tags={[]} />
                                </Container>

                                <Container mx={2} p={0}>
                                    <Text>Keyword</Text>
                                    <TagsInputKws id="searchKeyPredict" tags={[]} outsideIsAND={true}/>
                                </Container>
                            </Flex>
                            <Flex  my={2} align="center" justify="center" >
                                <div id="isMasked">
                                {isAdmin(auth) ?
                                    <Checkbox colorScheme='blue' defaultIsChecked>privacy</Checkbox>
                                    : <Checkbox colorScheme='blue' defaultIsChecked isDisabled={true}>privacy</Checkbox>
                                }
                                </div>
                                <Button
                                    m={3}
                                    // colorScheme="blue"
                                    // background="gray"
                                    // color="lightgreen"
                                    onClick={() => processPredict()}
                                    colorScheme={'telegram'}
                                >
                                    <p>Load & Predict</p>
                                </Button>
                                {buttonExport}


                                {/*<Button*/}
                                {/*    m={3}*/}
                                {/*    colorScheme="yellow"*/}
                                {/*    onClick={() => refillData()}*/}
                                {/*>*/}
                                {/*    LATEST*/}
                                {/*</Button>*/}
                            </Flex>


                            {/* </Flex> */}
                        </Container>
                        <Container maxW="8xl">
                            <SimpleGrid my={2} align="center" >
                                <div>{data}</div>
                            </SimpleGrid>
                        </Container>
                    </div >

                    ):(
                        <Container>Please log in for start using tool</Container>
                    )
                }

            </main>
            <footer/>
        </div >
    );
}




export default Predict