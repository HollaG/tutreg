import {
    Box,
    Button,
    FormControl,
    FormErrorMessage,
    FormHelperText,
    Heading,
    Input,
    InputGroup,
    InputRightAddon,
    Link,
    Stack,
    Text,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { sendPOST } from "../lib/fetcher";
import { classesActions } from "../store/classesReducer";
import { ImportResponseData } from "./api/import";

const Home: NextPage = () => {
    
    const router = useRouter();
    return (
        <Stack spacing={5} alignItems="center" h="100%">
            <Button onClick={() => router.push("/order")} width="100%" height="16rem"> Click here for Tutorial ranking </Button>
        </Stack>
    );
};

export default Home;
