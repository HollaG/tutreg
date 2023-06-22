import {
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Stack,
    Center,
    Button,
} from "@chakra-ui/react";
import { RefObject } from "react";

const Ended: React.FC<{ scrollTo: RefObject<HTMLDivElement> }> = ({
    scrollTo,
}) => {
    return (
        <Alert
            status="info"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="150px"
        >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
                You&apos;ve reached the end!
            </AlertTitle>
            <AlertDescription maxWidth="sm">
                <Stack>
                    There are no more requests to show.
                    <Center>
                        <Button
                            colorScheme="blue"
                            size="xs"
                            onClick={() =>
                                scrollTo.current?.scrollIntoView({
                                    behavior: "smooth",
                                })
                            }
                        >
                            {" "}
                            Back to top{" "}
                        </Button>
                    </Center>
                </Stack>
            </AlertDescription>
        </Alert>
    );
};

export default Ended;
