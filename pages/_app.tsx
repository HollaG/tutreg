import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Box, ChakraProvider, Container, extendTheme } from "@chakra-ui/react";
import Nav from "../components/Navbar";
import store from "../store";
import { Provider } from "react-redux";
import { DndContext } from "@dnd-kit/core";
import Footer from "../components/Footer";
import { StepsStyleConfig as Steps } from 'chakra-ui-steps';
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
