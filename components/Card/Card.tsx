import { Box, ChakraProps, useColorModeValue } from "@chakra-ui/react";

interface Props extends ChakraProps {
    children: React.ReactNode|React.ReactNode[];
}

const Card: React.FC<Props> = ({ children, ...props }) => {
    return (
        <Box
            {...props}
            w={"full"}
            bg={useColorModeValue("white", "gray.600")}
            boxShadow={"md"}
            rounded={"md"}
            // overflow={"hidden"}
            p={3}
            height="fit-content"
        >
            {" "}
            {children}{" "}
        </Box>
    );
};
export default Card;
