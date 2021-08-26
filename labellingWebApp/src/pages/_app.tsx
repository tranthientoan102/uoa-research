import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from "next/app";
import { AuthProvider } from "../lib/auth";
import '../css/style.css'

function App({ Component, pageProps }: AppProps) {
    return (
        <ChakraProvider>
            <AuthProvider>
                <Component {...pageProps} />
            </AuthProvider>

        </ChakraProvider>
    );
}

export default App;
