import { Button, Center, Container, Heading, VStack } from "@chakra-ui/react";
import { useRouter } from "next/dist/client/router";
import React from "react";
import { FcGoogle } from 'react-icons/fc';
import Navbar from "../components/Navbar";
import { useAuth } from "../lib/auth";

const signin = () => {
    const { auth, signinWithGoogle } = useAuth();
    const router = useRouter()

    if (auth) {
        router.push((router.query.next as string) || '/')
    }

    return (
        <>
            <Navbar />
            <Container>
                <Center mt={10}>
                    <VStack spacing="4">
                        <Heading fontSize="3xl" mb={2}>
                            Good day !!!
                        </Heading>
                        <Button leftIcon={<FcGoogle />} onClick={() => signinWithGoogle()}>
                            Sign In with Google
                        </Button>
                    </VStack>
                </Center>
            </Container>
        </>

    )


};

export default signin;