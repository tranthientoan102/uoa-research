import {
    Container,
    Flex,
    Text,
    Button,
    Checkbox, Spinner, Tag, Input
} from '@chakra-ui/react';
import Head from 'next/head';
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from "../lib/auth";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    fetchData, getEDPrediction, getKwInput,
    getSAPrediction,
    getTagsInput,
    isAdmin,
    isMasked, isChecked, calcAmountSummary, sentimentFullList, getTextInput_defaultVal
} from "../utils/common";

import TagInput2 from "../components/TagsInput2";
import TagsInputKws from "../components/TagsInputKws";
import PredictionDownload from "../components/PredictionDownload";
import PredictView from "../components/PredictView";



const Predict = () => {
    const id = 'Predict'

    // const formData = JSON.parse(props.formData);
    // console.log(formData)

    toast.configure()
    const { auth, signinWithGoogle } = useAuth();
    const [stats, setStats] = useState(<div/>)

    const [buttonExport, setButtonExport] = useState(<PredictionDownload tweets={[]} sa={[]} ed={[]}
                                                    isMasked={true}
                                                    disabled={true}/>)
    const [predictView, setPredictView] = useState(<div/>)

    let numberPredict = 25

    let tweets = []
    let pred_sa
    let pred_ed

    const eventList = ['cancer journey', 'qum', 'health inequity/disparity', 'patient centricity', 'phc',
                   'innovation/innovative therapies', 'affordability', 'initiatives/education', 'timely access',
        'advocary/reform']
    const eventFullList = [eventList, 'no event detected'].flat()
    const sentimentFullList = ['negative', 'neutral', 'positive']

    const processPredict = async () => {

        setButtonExport(<PredictionDownload tweets={[]} sa={[]} ed={[]}
                                                    isMasked={true}
                                                    disabled={true}/>)
        // @ts-ignore
        setStats(<Flex my={2} align="center" justify="center" > Loading stats
                    <Spinner size="md" m={1} thickness="4px"
                              speed="0.65s"
                              emptyColor="gray.200"
                              color="blue.500"/>
                    </Flex>)

        // @ts-ignore
        setPredictView(<Flex my={2} align="center" justify="center" > Loading predictions
                    <Spinner size="md" m={1} thickness="4px"
                              speed="0.65s"
                              emptyColor="gray.200"
                              color="blue.500"/>
                    </Flex>)

        await fetchData(
            getTagsInput('searchAcc', true)
            , getKwInput('searchKeyPredict', false)
            , getTextInput_defaultVal('numPrediction', process.env.NEXT_PUBLIC_NUM_PREDICTIONS)
        ).then((res) => {
            res.forEach(a =>{
                // console.log(`converting ${a.id}`)
                // a.postAt = convertTimeToString(a.postAt)
                // a.insertDbAt = convertTimeToString(a.insertDbAt)

                // tweetList.push(a.text)
                tweets.push(a)

            })
            return res
        })
        // toast.info('Predicting...')


        // let pred_sa = await getSAPrediction(tweetList)
        // let pred_ed = await getEDPrediction(tweetList)


        let promise1 = getSAPrediction(tweets)
        let promise2 = getEDPrediction(tweets)
        await Promise.all([promise1, promise2]).then(promises=>{
            pred_sa= promises[0].data
            pred_ed = promises[1].data

            // setText(tweets)
            // setPred_sa(promises[0].data)
            // setPred_ed(promises[1].data)
        })



        console.log(tweets)
        console.log(pred_sa)
        console.log(pred_ed)

        displayStats()
        displayPredicts()

    }

    const displayStats = () => {
        setButtonExport(<PredictionDownload tweets={tweets} sa={pred_sa} ed={pred_ed}
                                                    isMasked={isChecked('isMasked')}
                                                    disabled={false}/>)

        let percentageSA = calcAmountSummary(pred_sa, sentimentFullList, true)
        let countED = calcAmountSummary(pred_ed.flat(), eventFullList, false)

        let result = []
        result.push(<Text mt={4}>Among the {tweets.length} latest tweets, there are predicted to have</Text>)
        let tmpResult = []
        for (let k in percentageSA){
            let color = ''
            if (k == sentimentFullList[0]) color='red'
            else if (k == sentimentFullList[1]) color='yellow'
            else color='green'
            tmpResult.push(<Flex align="center" justify="center" mr={2} p={0}>{(percentageSA[k]*100).toFixed(2)}% <Tag colorScheme={color} variant="solid">{k}</Tag></Flex>)
        }
        result.push(
            <Flex flexDirection="row" flexWrap="wrap"
                              align="center" justify="center" pb={3}>
                {tmpResult}
            </Flex>
        )
        for (let c in countED){
            // console.log(`${countED[c]}`)
            if (countED[c]>0)
                result.push(<Flex align="center" justify="center" m={0.5}><Tag colorScheme={'orange'} m={0.5} variant="solid">{c}</Tag> is detected in {countED[c]} tweets</Flex>)
        }

        setStats(
            <div>
                {result}
            </div>
        )
    }

    const displayPredicts = () => {


        setPredictView(<PredictView  auth={auth} tweets={tweets}
                          pred_ed={pred_ed} pred_sa={pred_sa}/>)

        setButtonExport(<PredictionDownload tweets={tweets} sa={pred_sa} ed={pred_ed}
                                    isMasked={isChecked('isMasked')}
                                    disabled={false}/>)


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
                            <Flex  my={2} align="top" justify="center" >

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
                                <Input p={0} pl={1} ml={4} id='numPrediction'
                                    maxW={'20'}
                                    defaultValue={process.env.NEXT_PUBLIC_NUM_PREDICTIONS}
                                />
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


                        <Container maxW="8xl" align="center" >
                            {stats}
                        </Container>

                        <Container maxW="8xl" align="center" >
                            {predictView}
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