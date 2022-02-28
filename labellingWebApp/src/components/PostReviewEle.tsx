import {
    Box,
    Button,
    Checkbox,
    Container,
    Divider,
    Flex,
    Grid,
    GridItem, Icon, IconButton,
    SimpleGrid,
    Spinner,
    Tag,
    Text
} from '@chakra-ui/react';
import React, {useState} from 'react';
import {
    getDefaultEventList,
    loadUnlabelledPostByAccount,
    refillDb_acc,
    updateLabel,
    loadUnlabelledPost_accs_kws,
    refillDb_kw,
    refillDb_acc_kws, loadLabelledPostByLabelledBy, updateReview
} from '../utils/db';
import {useAuth} from "../lib/auth";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    fetchData,
    getKwInput,
    getTagsInput,
    isAdmin,
    isMasked,
    explainKws,
    maskPersonalDetails,
    maskPersonalDetails_AtSign
} from "../utils/common";
import {CheckIcon, SearchIcon} from "@chakra-ui/icons";
import { SocialIcon } from 'react-social-icons';
import TweetHeader from "./TweetHeader";



interface Props {
    auth: any
    , isMasked: boolean
    , hash: string
    , account: string
    , text: string
    , geo: string
    , like: number
    , retweet: number
    , comment: number
    , engage: number
    , orig: string
    , postAt: number
    , rating: string
    , events: string[]
    , labelledBy: string


    , de: string[]

}

class PostReviewEle extends React.Component<Props> {

    // getDE = () => {
    //     let result = []
    //     getDefaultEventList().then(data => {
    //         data.forEach(d => result.push(d))
    //     })
    //
    //     return result
    // }
    //
    // counter = 0;
    // postAfter = new Date();


    state = {
        name: 'PostReviewEle'
        , auth: this.props.auth

        // , isMasked: isChecked('isMasked')
        , isMasked: this.props.isMasked

        , hash: this.props.hash
        , account: this.props.account
        , text: this.props.text
        , orig: this.props.orig
        , postAt: this.props.postAt
        , rating: this.props.rating
        , events: this.props.events
        , labelledBy: this.props.labelledBy

        , de: this.props.de
        , reviewed: false



}

    constructor(props){
        super(props)

    }






    // const update = (auth, hash, rating, events, names) => {


    render() {
        // console.log(`render ${this.state.name}`)
        return (

            <Box align="left" m={3} borderWidth="1px" borderRadius="lg" p={6} boxShadow="xl"
                 id={this.state.hash} bgColor={this.state.reviewed?'yellow.50':'white'}>

                <TweetHeader isMasked={isMasked(this.state.auth)}
                    acc={this.state.account} geo={this.props.geo}
                    like={this.props.like} retweet={this.props.retweet} comment={this.props.comment} engage={this.props.engage}
                    sortBy='like'
                    hash={this.state.hash} orig={this.state.orig} postSec={this.state.postAt} />


                <Text color="gray.500" my={2} fontSize="2xl" maxW="6xl">
                    {this.state.isMasked ? maskPersonalDetails_AtSign(this.state.text) : this.state.text}
                </Text>
                <Grid templateColumns='repeat(4, 1fr)' my={3} color={"gray.600"} gap={2}>
                    <p>rating: <br/>{this.state.rating}</p>
                    <p>events: <br/>{this.state.events.join(', ')}</p>
                    <p>by: <br/>{this.state.labelledBy}</p>
                </Grid>

                <Grid templateColumns={'repeat(8,1fr)'}>
                    <Container color={""}
                               // backgroundColor={'green.200'}
                               py={1} m={0}
                               maxW={"10x1"}>

                        <Button colorScheme={'twitter'}
                                onClick={()=> {
                                    updateReview(this.state.auth
                                        , this.state.hash
                                        , this.state.rating
                                        , this.state.events
                                        , this.state.auth.email
                                    )

                                    // this.state.reviewed= true
                                    this.setState({reviewed: true})
                                    this.forceUpdate()
                                }}
                                // isDisabled={this.state.reviewed}
                        >
                            Agree
                            <Icon as={CheckIcon} ml={3}/>️</Button>

                    </Container>
                    <GridItem colSpan={7}
                              bg='blue.50'
                              px={3} py={1}
                    > Dont agree
                        <div id={this.state.hash + '_events'}>
                            {this.state.de.map(de => (
                                <Checkbox mr={4} mb={2} fontSize={12} colorScheme='blue'
                                          // isDisabled={this.state.reviewed}
                                          key={this.state.hash + '_events_' + de}
                                >
                                    {de}
                                </Checkbox>))
                            }
                        </div>
                        <Flex align="center" justify="center" mt={3}>

                            <Button
                                // isDisabled={this.state.reviewed}
                                mx={2} mb={4}
                                colorScheme="red"
                                onClick={() => {
                                    updateReview(this.state.auth, this.state.hash, -1
                                        , getTagsInput(this.state.hash + '_events')
                                        , this.state.auth.email
                                    )
                                    this.setState({reviewed: true})
                                    // this.forceUpdate()
                                }}
                            >
                                Negative
                            </Button>
                            <Button
                                // isDisabled={this.state.reviewed}
                                mx={2} mb={4}
                                colorScheme="yellow"
                                onClick={() => {
                                    updateReview(this.state.auth, this.state.hash, 0
                                        , getTagsInput(this.state.hash + '_events')
                                        , this.state.auth.email
                                    )
                                    this.setState({reviewed: true})
                                    this.forceUpdate()
                                }}
                            >
                                Neutral
                            </Button>
                            <Button
                                // isDisabled={this.state.reviewed}
                                ml={2} mb={4}
                                colorScheme="green"
                                onClick={() => {
                                    updateReview(this.state.auth, this.state.hash, 1
                                        , getTagsInput(this.state.hash + '_events')
                                        , this.state.auth.email
                                    )
                                    this.setState({reviewed: true})
                                    this.forceUpdate()
                                }}
                            >
                                Positive
                            </Button>
                        </Flex>
                    </GridItem>

                </Grid>

                {/*<div id={this.state.hash + '_events'}>*/}
                {/*    {this.state.de.map(de => (*/}
                {/*        <Checkbox mr={4} mb={2} fontSize={12} colorScheme='blue'>*/}
                {/*            {de.name}*/}
                {/*        </Checkbox>))*/}
                {/*    }*/}
                {/*</div>*/}


                {/*<Flex align="center" justify="center" mt={3}>*/}
                {/*    <Box mr={2}>Private names</Box>*/}
                {/*    <TagsInput2 id={data.hash + '_maskingNames'} defaultEvents={[]} tags={[]}/>*/}
                {/*    <Divider orientation="vertical" mx={10}/>*/}

                {/*    <Button*/}
                {/*        mx={2}*/}
                {/*        colorScheme="red"*/}
                {/*        onClick={() => this.update(this.state.auth, data.hash, -1*/}
                {/*            , getTagsInput(data.hash + '_events')*/}
                {/*            , getTagsInput(data.hash + '_maskingNames')*/}
                {/*        )}*/}
                {/*    >*/}
                {/*        Negative*/}
                {/*    </Button>*/}
                {/*    <Button*/}
                {/*        mx={2}*/}
                {/*        colorScheme="yellow"*/}
                {/*        onClick={() => this.update(this.state.auth, data.hash, 0*/}
                {/*            , getTagsInput(data.hash + '_events')*/}
                {/*            , getTagsInput(data.hash + '_maskingNames')*/}
                {/*        )}*/}
                {/*    >*/}
                {/*        Neutral*/}
                {/*    </Button>*/}
                {/*    <Button*/}
                {/*        ml={2}*/}
                {/*        colorScheme="green"*/}
                {/*        onClick={() => this.update(this.state.auth, data.hash, 1*/}
                {/*            , getTagsInput(data.hash + '_events')*/}
                {/*            , getTagsInput(data.hash + '_maskingNames')*/}
                {/*        )}*/}
                {/*    >*/}
                {/*        Positive*/}
                {/*    </Button>*/}
                {/*</Flex>*/}
            </Box>

        );
    }
}


export default PostReviewEle;