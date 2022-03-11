import { Box, Container, Divider, Flex, Heading, SimpleGrid, Text, HStack, Button, Spacer } from '@chakra-ui/react';
import { Input } from "@chakra-ui/react"
import Head from 'next/head';
import React, {useEffect, useState} from 'react';
import Navbar from '../components/Navbar';

import { useAuth } from "../lib/auth";

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PostView from '../components/PostView';
import signin from "./signin";
import PostView2 from "../components/PostView2";

const Home = (props) => {

    // const formData = JSON.parse(props.formData);
    // console.log(formData)

    toast.configure()
    const { auth, signinWithGoogle } = useAuth();

    return (
        <div>
            <Head>
                <title>Text Labelling tool</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <Navbar />
                {process.env.NEXT_PUBLIC_SHOW_WARNING == 'true'?
                    <Box background="coral" color='white'>
                        <Container justify={"center"} align={"center"} >

                                New server for Roche users has been deployed at <br/>
                            <b><a href="http://52.189.248.255:3000/">http://52.189.248.255:3000</a></b><br/>

                            Please switch to new server if you&#39;re from Roche.<br/>
                            Thank you
                        </Container>

                    </Box>

                    :''
                }

                {auth != null? (<PostView2 auth={auth}/>): (
                    <Container>Please log in for start using tool</Container>
                        )}

            </main>
            <footer></footer>
        </div >
    );
}




export default Home;