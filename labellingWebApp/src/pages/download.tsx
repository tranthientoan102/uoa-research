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
    Checkbox, Grid
} from '@chakra-ui/react';
import Head from 'next/head';
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from "../lib/auth";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TagsInput2 from "../components/TagsInput2";
import {convertTimeToString, getTagsInput, isAdmin, isMasked} from "../utils/common";
import {downloadData} from "../utils/db";
import CsvDownload from '../components/CsvDownload'
import { CSVLink, CSVDownload } from "react-csv";
import {findAccess} from "../utils/common";

interface Props {
    data: string[]
}

const Download = (props) => {
    const id = 'download'

    // const formData = JSON.parse(props.formData);
    // console.log(formData)

    toast.configure()
    const { auth, signinWithGoogle } = useAuth();
    // const [data, setData] = useState([])
    // const [isWaiting, setWaiting] = useState(false)
    // const router = useRouter();

    // let data =[]
    // let headers = [
    //     { label: "id", key: "id" },
    //     { label: "account", key: "account" },
    //     // { label: "hash", key: "hash" },
    //     { label: "postAt", key: "postAt" },
    //     { label: "insertDbAt", key: "insertDbAt" },
    //     { label: "text", key: "text" },
    //     { label: "event", key: "event" },
    //     { label: "rating", key: "rating" },
    // ];


    // const getData = async () => {
    //
    //     // @ts-ignore
    //     let accs: string[] = getTagsInput(id, true,false)
    //     // await downloadData(auth, accs, null).then((result) => {
    //     //
    //     //     // result.forEach(a => {
    //     //     //     console.log(a)
    //     //     //     data.push(a)
    //     //     // })
    //     //
    //     //     let tmpData = result.map(a => ({...a}))
    //     //     tmpData.forEach(a =>{
    //     //         console.log(`converting ${a.id}`)
    //     //         a.postAt = convertTimeToString(a.postAt)
    //     //         a.insertDbAt = convertTimeToString(a.insertDbAt)
    //     //     })
    //     //     setData(tmpData)
    //     // })
    //     // console.log('done getting data')
    //     let result = await downloadData(auth, accs,null).then((res) => {
    //         res.forEach(a =>{
    //             // console.log(`converting ${a.id}`)
    //             a.postAt = convertTimeToString(a.postAt)
    //             a.insertDbAt = convertTimeToString(a.insertDbAt)
    //         })
    //         return res
    //     })
    //     // setData(result)
    //     console.log(`done download data`)
    //
    //     return result
    // }

    return (
        <div>
            <Head>
                <title>Text Labelling tool</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <Navbar />
                {findAccess(auth,"download")?(
                    <Container maxW="6xl" pt={6}>
                        <Flex>
                            <Container maxW="6xl" pl={0} pr={2}><TagsInput2 id={id} tags={[]} defaultEvents={[]} /></Container>
                            <div id="isMasked">
                            {isAdmin(auth) ?
                                <Checkbox colorScheme='blue' defaultIsChecked>privacy</Checkbox>
                                : <Checkbox colorScheme='blue' defaultIsChecked isDisabled={true}>privacy</Checkbox>
                            }
                            </div>
                        </Flex>
                        <CsvDownload auth={auth} id={id}/>
                    </Container>
                ):(
                    <Container>Please log in for start using tool</Container>
                )}

            </main>
            <footer/>
        </div >
    );
}




export default Download