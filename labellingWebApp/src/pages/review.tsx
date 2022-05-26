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
    Input, Grid, Textarea, IconButton, Checkbox, Tag
} from '@chakra-ui/react';
import { DeleteIcon, SearchIcon } from '@chakra-ui/icons';

import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from "../lib/auth";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createDefaultEvent, deleteDefaultEvent, getAllLabeller, getDefaultEventList } from "../utils/db";
import {getCheckedItemFromGrid, getTagsInput, isAdmin} from "../utils/common";
import PostReview from "../components/PostReview";
import {findAccess} from "../utils/common";

interface Props {
    data: string[]
}
// class Review extends React.Component<Props> {
const Review = (props) => {

    const id = 'review'

    // const formData = JSON.parse(props.formData);
    // console.log(formData)

    toast.configure()
    const { auth, signinWithGoogle } = useAuth();
    const [data, setData] = useState('');

    const [labelledBy, setLabelledBy] = useState([]);
    const [update, setUpdate] = useState(false)

    useEffect(() => {
        if (isAuthoriesed(auth)) {
            generateListLabeller();
        }
        else {
            toast.error(auth)
        }
        // generateDE();
    }, [])

    // let de = []
    const isAuthoriesed = (auth) => {
        return (auth != null) && auth.roles.includes('reviewer')
    }

    const getCheckedEmails = () => {
        return getCheckedItemFromGrid('allLabellers', false, false, false)
    }
    const generateListLabeller = async () => {

        let result = []
        let tmp = []


        // @ts-ignore
        setData(<Spinner size="xl" m={5} thickness="6px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500" />)

        await getAllLabeller(auth).then(res => {
            for (const i of res) {
                tmp.push(<Checkbox id={i}>{i}</Checkbox>)
            }
        }).finally(() => {
            // result.push(<Box>{tmp}</Box>)
            // result.push(<TagsInput2 id='newDE' tags={[]} defaultEvents={[]}/>)
            // setData(result)
        })
        // tmp.push(<TagsInput2 id='newDE' tags={[]} defaultEvents={[]}/>);
        // tmp.push(
        //             <Button my={2} colorScheme='telegram' onClick={()=> {
        //                         createDefaultEvent(getTagsInput('newDE'), auth);
        //                         generateDE();
        //             }} >
        //                 Add new Default Event
        //             </Button>
        // )
        result.push(<Grid templateColumns='repeat(4, 1fr)' gap={2}>{tmp}</Grid>);

        // @ts-ignore
        setData(result);


    }

    const startReviewing = () => {
        setLabelledBy(getCheckedEmails())
        setUpdate(true)

    }

    return (
        <div>
            <Head>
                <title>Text Labelling tool</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <Navbar />
                <div>

                    {findAccess(auth,"review")? (
                        <Container position="relative" maxW="8xl">
                            <Flex bg={'gray.50'} m={2} p={2}>

                                <IconButton aria-label='Search labellers'
                                    icon={<SearchIcon />}
                                    onClick={() => generateListLabeller()}
                                    mr={2}

                                />

                                <Grid align="center" justify="center">
                                    {/*<Button onClick={()=> generateListLabeller()}>*/}
                                    {/*    Load labellers*/}
                                    {/*</Button>*/}


                                    <div id='allLabellers'>{data}</div>

                                </Grid>



                            </Flex>
                            <SimpleGrid position="relative" maxW="8xl">
                                <Flex align="center" justify="center" >
                                    <div id="isMasked">
                                        {isAdmin(auth) ?
                                            <Checkbox colorScheme='blue' defaultIsChecked>privacy</Checkbox>
                                            : <Checkbox colorScheme='blue' defaultIsChecked isDisabled={true}>privacy</Checkbox>
                                        }
                                    </div>

                                    <Button onClick={() => {
                                        setUpdate(false)

                                    }} m={2}>Clean view</Button>
                                    <Button onClick={() => {
                                        startReviewing()
                                    }}
                                        m={2}
                                        colorScheme={"twitter"}> Start reviewing
                                    </Button>
                                </Flex>
                                {/*{r}*/}
                                {update ? <PostReview auth={auth} labelledBy={labelledBy} /> : ''}
                                {/*{review}*/}
                            </SimpleGrid>
                        </Container>







                    ) : (
                        <Container position="relative" maxW="8xl" align="center" justify="center">
                            <Text fontWeight={600} fontSize='4xl'>Authorities required</Text>
                            Contact your Admin for more details
                        </Container>
                    )}

                </div>
            </main>

        </div>

    );
}

export default Review;