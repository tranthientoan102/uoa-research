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
import {redirect} from "next/dist/server/api-utils";

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
                {auth != null? (<PostView></PostView>): (
                    <Container>Please log in for start using tool</Container>
                        )}
            </main>
            <footer></footer>
        </div >
    );
}




export default Home;