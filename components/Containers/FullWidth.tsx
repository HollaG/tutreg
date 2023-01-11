import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

const FullWidth: React.FC<{
    children: ReactNode;
}> = ({ children }) => {
    return (
        <Box
            width={"100vw"}
            left="50%"
            right="50%"
            marginLeft={'-50vw'}
            marginRight={'-50vw'}
            position={"relative"}
          
        >
            {children}
        </Box>
    );
};
export default FullWidth;