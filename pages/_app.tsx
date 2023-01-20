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
import { Provider, useDispatch } from "react-redux";
import { DndContext } from "@dnd-kit/core";
import Footer from "../components/Footer";
import { StepsStyleConfig as Steps } from "chakra-ui-steps";
import LogInModal from "../components/Modal/LogInModal";
import path from "path";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { classesActions } from "../store/classesReducer";
import Helper from "../components/Helper";
const theme = extendTheme({
    components: {
        Steps,
    },
});

function MyApp({ Component, pageProps }: AppProps) {

   

    return (
        <ChakraProvider theme={theme}>
            <Head>
                <title> tutreg.com | Tutorial Registration Helper </title>
                <link rel="apple-touch-icon" href="icons/apple-icon-180.png" />
                <link rel="manifest" href="/manifest.json"/>
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32x32.png"/>
                <link rel="icon" type="image/png" sizes="16x16" href="icons/favicon-16x16.png"/>
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-2048-2732.jpg"
                    media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-2732-2048.jpg"
                    media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-1668-2388.jpg"
                    media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-2388-1668.jpg"
                    media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-1536-2048.jpg"
                    media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-2048-1536.jpg"
                    media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-1668-2224.jpg"
                    media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-2224-1668.jpg"
                    media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-1620-2160.jpg"
                    media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-2160-1620.jpg"
                    media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-1290-2796.jpg"
                    media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-2796-1290.jpg"
                    media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-1179-2556.jpg"
                    media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-2556-1179.jpg"
                    media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-1284-2778.jpg"
                    media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-2778-1284.jpg"
                    media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-1170-2532.jpg"
                    media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-2532-1170.jpg"
                    media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-1125-2436.jpg"
                    media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-2436-1125.jpg"
                    media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-1242-2688.jpg"
                    media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-atio: 2) and (orientation: landscape)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-640-1136.jpg"
                    media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="icons/apple-splash-1136-640.jpg"
                    media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                />
            </Head>
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
                        <Helper />
                    </Flex>
                    <LogInModal />
                </Provider>
            </DndContext>
        </ChakraProvider>
    );
}

export default MyApp;
