import { Box, Container, Flex, SimpleGrid, Text, Button } from '@chakra-ui/react';
import { Input } from "@chakra-ui/react"
import React, { useState } from 'react';
import { loadUnlabelledPostByAccount, loadUnlabelledPost, updateLabel, refillDbWithAccount } from '../utils/db';
import { useAuth } from "../lib/auth";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PostView = (props) => {

    // const formData = JSON.parse(props.formData);
    // console.log(formData)
    toast.configure()
    const { auth, signinWithGoogle } = useAuth();
    const [data, setData] = useState("init data");
    const [label, setLabel] = useState("label")

    const update = (auth, hash, rating) => {
        if (auth != null) {
            updateLabel(auth, hash, rating)
            document.getElementById(hash).style.backgroundColor = "LightYellow";
        }
        else {
            toast.error('Please login to start labelling')
        }
    }

    // @ts-ignore
    const fetchData = async (acc: string) => {
        setData("...loading...")
        let res = null
        // @ts-ignore
        if (acc.length > 0)
            res = await loadUnlabelledPostByAccount(acc)
        else
            res = await loadUnlabelledPost()
        const newData = await generateForm(auth, res)
        // @ts-ignore
        setData(newData)
    }
    // @ts-ignore
    const refillData = async (acc: string) => {
        setData("...preparing db...")
        // try {
        if (acc.length > 0) {
            toast.info('Please wait for DB to be filled up...', { autoClose: 10000 })

            refillDbWithAccount(acc)
            setTimeout(() => { fetchData(acc) }, 10000)


        } else
            toast.error('Please specifiy desired account')
        // } catch (err) {
        //     toast.error('REFILL FAILED: ' + err)
        // }
    }

    const generateForm = (auth, promiseData) => {


        try {
            // console.log(promise)
            // let promisedData = JSON.parse(promise)

            // data = JSON.stringify(loadUnlabelledPostByAccount(getAcc()))
            let result = []
            promiseData.forEach(data => {
                // @ts-ignore
                // @ts-ignore
                result.push(
                    <Box m={3} borderWidth="1px" borderRadius="lg" p={6} boxShadow="xl" id={data.hash}>
                        <Text color="blue.300" mt={2}>
                            <a href={data.orig}>{data.orig}</a>
                        </Text>
                        <Text colorScheme="teal">
                            <b>{data.account}</b> {(new Date(data.postAt['seconds'] * 1000).toString())}
                        </Text>
                        <Text color="teal">
                            {data.hash}
                        </Text>
                        <Text color="gray.500" my={2} fontSize="2xl">
                            {data.text}
                        </Text>

                        <Flex align="center" justify="center" mt={3}>
                            <Button
                                mx={3}
                                colorScheme="red"
                                onClick={() => update(auth, data.hash, -1)}
                            >
                                Negative
                            </Button>
                            <Button
                                mx={3}
                                colorScheme="yellow"
                                onClick={() => update(auth, data.hash, 0)}
                            >
                                Neutral
                            </Button>
                            <Button
                                mx={3}
                                colorScheme="green"
                                onClick={() => update(auth, data.hash, 1)}
                            >
                                Possitive
                            </Button>
                        </Flex>
                    </Box >
                )
            });
            return result;


        } catch (err) {
            console.error('Error occurred: ' + err)
        }
    }

    return (
        <div>
            <Container maxW="6xl">
                 <Flex my={6} mx={20}>
                    <Input focusBorderColor="blue.500" placeholder="Search by Twitter account"
                        id="searchAcc" alignContent='center'
                        defaultValue="SAHealth"
                    />
                     <Button
                    ml={3}
                    colorScheme="blue"
                    onClick={() => fetchData(getAcc())}
                     >
                        Go
                    </Button>
                 </Flex>


                {/* </Flex> */}
            </Container>
            <Container maxW="6xl">
                <SimpleGrid>
                    {/* {generateForm(auth, props)} */}
                    {data}
                </SimpleGrid>
                <SimpleGrid >
                    <Button mt={6} mx={3} colorScheme="blue" onClick={() => fetchData(getAcc())}>Load more</Button>
                    <Button
                        m={3}
                        colorScheme="yellow"
                        onClick={() => refillData(getAcc())}
                    >
                        or REFILL DB with {getAcc()}
                    </Button>
                </SimpleGrid>
            </Container>
        </div >
    );
}

let getAcc = () => {
    let result = 'a'
    try {
        result = (document.getElementById('searchAcc') as HTMLInputElement).value
    } catch (err) {

    }
    return result
}


// export async function getServerSideProps(_context) {

//     console.log('function PostView_getServerSideProps: dont know what it do')

//     // const data = await (await loadUnlabelledComment()).map((formData: any) => {
//     //     return 
//     // })

//     const unlabelledComment = await loadUnlabelledPostByAccount(getAcc());
//     if (unlabelledComment)
//         return { props: { formData: JSON.stringify(unlabelledComment) } };
//     else
//         return { props: { formData: JSON.stringify({ a: 'a', b: 'c' }) } }
// }


export default PostView;