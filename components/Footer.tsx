import { Box, Container } from "@chakra-ui/react";
import WebsiteCredits from "./Description/WebsiteCredits";

const Footer = () => {
    return (
        <Box bgColor="blue.50" py={5}>
            <Container maxWidth="container.lg">
                <WebsiteCredits />
            </Container>
        </Box>
    );
};

export default Footer;
