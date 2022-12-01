import "../styles/globals.css";
import type { AppProps } from "next/app";
import {
    Box,
    ChakraProvider,
    Container,
    extendTheme,
    Flex,
} from "@chakra-ui/react";
import Nav from "../components/Navbar";
import store from "../store";
import { Provider } from "react-redux";
import { DndContext } from "@dnd-kit/core";
import Footer from "../components/Footer";
import { StepsStyleConfig as Steps } from "chakra-ui-steps";
import LogInModal from "../components/Modal/LogInModal";
import path from "path";
const theme = extendTheme({
    components: {
        Steps,
    },
});

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ChakraProvider theme={theme}>
            <DndContext>
                <Provider store={store}>
                    <Flex minHeight="100%" flexDirection="column">
                        <Nav />
                        <Container
                            maxW="container.lg"
                            pt={6}
                            pb="48px"
                            height={"calc(100% - 64px)"}
                            flexGrow={1}
                        >
                            <Component {...pageProps} />
                        </Container>
                        <Box>
                            <Footer />
                        </Box>
                    </Flex>
                    <LogInModal />
                </Provider>
            </DndContext>
        </ChakraProvider>
    );
}

export default MyApp;
