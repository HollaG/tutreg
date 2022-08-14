import { Box, Container, useColorModeValue } from "@chakra-ui/react";
import WebsiteCredits from "./Description/WebsiteCredits";

const Footer = () => {
    const footerColor = useColorModeValue('blue.50', 'blue.900')
    return (
        <Box bgColor={footerColor} py={5}>
            <Container maxWidth="container.lg">
                <WebsiteCredits />
            </Container>
        </Box>
    );
};

export default Footer;
