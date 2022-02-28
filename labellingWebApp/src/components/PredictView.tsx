import {Box, Button, Checkbox, Container, Divider, Flex, Grid, SimpleGrid, Spinner, Tag, Text} from '@chakra-ui/react';
import React, {useState} from 'react';
import {
    getDefaultEventList,
    loadUnlabelledPostByAccount,
    refillDb_acc,
    updateLabel,
    loadUnlabelledPost_accs_kws,
    refillDb_kw,
    refillDb_acc_kws, loadLabelledPostByLabelledBy, getDefaultKws
} from '../utils/db';
import {useAuth} from "../lib/auth";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import TagInput2 from './TagsInput2';
import {
    fetchData,
    getKwInput,
    getTagsInput,
    isAdmin,
    isMasked,
    explainKws,
    // maskPersonalDetails,
    maskPersonalDetails_AtSign,
    getCountRecent,
    getSAPrediction,
    getEDPrediction,
    isChecked,
    calcAmountSummary,
    checkExpect, displayTagSentiment, displayTagED, sentimentFullList, eventFullList, eventList
} from "../utils/common";
import DefaultEvent, {DE} from "./DefaultEvent";
import TagsInput2 from "./TagsInput2";
import TagsInputKws from "./TagsInputKws";
import InfiniteScroll from "react-infinite-scroll-component";
import {random} from "nanoid";
import PostView2Decoration from "./PostView2Decoration";
import Head from "next/head";
import Navbar from "./Navbar";
import PredictionDownload from "./PredictionDownload";
import TweetHeader from "./TweetHeader";

interface Props {
    auth,
    tweets,
    pred_sa,
    pred_ed,
    sortBy
}

class PredictView extends React.Component<Props> {

    state = {
        id: 'PredictView',
        auth: this.props.auth,

        refreshing: false,
        tweets: this.props.tweets,
        pred_sa: this.props.pred_sa,
        pred_ed: this.props.pred_ed,
        filter_sa: [],
        filter_ed: [],
    }

    displayResult;



    uiFilterSA = []
    uiFilterED = []

    updateFilterSA = ( i:string) => {
        if (this.uiFilterSA.includes(i)){
            this.uiFilterSA = this.uiFilterSA.filter(x=> x!=i)
        }else this.uiFilterSA.push(i)

    }
    updateFilterED = ( i:string) => {
        if (this.uiFilterED.includes(i)){
            this.uiFilterED = this.uiFilterED.filter(x=> x!=i)
        }else this.uiFilterED.push(i)

    }
    displayPredicts = () => {

        console.log(`${this.state.id}:displayPredicts`)
        // console.log(this.uiFilterSA)
        // console.log(this.uiFilterED)


        let result = []
        for (const i in this.props.tweets) {
            const tweet = this.props.tweets[i]
            const isShowing_sa = checkExpect(this.props.pred_sa[i], this.uiFilterSA)
            const isShowing_ed = checkExpect(this.props.pred_ed[i], this.uiFilterED)
            // console.log(`${this.state.pred_sa[i]}-> ${isShowing_sa},${this.state.pred_ed[i]}-> ${isShowing_ed}`)
            if (isShowing_sa && isShowing_ed) {
                console.log(`i=${i}\n text=${tweet.text}`)
                result.push(
                    <Box align="left" m={3} borderWidth="1px" borderRadius="lg" p={6} boxShadow="xl" id={this.props.tweets[i].hash}>

                        <TweetHeader isMasked={isMasked(this.props.auth)}
                            acc={tweet.account}
                            geo={tweet.geo}
                            like={tweet.fav} comment={tweet.comment} retweet={tweet.retweet}
                            engage={tweet.engage}
                            hash={tweet.hash} orig={tweet.orig} postSec={tweet.postAt['seconds']}
                            sortBy={this.props.sortBy}
                        />

                        <PostView2Decoration
                            text={this.props.tweets[i].text}
                            hash={this.props.tweets[i].hash}
                            kws={getKwInput('searchKeyPredict', false, false)}/>

                        <Flex align="center" justify="center">
                            {/*Sentiment: {displayTagSentiment([pred_sa.data[i]], sentimentFullList)}*/}
                            Sentiment: {displayTagSentiment([this.props.pred_sa[i]], sentimentFullList)}
                        </Flex>

                        <Container position="relative" maxW="6xl">

                            <Flex flexDirection="row" flexWrap="wrap"
                                // templateColumns={'repeat(5,auto)'}
                                  align="center" justify="center">
                                Event:{
                                // (pred_ed.data[i].length>0)? displayTagED(pred_ed.data[i], eventFullList)
                                //     : displayTagED(['no event detected'], eventFullList)
                                (this.props.pred_ed[i].length > 0) ? displayTagED(this.props.pred_ed[i], eventFullList)
                                    : displayTagED(['no event detected'], eventFullList)
                            }
                            </Flex>
                        </Container>
                    </Box>
                )
            }
        }
        // @ts-ignore
        return result
        // this.displayResult = result
    }

    render() {
        this.displayResult = this.displayPredicts()
        return (
            <div>

                <Container  align="center" justify="top" maxW={'8xl'}>
                    <Flex>
                        <Box align="center" width="40%" borderRight={'1px'}>
                            <Text fontSize='xl' fontWeight={600} color={'tomato'}>Filter by sentiment</Text>
                            <Box id={'filterSA'} mb={2}  align="center" justify="center" maxW={'8xl'}>
                                {sentimentFullList.map(a => (
                                    <Checkbox mr={4} mb={2} fontSize={12} colorScheme='blue'
                                        key={a}
                                        onChange={()=>{
                                            this.updateFilterSA(a)
                                            this.displayPredicts()
                                            this.setState({refreshing: true})
                                        }}
                                    >
                                        {a}
                                    </Checkbox>))
                                }
                            </Box>
                        </Box>

                        <Box align="center" flexGrow={20} >
                            <Text fontSize='xl' fontWeight={600} color={'tomato'}>Filter by event</Text>
                            <Container  align="center" justify="center" maxW={'10xl'}>
                                {/*<Grid id={'filterED'} templateColumns='repeat(4, 1fr)' align="left" justify="top">*/}
                                <Box id={'filterED'} align="center" justify="top">
                                    {eventList.map(a => (
                                        <Checkbox mr={4} mb={2} fontSize={12} colorScheme='blue'
                                            key={a}
                                            // onChange={()=>{this.setState({refreshing: true})}}
                                            onChange={()=>{
                                                this.updateFilterED(a)
                                                this.displayPredicts()
                                                this.setState({refreshing: true})
                                            }}

                                        >
                                            {a}
                                        </Checkbox>))
                                    }
                                </Box>
                            </Container>
                        </Box>

                    </Flex>

                </Container>

                <Container  align="center" justify="top" maxW={'8xl'}>
                    {this.displayResult}
                </Container>
            </div >

        );
    }
}


export default PredictView;