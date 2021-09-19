import { Box, Container, Divider, Flex, Heading, SimpleGrid, Text, HStack, Button, Spacer } from '@chakra-ui/react';
import Head from 'next/head';
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from "../lib/auth";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {createDefaultEvent, getDefaultEventList} from "../utils/db";
import TagsInput2 from "../components/TagsInput2";
import {getTagsInput} from "../utils/common";

interface Props {
    data: string[]
}

const Admin = (props) => {
    const id = 'admin'

    // const formData = JSON.parse(props.formData);
    // console.log(formData)

    toast.configure()
    const { auth, signinWithGoogle } = useAuth();
    const [data, setData] = useState("");
    const [de,setDE] = useState('')

    // let de = []
    const isAuthoriesed = (auth) =>{
        return (auth != null) && auth.roles.includes('admin')
    }
    const generateDE = async() => {
        let tmp = []
        await getDefaultEventList().then(res => {
            for (const e of res) tmp.push(e.name)
        })
        setDE(tmp)
        console.log(de)
        let result = []
        for (const e of de)
            result.push(<Text m={1}>{e}</Text>)
        result.push(<TagsInput2 id='newDE' tags={[]} defaultEvents={[]}/>)

        // @ts-ignore
        setData(result)
    }


    return (
        <>
            <Navbar />
            <Container p={2}>
                {isAuthoriesed(auth)? (
                    <SimpleGrid align="center" justify="center">
                        <Text fontSize="3xl" mb={4} color='dodgerblue'>This is Admin page</Text>

                        <Button onClick={()=> generateDE()}>
                            Load Default Event list
                        </Button>
                        <div>{data}</div>

                        <Button my={2} colorScheme='telegram' onClick={()=> {

                            // let inputList = getTagsInput('newDE')
                            // for (let index in inputList){
                            //     // console.log(inputList[index])
                            //     // console.log(de.filter(x => x ==inputList[index]))
                            //     if (de.filter(x => x ==inputList[index]).length==0 ) inputList.splice(index)
                            //     else console.log(`${inputList[index]} currently existed`)
                            // }

                            createDefaultEvent(getTagsInput('newDE'), auth)

                        }} >
                            Add new Default Event
                        </Button>
                    </SimpleGrid>
                ):('Authorities required') }
            </Container>

        </>

    );
}

export default Admin;