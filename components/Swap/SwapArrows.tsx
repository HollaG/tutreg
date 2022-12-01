import { ArrowUpIcon, ArrowDownIcon } from "@chakra-ui/icons";
import { Center, Text } from "@chakra-ui/react";

const SwapArrows = () => (
    <Center>
        <ArrowUpIcon mr={1} fontSize="3xl" />
        <Text fontSize={"sm"}>wants to swap the above for</Text>
        <ArrowDownIcon ml={1} fontSize="3xl" />
    </Center>
);

export default SwapArrows;
