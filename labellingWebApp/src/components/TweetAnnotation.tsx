import {Box, Button, Checkbox, Container, Divider, Flex, Grid, SimpleGrid, Spinner, Tag, Text} from '@chakra-ui/react';
import React, {useState} from 'react';
import {
    getDefaultEventList,
    loadUnlabelledPostByAccount,
    refillDb_acc,
    updateLabel,
    loadUnlabelledPost_accs_kws,
    refillDb_kw,
    refillDb_acc_kws
} from '../utils/db';
import {useAuth} from "../lib/auth";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import TagInput2 from './TagsInput2';
import {fetchData, getKwInput, getTagsInput, isAdmin, isMasked, explainKws} from "../utils/common";
import DefaultEvent, {DE} from "./DefaultEvent";

import TagsInputKws from "./TagsInputKws";
import InfiniteScroll from "react-infinite-scroll-component";
import TagsInput2 from "./TagsInput2";



interface Props {
    auth,
    defaultEvents: DE[],
    // initItems: Promise<any>
    items: any[]
}

class TweetAnnotation extends React.Component<Props> {
    state = {
        auth: this.props.auth,
        postAfter: new Date(),
        items: this.props.items,
        de: this.props.defaultEvents
    }




    update = (auth, hash, rating, events, names) => {
        if (auth != null) {
            updateLabel(auth, hash, rating, events, names)
            document.getElementById(hash).style.backgroundColor = "LightYellow";
        }
        else {
            toast.error('Please login to start labelling')
        }
    }

    fetchMoreData = async() => {
        console.log('[TweetAnnotation] fetching more')
        let res = await loadUnlabelledPost_accs_kws (
                                getTagsInput('searchAcc', true)
                                , getKwInput('searchKey', false)
                                , 10
                                , this.state.postAfter
                            )
        res.forEach(data => this.state.items.push(data))
        // res[res.length - 1].pos
    }

    renderProcess = () => {
        return this.state.items.map((data) => (
                    <Box align="left" m={3} borderWidth="1px" borderRadius="lg" p={6} boxShadow="xl" id={data.hash}>
                        {isMasked(this.state.auth) ? '' :
                            <Text color="blue.300">
                                <a href={data.orig}>{data.orig}</a>
                            </Text>}
                        <Text colorScheme="teal">
                            {isMasked(this.state.auth)? '' :<b>{data.account}</b>} {(new Date(data.postAt['seconds'] * 1000).toString())}
                        </Text>
                        {isMasked(this.state.auth)? '' :<Text color="teal">
                            {data.hash}
                        </Text>}
                        <Text color="gray.500" my={2} fontSize="2xl" maxW="6xl">
                            {data.text}
                        </Text>

                        <DefaultEvent id={data.hash+'_events'} defaultEvents={this.state.de} />


                        <Flex align="center" justify="center" mt={3}>
                            <Box mr={2}>Names to be hide</Box>
                            <TagsInput2 id={data.hash+'_maskingNames'} defaultEvents={[]} tags={[]}/>
                            <Divider orientation="vertical" mx={5}/>

                            <Button
                                mx={2}
                                colorScheme="red"
                                onClick={() => this.update(this.state.auth, data.hash, -1
                                                            , getTagsInput(data.hash+'_events')
                                                            , getTagsInput(data.hash+'_maskingNames')

                                )}
                            >
                                Negative
                            </Button>
                            <Button
                                mx={2}
                                colorScheme="yellow"
                                onClick={() => this.update(this.state.auth, data.hash, 0
                                                            , getTagsInput(data.hash+'_events')
                                                            , getTagsInput(data.hash+'_maskingNames')
                                    )}
                            >
                                Neutral
                            </Button>
                            <Button
                                ml={2}
                                colorScheme="green"
                                onClick={() => this.update(this.state.auth, data.hash, 1
                                                            , getTagsInput(data.hash+'_events')
                                                            , getTagsInput(data.hash+'_maskingNames')
                                    )}
                            >
                                Positive
                            </Button>
                        </Flex>
                    </Box >
                ))
    }


    render() {
        console.log('rendering TweetAnnotation...')
        this.state.items.map((d)=>{console.log(d)})
        return (
            <InfiniteScroll
                dataLength={this.state.items.length}
                next={this.fetchMoreData}
                hasMore={true}
                loader={<h4>Init...</h4>}
            >
                {this.state.items.map(data=>(
                        <Box align="left" m={3} borderWidth="1px" borderRadius="lg" p={6} boxShadow="xl" id={data.hash}>
                            {data}
                        </Box>
                    )
                )}



                {/*{this.state.items.map((data) => (*/}
                {/*    <Box align="left" m={3} borderWidth="1px" borderRadius="lg" p={6} boxShadow="xl" id={data.hash}>*/}
                {/*        {isMasked(this.state.auth) ? '' :*/}
                {/*            <Text color="blue.300">*/}
                {/*                <a href={data.orig}>{data.orig}</a>*/}
                {/*            </Text>}*/}
                {/*        <Text colorScheme="teal">*/}
                {/*            {isMasked(this.state.auth)? '' :<b>{data.account}</b>} {(new Date(data.postAt['seconds'] * 1000).toString())}*/}
                {/*        </Text>*/}
                {/*        {isMasked(this.state.auth)? '' :<Text color="teal">*/}
                {/*            {data.hash}*/}
                {/*        </Text>}*/}
                {/*        <Text color="gray.500" my={2} fontSize="2xl" maxW="6xl">*/}
                {/*            {data.text}*/}
                {/*        </Text>*/}

                {/*        <DefaultEvent id={data.hash+'_events'} defaultEvents={this.state.de} />*/}


                {/*        <Flex align="center" justify="center" mt={3}>*/}
                {/*            <Box mr={2}>Names to be hide</Box>*/}
                {/*            <TagsInput2 id={data.hash+'_maskingNames'} defaultEvents={[]} tags={[]}/>*/}
                {/*            <Divider orientation="vertical" mx={5}/>*/}

                {/*            <Button*/}
                {/*                mx={2}*/}
                {/*                colorScheme="red"*/}
                {/*                onClick={() => this.update(this.state.auth, data.hash, -1*/}
                {/*                                            , getTagsInput(data.hash+'_events')*/}
                {/*                                            , getTagsInput(data.hash+'_maskingNames')*/}

                {/*                )}*/}
                {/*            >*/}
                {/*                Negative*/}
                {/*            </Button>*/}
                {/*            <Button*/}
                {/*                mx={2}*/}
                {/*                colorScheme="yellow"*/}
                {/*                onClick={() => this.update(this.state.auth, data.hash, 0*/}
                {/*                                            , getTagsInput(data.hash+'_events')*/}
                {/*                                            , getTagsInput(data.hash+'_maskingNames')*/}
                {/*                    )}*/}
                {/*            >*/}
                {/*                Neutral*/}
                {/*            </Button>*/}
                {/*            <Button*/}
                {/*                ml={2}*/}
                {/*                colorScheme="green"*/}
                {/*                onClick={() => this.update(this.state.auth, data.hash, 1*/}
                {/*                                            , getTagsInput(data.hash+'_events')*/}
                {/*                                            , getTagsInput(data.hash+'_maskingNames')*/}
                {/*                    )}*/}
                {/*            >*/}
                {/*                Positive*/}
                {/*            </Button>*/}
                {/*        </Flex>*/}
                {/*    </Box >*/}
                {/*))}*/}
        </InfiniteScroll>
        );
    }

}



export default TweetAnnotation;