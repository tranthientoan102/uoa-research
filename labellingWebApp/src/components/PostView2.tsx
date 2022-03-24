import {
    Box,
    Button,
    Checkbox,
    Container,
    Divider,
    Flex,
    Grid,
    HStack,
    SimpleGrid,
    Spinner,
    Tag,
    Text
} from '@chakra-ui/react';
import React, { Component, useState } from 'react';
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
    maskPersonalDetails_AtSign, getCountRecent, findByType, findAccess
} from "../utils/common";
import DefaultEvent, {DE} from "./DefaultEvent";
import TagsInput2 from "./TagsInput2";
import TagsInputKws from "./TagsInputKws";
import InfiniteScroll from "react-infinite-scroll-component";
import {random} from "nanoid";
import PostView2Decoration from "./PostView2Decoration";
import {SocialIcon} from "react-social-icons";

import {MdOutlinePlace, MdOutlineTrendingUp} from 'react-icons/md';
import TweetHeader from "./TweetHeader";
import SelectOption, { SelectionMode, SelectOptionProps } from './SelectOption';
interface Props {
    auth,

}

class PostView2 extends Component<Props> {
// const PostView2 = (props) => {
    // const formData = JSON.parse(props.formData);
    // console.log(formData)
    // toast.configure()
    // const { auth, signinWithGoogle } = useAuth();
    // const [data, setData] = useState("init data");

    // const [items, setItems] = useState([]);

    // let items = []
    // let de = []

    // const getEvents = (hash) => {
    //     let tags = []
    //     document.getElementById(hash).querySelectorAll('.chakra-checkbox.css-khpbvo').forEach(de => {
    //         if (de.querySelector('.chakra-checkbox__control.css-xxkadm').hasChildNodes())
    //             tags.push(de.querySelector('.chakra-checkbox__label.css-1sgc0qu').innerHTML)
    //     })
    //     document.getElementById(hash).querySelector('.react-tagsinput').querySelectorAll('span .react-tagsinput-tag').forEach((element) => {
    //         tags.push(element.innerHTML.replace("<a></a>", ""))
    //     })
    //     return tags.join(',')
    // }


    // const getDE = () => {
    getDE = () => {
        let result = []
        getDefaultEventList().then(data => {
            data.forEach(d => result.push(d))
        })

        return result
    }


    counter = 0;
    postAfter= new Date();
    state = {
        name: 'PostView2',
        auth: this.props.auth,

        items: [],
        loadEachTime: 20,
        de: this.getDE(),
        hasMore: true,
        loading: false,
        tweetCount: undefined,

    }
    sortBy = 'fav'

    // const update = (auth, hash, rating, events, names) => {
    update = (auth, hash, rating, events, names) => {
        if (auth != null) {
            updateLabel(auth, hash, rating, events, names)
            document.getElementById(hash).style.backgroundColor = "LightYellow";
        } else {
            toast.error('Please login to start labelling')
        }
    }

    getCount = async () => {
        let tmp = 0
        await getCountRecent(getKwInput('searchKey', false, !this.state.loading)).then(data => {
            tmp = data.data
        })
         this.setState({
                tweetCount: tmp
            })

    }

    callbackFunction = (childData) => {
        this.sortBy = childData
        console.log(`sort by ${this.sortBy}`)
    }


    fetchMoreData = async () => {
        if (this.counter==0){
            toast.info('resetting configs...',{autoClose: 2000})
            let cur = new Date()
            this.setState({
                items : []
                , loading : true
            })
            this.postAfter = cur
            // console.log(cur.getTime())
            // console.log(this.postAfter)
        }
        let result = this.state.items
        let res = await fetchData(
            getTagsInput('searchAcc', true, false, !this.state.loading)
            , getKwInput('searchKey', false, !this.state.loading)
            , this.state.loadEachTime
            , this.postAfter
            , this.counter
        )
        let sortBy = this.sortBy == 'like' ? 'fav' : this.sortBy
        res = res.sort((a, b) => b[sortBy] - a[sortBy])
        this.counter++;
        // .then(data => result.push)
        // .finally(() => {
        //     console.log(`displaying ${result.length} items`)
        //     this.setState({items: result})
        //     // setTimeout(() => this.forceUpdate(),2000)
        // })
        // // .finally(() => this.forceUpdate)

        if ((res != null) && (res.length > 0)) {
            this.setState({
                items: this.state.items.concat(res)
            })
            this.postAfter = new Date(res[res.length-1].postAt['seconds']*1000)
            // if (res.length < this.state.loadEachTime) this.fetchMoreData()
        } else {
            this.setState({
                loading: false
            })
        }

        // this.state.items.forEach(d => {
        //     console.log(d)
        //     // this.forceUpdate()
        // })
        console.log(`${this.state.name}-fetchMoreData: done`)

    }

    render() {
        console.log(`render ${this.state.name}`)
        // console.log(findByType(this.sortBy, SelectOption))

        return (
            <div>
                {(findAccess(this.state.auth)) ? (<Container position="relative" maxW="12xl">
                    <Flex my={2} align="top" justify="center">
                        <Container mx={2} p={0}>
                            <Text>Twitter account</Text>
                            <TagInput2 id="searchAcc" defaultEvents={[]} tags={[]}/>
                        </Container>
                        <Container mx={2} p={0}>
                            <Text>Keyword</Text>
                            <TagsInputKws id="searchKey" tags={[]}
                                          outsideIsAND={true}
                                // items={this.kw}
                            />
                        </Container>

                    </Flex>
                    <Flex my={2} align="center" justify="center">
                        <div id="isMasked">
                            {isAdmin(this.state.auth) ?
                                <Checkbox colorScheme='blue' defaultIsChecked>privacy</Checkbox>
                                : <Checkbox colorScheme='blue' defaultIsChecked isDisabled={true}>privacy</Checkbox>
                            }
                        </div>
                        <div id="isPremium">

                            <Checkbox colorScheme='blue' isDisabled={!isAdmin(this.state.auth)} mx={2}
                                      color={'twitter.600'}>
                                <b>PREMIUM SEARCH</b>
                            </Checkbox>

                        </div>
                        <SelectOption title='sort by' id='SortBy'
                            data={['like', 'retweet', 'comment', 'combine']}
                            init={['like']} mode={SelectionMode.ONE} colorScheme={'twitter'}
                            parentCallback={a => this.callbackFunction(a)}
                        />
                        <Button
                            m={3}
                            onClick={() => {
                                this.counter=0;
                                this.setState({
                                    tweetCount: undefined
                                })
                                this.getCount()
                                this.fetchMoreData()
                            }}
                        >
                            <p>Load more</p>
                        </Button>                

                    </Flex>
                    <Flex my={2} align="center" justify="center">
                        {this.state.tweetCount ? `appears on Twitter ${this.state.tweetCount} times in last 7 days` : ''}
                    </Flex>


                    {/* </Flex> */}
                </Container>) :
                
                (<Container position="relative" maxW="12xl">
                        <Text fontWeight={600} fontSize='4xl'>Authorities required</Text>
                            Contact your Admin for more details
                </Container>)}
                

                <Container maxW="8xl">
                    <SimpleGrid my={2}>

                        <InfiniteScroll
                            dataLength={this.state.items.length}
                            next={this.fetchMoreData}
                            hasMore={this.state.hasMore}
                            loader={''}
                        >
                            {this.state.items.map(data => (
                                    <Box align="left" m={3} borderWidth="1px" borderRadius="lg" p={6} boxShadow="xl"
                                         id={data.hash} key={data.hash}>

                                    <TweetHeader isMasked={isMasked(this.state.auth)}
                                        acc={data.account}
                                        like={data.fav} comment={data.comment} retweet={data.retweet}
                                        engage={data.engage}
                                        geo={data.geo}
                                        hash={data.hash} orig={data.orig}
                                        postSec={data.postAt['seconds']}
                                        sortBy={this.sortBy}
                                    />

                                        {/*<Text color="gray.500" my={2} fontSize="2xl" maxW="6xl">*/}
                                        {/*    {isMasked(this.state.auth) ? maskPersonalDetails_AtSign(*/}
                                        {/*                                            highlightKws(data.text*/}
                                        {/*                                                        , getKwInput('searchKey', false)))*/}
                                        {/*                                : data.text}*/}

                                        {/*</Text>*/}
                                        <PostView2Decoration text={data.text} hash={data.hash}
                                                             kws={getKwInput('searchKey', false, !this.state.loading)}
                                        />

                                        <div id={data.hash + '_events'}>
                                            {this.state.de.map(de => (
                                                <Checkbox mr={4} mb={2} fontSize={12} colorScheme='blue'
                                                          key={data.hash + '_events_' + de.name}
                                                >
                                                    {de.name}
                                                </Checkbox>))
                                            }
                                        </div>


                                        <Flex align="center" justify="center" mt={3}>
                                            <Box mr={2}>Private names</Box>
                                            <TagsInput2 id={data.hash + '_maskingNames'} defaultEvents={[]} tags={[]}/>
                                            <Divider orientation="vertical" mx={10}/>

                                            <Button
                                                mx={2}
                                                colorScheme="red"
                                                onClick={() => this.update(this.state.auth, data.hash, -1
                                                    , getTagsInput(data.hash + '_events')
                                                    , getTagsInput(data.hash + '_maskingNames')
                                                )}
                                            >
                                                Negative
                                            </Button>
                                            <Button
                                                mx={2}
                                                colorScheme="yellow"
                                                onClick={() => this.update(this.state.auth, data.hash, 0
                                                    , getTagsInput(data.hash + '_events')
                                                    , getTagsInput(data.hash + '_maskingNames')
                                                )}
                                            >
                                                Neutral
                                            </Button>
                                            <Button
                                                ml={2}
                                                colorScheme="green"
                                                onClick={() => this.update(this.state.auth, data.hash, 1
                                                    , getTagsInput(data.hash + '_events')
                                                    , getTagsInput(data.hash + '_maskingNames')
                                                )}
                                            >
                                                Positive
                                            </Button>
                                        </Flex>
                                    </Box>
                                )
                            )}

                        </InfiniteScroll>
                        <Flex my={2} align="center" justify="center">
                            {this.state.loading ? <Spinner size="xl" m={1} thickness="10px"
                                                           speed="0.65s"
                                                           emptyColor="gray.200"
                                                           color="blue.500"/> : ''}
                        </Flex>

                    </SimpleGrid>
                </Container>
            </div>
        );

    }
}


export default PostView2;