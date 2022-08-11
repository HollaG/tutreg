import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider, Container } from "@chakra-ui/react";
import Nav from "../components/Navbar";
import store from "../store";
import { Provider } from "react-redux";
import { DndContext } from "@dnd-kit/core";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ChakraProvider>
            <DndContext>
                <Provider store={store}>
                    <Nav></Nav>
                    <Container maxW="container.lg" pt={6} height="100vh">
                        <Component {...pageProps} />
                    </Container>
                </Provider>
            </DndContext>
        </ChakraProvider>
    );
}

export default MyApp;
