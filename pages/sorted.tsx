import {

    Stack,
    
} from "@chakra-ui/react";
import type { NextPage } from "next";
import ResultContainer from "../components/Sorted/ResultContainer";


const Sorted: NextPage = () => {
    
    return (
        <Stack spacing={5} alignItems="center" h="100%">
            <ResultContainer />
        </Stack>
    );
};

export default Sorted;
