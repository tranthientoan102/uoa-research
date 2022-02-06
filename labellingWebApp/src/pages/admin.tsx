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
import {
    createDefaultEvent,
    createDefaultKws,
    deleteDefaultEvent, deleteDefaultKws,
    getDefaultEventList,
    getDefaultKws
} from "../utils/db";
import TagsInput2 from "../components/TagsInput2";
import {decrypting, getTagsInput, testEncrypt} from "../utils/common";
import ItemCrd from "../components/ItemCrd";

interface Props {
    data: string[]
}

const Admin = (props) => {
    const id = 'admin'
    const childWidth = 1/3


    // const formData = JSON.parse(props.formData);
    // console.log(formData)

    toast.configure()
    const { auth, signinWithGoogle } = useAuth();
    const [data, setData] = useState('');
    const [de,setDE] = useState('')
    const [dkws, setDkws] = useState('')


    const [decrypted, setDecrypted] = useState([''])
    const [encrypted, setEncrypted] = useState('')



    // let de = []
    const isAuthoriesed = (auth) =>{
        return (auth != null) && auth.roles.includes('admin')
    }

    const decryptData = (text) => {
        setDecrypted(decrypting(text))
    }




    return (
        <div>
            <Head>
                <title>Text Labelling tool</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <Navbar />
                <Flex align="center" justify="center">
                    <Text fontSize="3xl" mb={4} color='dodgerblue'>This is Admin page</Text>
                </Flex>
                {/*<Flex maxW="6xl" pt={6}>*/}
                {isAuthoriesed(auth)? (
                    <Flex pt={6} px={4} flexDirection="row" flexWrap="wrap" justify="center" align="start">

                        <Grid width={childWidth} align="center" justify="center" px={5} >
                            <ItemCrd  auth={auth} compTittle={'Load Default Event'}
                                      createFnc={createDefaultEvent}
                                      getFnc={getDefaultEventList}
                                      deleteFnc={deleteDefaultEvent}
                                      inputId={'defaultEvent'}/>
                        </Grid>

                        <Grid width={childWidth} align="center" justify="center" px={5}>
                            <ItemCrd  auth={auth} compTittle={'Load Default Keywords'}
                                      createFnc={createDefaultKws}
                                      getFnc={getDefaultKws}
                                      deleteFnc={deleteDefaultKws}
                                      inputId={'defaultKeywords'}/>
                        </Grid>


                        <Grid align="center" justify="top" pt={5} px={5}>
                            <Text fontSize="2xl">Encrypted data</Text>
                            <Textarea id="encrypted"
                                   onChange={event => {
                                        setDecrypted(decrypting(event.target.value))
                                   }}/>
                            <Text id="decrypted" readOnly={true}>{decrypted.map(function (d, idx){
                                return (<p key={idx}>{d}</p>)
                            })}</Text>
                        </Grid>


                    </Flex>
                    ):('Authorities required') }
                {/*</Flex>*/}

            </main>

        </div>

    );
}

export default Admin;