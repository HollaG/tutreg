import { ArrowUpIcon, ArrowDownIcon } from "@chakra-ui/icons";
import { Center, Text } from "@chakra-ui/react";
import { TbArrowNarrowDown, TbArrowNarrowUp } from 'react-icons/tb'
const SwapArrows = () => (
    <Center>
        {/* <ArrowUpIcon mr={1} fontSize="3xl" /> */}
        <TbArrowNarrowUp fontSize="2em" />
        <Text fontSize={"sm"} textAlign="center">wants to swap the above for one of</Text>
        {/* <ArrowDownIcon ml={1} fontSize="3xl" /> */}
        <TbArrowNarrowDown fontSize="2em"/>
    </Center>
);

export default SwapArrows;
