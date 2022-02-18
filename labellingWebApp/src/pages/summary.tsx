import { Button, Checkbox, Container, Flex, Input, Text } from "@chakra-ui/react";
import React, { Component, useState } from "react";
import Navbar from "../components/Navbar";

import TagsInputKws from '../components/TagsInputKws'
import TagsInput2 from '../components/TagsInput2'

import { isAdmin, processPredict } from '../utils/common'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Head from 'next/head';
import Pie2 from "../components/Pie2";
import SummaryView from "../components/SummaryView";
import process from "process";


const Summary = () => {
    toast.configure()

    // const [sumView, setSumView] = useState(<Pie2 data={[]} innerRadius={100} outerRadius={0}
    //     width={300} height={300}
    // />)
    const [sumView, setSumView] = useState(<div />)
    const [num, setNum] = useState(parseInt(process.env.NEXT_PUBLIC_NUM_PREDICTIONS))
    const [btnEnable, setBtnEnable] = useState(true)


    return (
        <div>
            <Head>
                <title>Text Labelling tool</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <Navbar />
                <Container position="relative" maxW="8xl">
                    <Flex my={2} align="top" justify="center" >

                        <Container mx={2} p={0}>
                            <Text>Twitter account</Text>
                            <TagsInput2 id="searchAcc" defaultEvents={[]} tags={[]} />
                        </Container>

                        <Container mx={2} p={0}>
                            <Text>Keyword</Text>
                            <TagsInputKws id="searchKeySummary" tags={[]} outsideIsAND={true} />
                        </Container>
                    </Flex>
                    <Flex my={2} align="center" justify="center" >
                        {/* <div id="isMasked">
                            {isAdmin(auth) ?
                                <Checkbox colorScheme='blue' defaultIsChecked>privacy</Checkbox>
                                : <Checkbox colorScheme='blue' defaultIsChecked isDisabled={true}>privacy</Checkbox>
                            }
                        </div> */}
                        # of predctions
                        <Input p={0} pl={1} ml={1} id='numPrediction'
                            maxW={'20'}
                            variant='filled'
                            defaultValue={num}
                            onChange={(event) => {
                                let a = parseInt(event.target.value)
                                if (!isNaN(a)) {
                                    setBtnEnable(true)
                                    setNum(a)
                                } else {
                                    toast.error('Invalid input')
                                    setBtnEnable(false)
                                }
                            }}
                        />
                        <Button
                            m={3}
                            // colorScheme="blue"
                            // background="gray"
                            // color="lightgreen"
                            onClick={() => {
                                setSumView(
                                    <div />
                                )
                                processPredict('searchAcc', 'searchKeySummary', num).then(res => {
                                    console.log(res.length)
                                    setSumView(
                                        <SummaryView tweets={res[0]} pred_sa={res[1]} pred_ed={res[2]} />
                                    )
                                })

                            }}
                            disabled={!btnEnable}
                            colorScheme={'telegram'}
                        >
                            <p>Load & Predict & Summary</p>
                        </Button>

                    </Flex>



                </Container>
                <Container position="relative" maxW="8xl">
                    {sumView}
                </Container>
            </main>
            <footer />
        </div>
    )

}

export default Summary