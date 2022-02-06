import {Button, Center, Container, Heading, Tag, TagLabel, VStack} from "@chakra-ui/react";
// import { useRouter } from "next/dist/client/router";
import { useRouter } from "next/router";
import React from "react";
import { FcGoogle } from 'react-icons/fc';
import Navbar from "../components/Navbar";
import { useAuth } from "../lib/auth";

interface Props {
    data: string[]
}


const Abc = (props) => {
    const { auth, signinWithGoogle } = useAuth();
    const router = useRouter()

    // if (auth) {
    //     router.push((router.query.next as string) || '/')
    // }

    return (
        <>
            <Navbar />
            <Container>
                <Center mt={10}>
                    <VStack spacing="4">
                        <Heading fontSize="3xl" mb={2}>
                            Welcome to <Tag>{process.env.NEXT_PUBLIC_NAME}!!!</Tag> this is a tag</Heading>
                        <Button leftIcon={<FcGoogle />} onClick={() => signinWithGoogle()}>
                            Sign In with Google
                        </Button>
                        <p>Welcome to <Tag m={0} p={0} borderRadius={0} bgColor={"telegram.400"} color={'white'}>{process.env.NEXT_PUBLIC_NAME}!!!  </Tag>      this is a tag </p>
                    </VStack>
                </Center>
            </Container>
        </>

    )


};

export default Abc;