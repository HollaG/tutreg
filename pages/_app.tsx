import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Box, ChakraProvider, Container } from "@chakra-ui/react";
import Nav from "../components/Navbar";
import store from "../store";
import { Provider } from "react-redux";
import { DndContext } from "@dnd-kit/core";
import Footer from "../components/Footer";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ChakraProvider>
            <DndContext>
                <Provider store={store}>
                    <Box minHeight="100%">
                        <Nav />
                        <Container
                            maxW="container.lg"
                            pt={6}
                            pb="48px"
                            height={"calc(100% - 64px)"}
                        >
                            <Component {...pageProps} />
                        </Container>
                    </Box>
                    <Footer />
                </Provider>
            </DndContext>
        </ChakraProvider>
    );
}

export default MyApp;
