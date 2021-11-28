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
    convertTimeToString, displayTag, displayTagSentiment, displayTagToxic, explainKws,
    fetchData, getEDPrediction, getKwInput,
    getSAPrediction,
    getTagsInput,
    isAdmin,
    isMasked, maskPersonalDetails_AtSign
} from "../utils/common";
import {downloadData} from "../utils/db";

import TagInput2 from "../components/TagsInput2";

interface Props {
    data: string[]
}

const Predict = (props) => {
    const id = 'download'

    // const formData = JSON.parse(props.formData);
    // console.log(formData)

    toast.configure()
    const { auth, signinWithGoogle } = useAuth();
    const [data, setData] = useState("init data");



    const processPredict = async () => {
        let result = []
        let tweetList = []

        let eventFullList = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate', 'friendly']
        let sentimentFullList = ['negative', 'neutral', 'positive']
        // @ts-ignore
        setData(<Flex my={2} align="center" justify="center" >Loading tweets ...
                    <Spinner size="md" m={1} thickness="4px"
                              speed="0.65s"
                              emptyColor="gray.200"
                              color="blue.500"/>
                    </Flex>)
        let tweets = await fetchData(
                                        getTagsInput('searchAcc' )
                                        , getKwInput('searchKeyPredict')
                                        , 25
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
        let pred_sa = await getSAPrediction(tweetList)
        let pred_ed = await getEDPrediction(tweetList)
        // console.log(pred)

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
                    <Text color="gray.500" my={2} fontSize="2xl" maxW="6xl">
                        {isMasked(auth) ? maskPersonalDetails_AtSign(tweet.text): tweet.text}
                    </Text>
                    <Flex align="center" justify="center">
                        Sentiment: {displayTagSentiment([pred_sa.data[i]], sentimentFullList)}
                    </Flex>
                    <Flex align="center" justify="center">
                        Event: {
                            (pred_ed.data[i].length>0)? displayTagToxic(pred_ed.data[i], eventFullList)
                                : displayTagToxic(['friendly'], eventFullList)
                        }
                    </Flex>

                </Box>
            )
        }
        // @ts-ignore
        setData(result)



        // setData(result)
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
                                    <TagInput2 id="searchKeyPredict" defaultEvents={[]} tags={[]} />
                                </Container>

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