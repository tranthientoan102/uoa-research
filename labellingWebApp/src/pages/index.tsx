import { Box, Container, Divider, Flex, Heading, SimpleGrid, Text, HStack, Button, Spacer } from '@chakra-ui/react';
import { Input } from "@chakra-ui/react"
import Head from 'next/head';
import { useRouter } from 'next/dist/client/router';
import React, { useState } from 'react';
import Navbar from '../components/Navbar';

import { useAuth } from "../lib/auth";

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PostView from '../components/PostView';

const Home = (props) => {

    // const formData = JSON.parse(props.formData);
    // console.log(formData)

    toast.configure()
    const { auth, signinWithGoogle } = useAuth();
    // const [tags, setTags] = useState([])
    // const router = useRouter();

    return (
        <div>
            <Head>
                <title>Text Labelling tool</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <Navbar />
                <PostView></PostView>
            </main>
            <footer></footer>
        </div >
    );
}




export default Home;