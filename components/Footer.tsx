import {
    Box,
    Container,
    Flex,
    Kbd,
    Stack,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import WebsiteCredits from "./Description/WebsiteCredits";

const Footer = () => {
    const footerColor = useColorModeValue("gray.50", "blue.900");
    return (
        <Box bgColor={footerColor} py={5}>
            <Container maxWidth="container.lg">
                <Flex
                    justifyContent={"space-between"}
                    alignItems="center"
                    flexWrap={"wrap"}
                >
                    <WebsiteCredits />
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
                    </Stack>
                </Flex>
            </Container>
        </Box>
    );
};

export default Footer;
