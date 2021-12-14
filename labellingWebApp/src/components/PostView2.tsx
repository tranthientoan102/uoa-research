import {Box, Button, Checkbox, Container, Divider, Flex, Grid, SimpleGrid, Spinner, Tag, Text} from '@chakra-ui/react';
import React, {useState} from 'react';
import {
    getDefaultEventList,
    loadUnlabelledPostByAccount,
    refillDb_acc,
    updateLabel,
    loadUnlabelledPost_accs_kws,
    refillDb_kw,
    refillDb_acc_kws, loadLabelledPostByLabelledBy
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
    maskPersonalDetails,
    maskPersonalDetails_AtSign
} from "../utils/common";
import DefaultEvent, {DE} from "./DefaultEvent";
import TagsInput2 from "./TagsInput2";
import TagsInputKws from "./TagsInputKws";
import TweetAnnotation from "./TweetAnnotation";
import InfiniteScroll from "react-infinite-scroll-component";
import {random} from "nanoid";

interface Props {
    auth,

}

class PostView2 extends React.Component<Props> {
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
        loadEachTime: 10,
        de: this.getDE(),
        hasMore: true,
        loading: false,
    }


    // const update = (auth, hash, rating, events, names) => {
    update = (auth, hash, rating, events, names) => {
        if (auth != null) {
            updateLabel(auth, hash, rating, events, names)
            document.getElementById(hash).style.backgroundColor = "LightYellow";
        } else {
            toast.error('Please login to start labelling')
        }
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
            getTagsInput('searchAcc', true)
            , getKwInput('searchKey', false)
            , this.state.loadEachTime
            , this.postAfter
            , this.counter
        )
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
        return (
            <div>
                <Container position="relative" maxW="8xl">
                    <Flex my={2} align="center" justify="center">
                        <Container mx={2} p={0}>
                            <Text>Twitter account</Text>
                            <TagInput2 id="searchAcc" defaultEvents={[]} tags={[]}/>
                        </Container>
                        <Container mx={2} p={0}>
                            <Text>Keyword</Text>
                            <TagsInputKws id="searchKey" tags={[]}
                                          outsideIsAND={true}
                            />
                        </Container>

                        <div id="isMasked">
                            {isAdmin(this.state.auth) ?
                                <Checkbox colorScheme='blue' defaultIsChecked>privacy</Checkbox>
                                : <Checkbox colorScheme='blue' defaultIsChecked isDisabled={true}>privacy</Checkbox>
                            }
                        </div>
                        <Button
                            m={3}
                            onClick={() => {
                                // this.setState({
                                //     items: []
                                //     , loading: true
                                //     , postAfter: new Date()
                                // })
                                this.counter=0;
                                this.fetchMoreData()

                            }}
                            // colorScheme="blue"
                            // background="gray"
                            // color="lightgreen"
                            // onClick={() => process(
                            //     getTagsInput('searchAcc', true)
                            //     , getKwInput('searchKey', false)
                            // )}
                        >
                            <p>Load more</p>
                        </Button>

                    </Flex>


                    {/* </Flex> */}
                </Container>
                <Container maxW="8xl">
                    <SimpleGrid my={2} align="center">
                        <InfiniteScroll
                            dataLength={this.state.items.length}
                            next={this.fetchMoreData}
                            hasMore={this.state.hasMore}
                            loader={''}
                        >
                            {this.state.items.map(data => (
                                    <Box align="left" m={3} borderWidth="1px" borderRadius="lg" p={6} boxShadow="xl"
                                         id={data.hash} key={data.hash}>
                                        {isMasked(this.state.auth) ? '' :
                                            <Text color="blue.300">
                                                <a href={data.orig}>{data.orig}</a>
                                            </Text>}
                                        <Text colorScheme="teal">
                                            {isMasked(this.state.auth) ? '' :
                                                <b>{data.account}</b>}
                                            {(new Date(data.postAt['seconds'] * 1000).toString())}

                                        </Text>
                                        <Text color="teal">
                                            {data.hash}
                                        </Text>
                                        <Text color="gray.500" my={2} fontSize="2xl" maxW="6xl">
                                            {isMasked(this.state.auth) ? maskPersonalDetails_AtSign(data.text) : data.text}
                                        </Text>

                                        <div id={data.hash + '_events'}>
                                            {this.state.de.map(de => (
                                                <Checkbox mr={4} mb={2} fontSize={12} colorScheme='blue'
                                                    key={data.hash+ '_events'+random(1)}
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