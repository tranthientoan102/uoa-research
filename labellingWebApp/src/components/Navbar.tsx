import React from "react";
import { Box, Divider, Flex, Heading, Link } from "@chakra-ui/layout";
import {Image, Input} from "@chakra-ui/react"
// import { useRouter } from "next/dist/client/router";
import { useRouter } from "next/router";
import { useAuth } from "../lib/auth";


const Navbar: React.FC<{}> = () => {
    const { auth, signOut } = useAuth();
    const router = useRouter();
    console.log(router.asPath)
    return (
        <>
            <Flex justify="space-between" m={1}  align="center" di>
                <Flex>
                    <Heading onClick={() => router.push('/')} as="button" mx={2}>
                        {process.env.NEXT_PUBLIC_NAME}
                    </Heading>
                    <Image src={process.env.NEXT_PUBLIC_LOGO} width="64px" alt={'logo'}/>
                </Flex>
                <Box my={1}>
                    {auth ? (
                        <Box p={2}>
                            <Link
                                p={2}
                                onClick={() => {
                                    console.log('going /')
                                    router.push('/')
                                }}
                                bg={(router.asPath=='/')? 'dodgerblue':'white'}
                                color={(router.asPath=='/')? 'white':'black'}
                            >
                                Annotation
                            </Link>
                            <Link
                                p={2}
                                // href='/review'
                                onClick={() => {
                                    console.log('going /review')
                                    router.push('/review')
                                }}
                                bg={(router.asPath=='/review')? 'dodgerblue':'white'}
                                color={(router.asPath=='/review')? 'white':'black'}
                            >
                                Review
                            </Link>
                            <Link
                                // href='/predict'
                                p={2}
                                onClick={()=> {
                                    console.log('going /predict')
                                    router.push('/predict')
                                }}
                                bg={(router.asPath=='/predict')? 'dodgerblue':'white'}
                                color={(router.asPath=='/predict')? 'white':'black'}

                            >
                                Prediction
                            </Link>
                            <Link
                                p={2}
                                onClick={() => {
                                    console.log('going /download')
                                    router.push('/download')
                                }}
                                bg={(router.asPath=='/download')? 'dodgerblue':'white'}
                                color={(router.asPath=='/download')? 'white':'black'}
                            >
                                Download
                            </Link>
                            <Link
                                // href='/admin'
                                p={2}
                                onClick={()=> {
                                    console.log('going /admin')
                                    router.push('/admin')
                                }}
                                bg={(router.asPath=='/admin')? 'dodgerblue':'white'}
                                color={(router.asPath=='/admin')? 'white':'black'}
                            >
                                Admin
                            </Link>
                            <Link p={2} onClick={() => signOut()} bg={'tomato'} color={'white'}>
                                {auth.email.split('@')[0]} | Logout
                            </Link>
                        </Box>
                    ) : (
                        <Box p={2}>
                            <Link
                                p={2}
                                onClick={() => router.push('/signin')}
                                fontWeight={
                                    router.pathname === '/signin' ? 'extrabold' : 'normal'
                                }
                            >
                                Sign In
                            </Link>
                        </Box>
                    )}
                </Box>
            </Flex>
            <Divider
                css={{
                    boxShadow: '1px 1px #888888',
                }}
            />
        </>
    );
};

export default Navbar;