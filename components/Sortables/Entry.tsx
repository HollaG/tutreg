import { Box, ChakraProps, ChakraStyledOptions, useColorModeValue } from "@chakra-ui/react";
import { useSortable } from "@dnd-kit/sortable";
import {CSS} from '@dnd-kit/utilities';
import React from "react";

interface Props extends ChakraProps {
    children: React.ReactNode|React.ReactNode[];
    
}


const Entry:React.FC<Props> = React.forwardRef((props, ref: any) => {
    const bgColor = useColorModeValue("gray.100", "gray.600")
    return <Box  ref={ref} border={"2px"} borderBlock="solid" backgroundColor={bgColor} borderWidth={2} p={3} borderColor={useColorModeValue("gray.200", "gray.700")} borderRadius={'md'} w="100%" {...props}>
        
        {props.children}


    </Box>
})
Entry.displayName = "Entry"
export default Entry