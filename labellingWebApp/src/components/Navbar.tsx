import React from "react";
import { Box, Divider, Flex, Heading, Link } from "@chakra-ui/layout";
import { Input } from "@chakra-ui/react"
// import { useRouter } from "next/dist/client/router";
import { useRouter } from "next/router";
import { useAuth } from "../lib/auth";


const Navbar: React.FC<{}> = () => {
    const { auth, signOut } = useAuth();
    const router = useRouter();
    return (
        <>
            <Flex justify="space-between" m={4}>
                <Heading onClick={() => router.push('/')} as="button">
                    Text labelling tool
                </Heading>

                <Box>
                    {auth ? (
                        <Box p={2}>
                            <Link
                                p={2}
                                onClick={() => {
                                    console.log('going /')
                                    router.push('/')
                                }}
                            >
                                Main view
                            </Link>
                            <Link
                                // href='/predict'
                                p={2}
                                onClick={()=> {
                                    console.log('going /predict')
                                    router.push('/predict')
                                }}
                            >
                                Predict
                            </Link>
                            <Link
                                p={2}
                                onClick={() => {
                                    console.log('going /download')
                                    router.push('/download')
                                }}
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
                            >
                                Admin
                            </Link>
                            <Link p={2} onClick={() => signOut()}>
                                Logout
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