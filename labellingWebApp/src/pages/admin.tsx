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
    Spinner,
    Input, Grid, Textarea, IconButton
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from "../lib/auth";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {createDefaultEvent, deleteDefaultEvent, getDefaultEventList} from "../utils/db";
import TagsInput2 from "../components/TagsInput2";
import {decrypting, getTagsInput, testEncrypt} from "../utils/common";

interface Props {
    data: string[]
}

const Admin = (props) => {
    const id = 'admin'

    // const formData = JSON.parse(props.formData);
    // console.log(formData)

    toast.configure()
    const { auth, signinWithGoogle } = useAuth();
    const [data, setData] = useState('');
    const [de,setDE] = useState('')
    const [decrypted, setDecrypted] = useState([''])
    const [encrypted, setEncrypted] = useState('')

    useEffect(() => {
        if (isAuthoriesed(auth)) {
            generateDE();
        }
        else {
            toast.error(auth)
        }
        // generateDE();
    } ,[])

    // let de = []
    const isAuthoriesed = (auth) =>{
        return (auth != null) && auth.roles.includes('admin')
    }
    const generateDE = async() => {

        let result = []
        let tmp = []


        // @ts-ignore
        setData(<Spinner size="xl" m={5} thickness="6px"
                          speed="0.65s"
                          emptyColor="gray.200"
                          color="blue.500"/>)

        await getDefaultEventList().then(res => {
            for (const i of res) {
                tmp.push(
                        <Box id={i.id}>
                            <Flex align="center" justify="center"  m={2} px={2} >
                                    {i.name}
                                    <Box pl={1} >
                                        <DeleteIcon w={4} h={4} color={'Tomato'} onClick={()=> whenDeletingEvent(i.id)} />
                                    </Box>
                            </Flex>
                        </Box>)
            }
        }).finally(() => {
            // result.push(<Box>{tmp}</Box>)
            // result.push(<TagsInput2 id='newDE' tags={[]} defaultEvents={[]}/>)
            // setData(result)
        })
        tmp.push(<TagsInput2 id='newDE' tags={[]} defaultEvents={[]}/>);
        tmp.push(
                    <Button my={2} colorScheme='telegram' onClick={()=> {
                                createDefaultEvent(getTagsInput('newDE'), auth);
                                generateDE();
                    }} >
                        Add new Default Event
                    </Button>
        )
        result.push(<SimpleGrid>{tmp}</SimpleGrid>);

        // @ts-ignore
        setData(result);


    }
    const decryptData = (text) => {
        setDecrypted(decrypting(text))
    }

    const whenDeletingEvent = (hash) => {

        deleteDefaultEvent(hash).then(()=> {
            generateDE()
        })
    }


    return (
        <div>
            <Head>
                <title>Text Labelling tool</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <Navbar />
                <Container p={2}>
                    {isAuthoriesed(auth)? (
                        <SimpleGrid align="center" justify="center">
                            <Text fontSize="3xl" mb={4} color='dodgerblue'>This is Admin page</Text>

                            <Button onClick={()=> generateDE()}>
                                Load Default Event list
                            </Button>
                            <div>{data}</div>



                            <SimpleGrid align="center" justify="center" pt={5} >
                                <Text fontSize="2xl">Encrypted data</Text>
                                <Textarea id="encrypted"
                                       onChange={event => {
                                            setDecrypted(decrypting(event.target.value))
                                       }}/>
                                <Text id="decrypted" readOnly={true}>{decrypted.map(function (d, idx){
                                    return (<p key={idx}>{d}</p>)
                                })}</Text>
                            </SimpleGrid>
                        </SimpleGrid>
                    ):('Authorities required') }
                </Container>

            </main>

        </div>

    );
}

export default Admin;