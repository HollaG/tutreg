import {
    Button,
    Stack,
    Text,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import NextLink from "next/link";



const Home: NextPage = () => {

    return (
        <Stack spacing={5} alignItems="center" h="100%">
            <NextLink href="/order">
                <Button width="100%" height="16rem">
                    Click here for Tutorial ranking
                </Button>
            </NextLink>
            <NextLink href="/swap">
                <Button width="100%" height="16rem">
                    Click here for Tutorial swaps
                </Button>
            </NextLink>
        </Stack>
    );
};

export default Home;
