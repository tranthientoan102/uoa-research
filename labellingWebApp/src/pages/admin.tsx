import {
    Flex,
    Text,
    Grid, Textarea
} from '@chakra-ui/react';

import Head from 'next/head';
import React, { useState } from 'react';
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
import { decrypting } from "../utils/common";
import ItemCrd from "../components/ItemCrd";
import Pie2 from '../components/Pie2';
import SelectOption, { SelectionMode } from '../components/SelectOption';

const Admin = () => {
    const childWidth = 1/3


    // const formData = JSON.parse(props.formData);
    // console.log(formData)

    toast.configure()
    const { auth } = useAuth();
    const [data, setData] = useState('');
    const [de,setDE] = useState('')
    const [dkws, setDkws] = useState('')


    const [decrypted, setDecrypted] = useState([''])
    const [encrypted, setEncrypted] = useState('')

    const [test, setTest] = useState('')



    // let de = []
    const isAuthoriesed = (auth) =>{
        return (auth != null) && auth.roles.includes('admin')
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

                        {/* <Pie2
                            // data={this.state.piedata}
                            // width={this.state.width}
                            // height={this.state.height}
                            // innerRadius={0}
                            // outerRadius={this.state.height / 2}
                            data={[{ name: 'apple', value: 10 / 130 }
                                , { name: 'banana', value: 20 / 130 }
                                , { name: 'melon', value: 100 / 130 }]}
                            width={700}
                            height={500}
                            innerRadius={0}
                            outerRadius={500 / 2}
                        />
                        <SelectOption data={['like', 'retweet', 'comment', 'combine']}
                            init={['like']}
                            mode={SelectionMode.ONE}
                            colorScheme='twitter'
                            title='sort by' id='11111111'
                            parentCallback={a => setTest(a)}
                        />
                        <SelectOption data={['aaaaa', 'bbbb', 'cccc', 'dddd']}
                            init={['aaaaa', 'cccc', 'dddd']}
                            mode={SelectionMode.MULTI}
                            colorScheme='twitter'
                            title='sort by' id='111222222'
                            parentCallback={a => setTest(a)}
                        />
                        {test} */}

                    </Flex>
                    ):('Authorities required') }
                {/*</Flex>*/}

            </main>

        </div>

    );
}

export default Admin;