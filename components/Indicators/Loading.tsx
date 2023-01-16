import { Progress, Spinner, Stack, Text } from "@chakra-ui/react";

const Loading: React.FC = () => {
    return <Stack> 
        {/* <Spinner/> */}
        {/* <Text> Loading... </Text> */}

        <Progress size='xs' isIndeterminate />
        
    </Stack>;
};
export default Loading;
