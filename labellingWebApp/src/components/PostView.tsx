import {Box, Container, Flex, SimpleGrid, Text, Button, Grid} from '@chakra-ui/react';
import { Input } from "@chakra-ui/react"
import React, { useState } from 'react';
import { loadUnlabelledPostByAccount, loadUnlabelledPost, updateLabel, refillDbWithAccount, getDefaultEventList } from '../utils/db';
import { useAuth } from "../lib/auth";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import TagInput2 from './TagsInput2';
import {getTagsInput} from "../utils/common";

const PostView = (props) => {

    // const formData = JSON.parse(props.formData);
    // console.log(formData)
    toast.configure()
    const { auth, signinWithGoogle } = useAuth();
    const [data, setData] = useState("init data");
    const [defaultEvent, setDefaultEvent] = useState([]);
    const [tagDisplay, setTagDisplay] = useState([])
    let tags = {}
    const addNewTag = (hash, newTag) => {
        tags[hash].push(newTag)
        console.log(tags)
    }

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

    const update = (auth, hash, rating, events) => {



        if (auth != null) {
            updateLabel(auth, hash, rating, events)
            document.getElementById(hash).style.backgroundColor = "LightYellow";
        }
        else {
            toast.error('Please login to start labelling')
        }
    }


    const fetchData = async (accs: string[]) => {
        setData(`loading post from ${accs}...`)
        let res = null

        getDefaultEventList().then(res => de = res)



        if (accs.length > 0)
            res = await loadUnlabelledPostByAccount(accs)
        else
            res = await loadUnlabelledPost()
        const newData = await generateForm(auth, res)
        // @ts-ignore
        setData(newData)
    }
    // @ts-ignore
    const refillData = async () => {
        setData("...preparing db...")
        let accs = getTagsInput('searchAcc',true)
        // try {
        if (accs.length > 0) {
            toast.info('Please wait for DB to be filled up...', { autoClose: 10000 })

            refillDbWithAccount(accs.join(','))
            setTimeout(() => { fetchData(accs) }, 10000)


        } else
            toast.error('Please specifiy desired account')
        // } catch (err) {
        //     toast.error('REFILL FAILED: ' + err)
        // }
    }


    const generateForm = (auth, promiseData) => {


        try {
            let result = []

            promiseData.forEach(data => {
                // @ts-ignore
                // @ts-ignore
                result.push(
                    <Box m={3} borderWidth="1px" borderRadius="lg" p={6} boxShadow="xl" id={data.hash}>
                        <Text color="blue.300" mt={2}>
                            <a href={data.orig}>{data.orig}</a>
                        </Text>
                        <Text colorScheme="teal">
                            <b>{data.account}</b> {(new Date(data.postAt['seconds'] * 1000).toString())}
                        </Text>
                        <Text color="teal">
                            {data.hash}
                        </Text>
                        <Text color="gray.500" my={2} fontSize="2xl">
                            {data.text}
                        </Text>

                        <TagInput2 id={data.hash} tags={[]} defaultEvents={de} />


                        <Flex align="center" justify="center" mt={3}>


                            <Button
                                mx={2}
                                colorScheme="red"
                                onClick={() => update(auth, data.hash, -1, getTagsInput(data.hash))}
                            >
                                Negative
                            </Button>
                            <Button
                                mx={2}
                                colorScheme="yellow"
                                onClick={() => update(auth, data.hash, 0, getTagsInput(data.hash))}
                            >
                                Neutral
                            </Button>
                            <Button
                                ml={2}
                                colorScheme="green"
                                onClick={() => update(auth, data.hash, 1, getTagsInput(data.hash))}
                            >
                                Possitive
                            </Button>
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
            <Container maxW="6xl">
                <Flex  my={6} align="center" justify="center">

                    <TagInput2 id="searchAcc" defaultEvents={[]} tags={['sahealth']} />

                    <Button
                        ml={3}
                        colorScheme="blue"
                        onClick={() => fetchData(getTagsInput('searchAcc', true))}
                    >
                        Go
                    </Button>
                </Flex>


                {/* </Flex> */}
            </Container>
            <Container maxW="6xl">
                <SimpleGrid>
                    {/* {generateForm(auth, props)} */}
                    {data}
                </SimpleGrid>
                <SimpleGrid >
                    <Button mt={6} mx={3} colorScheme="blue" onClick={() => fetchData(getTagsInput('searchAcc', true))}>Load more</Button>
                    <Button
                        m={3}
                        colorScheme="yellow"
                        onClick={() => refillData()}
                    >
                        or REFILL DB
                    </Button>
                </SimpleGrid>
            </Container>
        </div >
    );
}



export default PostView;