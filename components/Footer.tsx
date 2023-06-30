import {
    Box,
    Container,
    Flex,
    Kbd,
    Stack,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BrowserView, isMobile } from "react-device-detect";
import WebsiteCredits from "./Description/WebsiteCredits";

const Footer = () => {
    const footerColor = useColorModeValue("gray.50", "blue.900");

    const [showShortcuts, setShowShortcuts] = useState(false);

    useEffect(() => {
        setShowShortcuts(!isMobile);
    }, [isMobile]);
    return (
        <Box bgColor={footerColor} py={5}>
            <Container maxWidth="container.lg">
                <Flex
                    justifyContent={"space-between"}
                    alignItems="center"
                    flexWrap={"wrap"}
                >
                    <WebsiteCredits />

                    {showShortcuts && (
                        <Stack spacing={0} textAlign="right">
                            <Text
                                textAlign={"center"}
                                fontWeight="semibold"
                                textDecor={"underline"}
                                fontSize="sm"
                            >
                                Shortcuts
                            </Text>
                            <Text fontSize="xs">
                                <Kbd>x</Kbd> : Night mode
                            </Text>
                            <Text fontSize="xs">
                                <Kbd>o</Kbd> or <Kbd>r</Kbd> : Order page
                            </Text>
                            <Text fontSize="xs">
                                <Kbd>s</Kbd> : Swap page
                            </Text>
                            <Text fontSize="xs">
                                <Kbd>c</Kbd> : Create swap
                            </Text>
                        </Stack>
                    )}
                </Flex>
            </Container>
        </Box>
    );
};

export default Footer;
