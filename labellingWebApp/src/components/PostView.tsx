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


import {
    fetchData,
    getKwInput,
    getTagsInput,
    isAdmin,
    isMasked,
    explainKws,
    maskPersonalDetails_AtSign
} from "../utils/common";
import DefaultEvent from "./DefaultEvent";
import TagsInput2 from "./TagsInput2";
import TagsInputKws from "./TagsInputKws";

const PostView = (props) => {

    // const formData = JSON.parse(props.formData);
    // console.log(formData)
    toast.configure()
    const { auth, signinWithGoogle } = useAuth();
    const [data, setData] = useState("init data");
    const [query, setQuery] = useState('');
    const [defaultEvent, setDefaultEvent] = useState([]);
    const [tagDisplay, setTagDisplay] = useState([])
    let tags = {}


    let de = []

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

    const update = (auth, hash, rating, events, maskingNames) => {
        if (auth != null) {
            updateLabel(auth, hash, rating, events, maskingNames)
            document.getElementById(hash).style.backgroundColor = "LightYellow";
        }
        else {
            toast.error('Please login to start labelling')
        }
    }


    const process = async (accs: string[], kws:string[][]) => {
        // @ts-ignore
        setData(<Flex my={2} align="center" justify="center" ><p>loading post from {accs} with keywords {explainKws('searchKey')}</p>
                <Spinner size="md" m={1} thickness="4px"
                          speed="0.65s"
                          emptyColor="gray.200"
                          color="blue.500"/>
        </Flex>
        )
        // let res = null

        getDefaultEventList().then(res => de = res)

        let res = await fetchData(accs, kws, 500)


        // if (kws.length == 0){
        //     res = await loadUnlabelledPostByAccount(accs)
        // }else res = await loadUnlabelledPost_accs_kws(accs, kws)
        //
        //
        //
        // let latestDate = new Date(res[0].postAt['seconds'] * 1000)
        // // @ts-ignore
        // let isOlderThan1Day = ((new Date()) - latestDate)/(1000 * 3600 * 24) > 1
        //
        // if ((res.length < 500) || (isOlderThan1Day)) {
        //     toast.info('Auto scrapping latest tweets')
        //     refillData(accs,kws)
        // }


        const newData = generateForm(auth, res)
        // @ts-ignore
        setData(newData)
    }
    // @ts-ignore
    // const refillData = async (accs:string[], kws:string[][]) => {
    //     // setData("...preparing db...")
    //     //
    //     // let accs = getTagsInput('searchAcc',true)
    //     // let kws = getTagsInput('searchKey',false)
    //
    //     // let isWaiting = true
    //
    //     if (accs.length > 0 && kws.length > 0) {
    //         // refillDbWithAccount(accs.join(','))
    //         refillDb_acc_kws(accs, kws)
    //     } else {
    //         if (accs.length > 0) refillDb_acc(accs.join(','))
    //         else if (kws.length > 0) refillDb_kw(kws)
    //         else {
    //             toast.error('Please check your input')
    //             // isWaiting = false
    //         }
    //     }
    //     // if (isWaiting) {
    //     //     toast.info('Please wait for DB to be filled up...', {autoClose: 10000})
    //     //     setTimeout(() => {
    //     //         fetchData(accs, kws)
    //     //     }, 10000)
    //     // }
    //
    //     // } else
    //     //     toast.error('Please specifiy desired account')
    //     // } catch (err) {
    //     //     toast.error('REFILL FAILED: ' + err)
    //     // }
    // }


    // const isMasked = (auth) => {
    //     let isAdmin = auth.roles.includes('admin')
    //     return !isAdmin || document.getElementById('isMasked')
    //                         .querySelector('.chakra-checkbox__control.css-xxkadm').hasChildNodes()
    // }
    //
    // const isAdmin = (auth) => {
    //     return auth.roles.includes('admin')
    // }


    const generateForm = (auth, promiseData) => {
        toast.info(`load ${promiseData.length} unlabelled tweets`,{ autoClose: 5000 })


        try {
            let result = []

            promiseData.forEach(data => {
                // @ts-ignore
                // @ts-ignore
                result.push(
                    <Box align="left" m={3} borderWidth="1px" borderRadius="lg" p={6} boxShadow="xl" id={data.hash}>
                        {isMasked(auth) ? '' :
                            <Text color="blue.300">
                                <a href={data.orig}>{data.orig}</a>
                            </Text>}
                        <Text colorScheme="teal">
                            {isMasked(auth)? '' :<b>{data.account}</b>} {(new Date(data.postAt['seconds'] * 1000).toString())}
                        </Text>
                        <Text color="teal">
                            {data.hash}
                        </Text>
                        <Text color="gray.500" my={2} fontSize="2xl" maxW="6xl">
                            {isMasked(auth) ? maskPersonalDetails_AtSign(data.text): data.text}
                        </Text>

                        <DefaultEvent id={data.hash+'_events'} defaultEvents={de} />

                        <Flex alignItems="center">
                            <Box mr={2}>Names to be hide</Box>
                            <TagsInput2 id={data.hash+'_maskingNames'} defaultEvents={[]} tags={[]}/>
                            <Divider orientation="vertical" mx={5}/>
                            <Flex align="center" justify="center" ml={5}>
                                <Button
                                    mx={2}
                                    colorScheme="red"
                                    onClick={() => update(auth, data.hash, -1
                                                            , getTagsInput(data.hash+'_events')
                                                            , getTagsInput(data.hash+'_maskingNames')
                                    )}
                                >
                                    Negative
                                </Button>
                                <Button
                                    mx={2}
                                    colorScheme="yellow"
                                    onClick={() => update(auth, data.hash, 0
                                                            , getTagsInput(data.hash+'_events')
                                                            , getTagsInput(data.hash+'_maskingNames')
                                    )}
                                >
                                    Neutral
                                </Button>
                                <Button
                                    ml={2}
                                    colorScheme="green"
                                    onClick={() => update(auth, data.hash, 1
                                                            , getTagsInput(data.hash+'_events')
                                                            , getTagsInput(data.hash+'_maskingNames')
                                    )}

                                >
                                    Positive
                                </Button>
                            </Flex>
                        </Flex>


                    </Box >
                )
            });
            return result;


        } catch (err) {
            console.error('Error occurred: ' + err)
        }
    }

    return (
        <div>
            <Container position="relative" maxW="8xl">
                <Flex  my={2} align="center" justify="center" >
                    {/*<Container  align="top" justify="center" >*/}
                        <Container mx={2} p={0}>
                            <Text>Twitter account</Text>
                            <TagsInput2 id="searchAcc" defaultEvents={[]} tags={[]} />
                        </Container>
                    {/*</Container>*/}

                    {/*<Container  align="top" justify="center" >*/}
                        <Container mx={2} p={0}>
                            {/*<Grid>*/}
                                <Text>Keyword</Text>
                                <TagsInputKws id="searchKey" tags={[]}
                                            // onChange={setQuery(explainKws('searchKey'))}
                                    outsideIsAND={true}
                                />

                            {/*</Grid>*/}
                        </Container>

                    {/*</Container>*/}

                    {/*<Container mx={2} p={0}>*/}
                    {/*    <Text>Keyword</Text>*/}
                    {/*    <TagInput2 id="searchKey" defaultEvents={[]} tags={[]} />*/}
                    {/*</Container>*/}

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
                        onClick={() => process(
                            getTagsInput('searchAcc', true)
                            , getKwInput('searchKey', false)
                        )}
                    >
                        <p>Load more</p>
                    </Button>

                </Flex>


                {/* </Flex> */}
            </Container>
            <Container maxW="8xl">
                <SimpleGrid my={2} >
                    {/* {generateForm(auth, props)} */}
                    <div>{data}</div>
                </SimpleGrid>
            </Container>
        </div >
    );
}



export default PostView;