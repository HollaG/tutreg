import { Box, ChakraProps, ChakraStyledOptions, useColorModeValue } from "@chakra-ui/react";
import { useSortable } from "@dnd-kit/sortable";
import {CSS} from '@dnd-kit/utilities';
import React from "react";

interface Props extends ChakraProps {
    children: React.ReactNode|React.ReactNode[];
    
}


const Entry:React.FC<Props> = React.forwardRef((props, ref: any) => {
    // const {
    //     attributes,
    //     listeners,
    //     setNodeRef,
    //     transform,
    //     transition,
    //   } = useSortable({id});
      
    //   const style = {
    //     transform: CSS.Transform.toString(transform),
    //     transition,
    //   };
    return <Box  ref={ref} border={"2px"} borderBlock="solid" backgroundColor={useColorModeValue("white", "gray.600")} borderWidth={2} p={3} borderColor={useColorModeValue("gray.200", "gray.700")} borderRadius={'md'} w="100%" {...props}>
        
        {props.children}


    </Box>
})

export default Entry