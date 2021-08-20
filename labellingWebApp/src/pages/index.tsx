import { Box, Container, Divider, Flex, Heading, SimpleGrid, Text, HStack, Button, Spacer } from '@chakra-ui/react';
import { Input } from "@chakra-ui/react"
import Head from 'next/head';
import { useRouter } from 'next/dist/client/router';
import React from 'react';
import Navbar from '../components/Navbar';
import { loadUnlabelledPostByAccount, loadUnlabelledPost, updateLabel } from '../utils/db';
import { useAuth } from "../lib/auth";

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PostView from '../components/PostView';

const Home = (props) => {

    // const formData = JSON.parse(props.formData);
    // console.log(formData)

    toast.configure()
    const { auth, signinWithGoogle } = useAuth();
    const router = useRouter();

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

// export async function getServerSideProps() {

//     console.log('function getServerSideProps: dont know what it do')

//     // const data = await (await loadUnlabelledComment()).map((formData: any) => {
//     //     return 
//     // })

//     const unlabelledComment = await loadUnlabelledPostByAccount();
//     if (unlabelledComment)
//         return { props: { formData: JSON.stringify(unlabelledComment) } };
//     else
//         return { props: { formData: JSON.stringify({ a: 'a', b: 'c' }) } }
// }






export default Home;