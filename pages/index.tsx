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
import { ResponseData } from "./api/import";

const Home: NextPage = () => {
    const [link, setLink] = useState("");


    const dispatch = useDispatch()
    const router = useRouter()
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const result:ResponseData = await sendPOST('/api/import', {
            url: link,
        })

        const data = result.data
        console.log({data})
        if (!data) return 
        dispatch(classesActions.setState(data))

        router.push("/order")
    };

    const isError = !link.startsWith("https://nusmods.com/timetable/sem") && link !== "";
    return (
        <Stack spacing={5} alignItems="center" h="100%">
            <Heading size="lg" textAlign="center">
                {" "}
                To get started, import your NUSMods Timetable.{" "}
            </Heading>
            <form
                onSubmit={handleSubmit}
                style={{
                    width: "100%",
                }}
            >
                <FormControl isInvalid={isError}>
                    <InputGroup>
                        <Input
                            placeholder="https://nusmods.com/timetable/sem-1/share?..."
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                        />
                        <InputRightAddon p={0}>
                            <Button width="100%" type="submit">
                                {" "}
                                Import{" "}
                            </Button>
                        </InputRightAddon>
                    </InputGroup>
                    {isError && (
                        <FormErrorMessage>Invalid share link!</FormErrorMessage>
                    )}
                </FormControl>
            </form>
            <Box textAlign="center">
                <NextLink href="/order" passHref>
                    <Link>
                        {" "}
                        Alternatively, click here to add classes manually.{" "}
                    </Link>
                </NextLink>
            </Box>
        </Stack>
    );
};

export default Home;
