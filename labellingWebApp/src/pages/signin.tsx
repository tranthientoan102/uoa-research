import { Button, Center, Container, Heading, VStack } from "@chakra-ui/react";
// import { useRouter } from "next/dist/client/router";
import { useRouter } from "next/router";
import React from "react";
import { FcGoogle } from 'react-icons/fc';
import Navbar from "../components/Navbar";
import { useAuth } from "../lib/auth";

interface Props {
    data: string[]
}


const Signin = (props) => {
    const { auth, signinWithGoogle } = useAuth();
    const router = useRouter()

    if (auth) {
        router.push('/summary')
    }

    return (
        <>
            <Navbar />
            <Container>
                <Center mt={10}>
                    <VStack spacing="4">
                        <Heading fontSize="3xl" mb={2}>
                            Welcome to {process.env.NEXT_PUBLIC_NAME}!!!
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

export default Signin;