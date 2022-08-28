import { ArrowDownIcon } from "@chakra-ui/icons";
import {
    Avatar,
    Box,
    Button,
    Center,
    Divider,
    Flex,
    FormControl,
    FormHelperText,
    Heading,
    HStack,
    Link,
    SimpleGrid,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TelegramLoginButton, { TelegramUser } from "telegram-login-button";
import Card from "../../components/Card/Card";
import ModuleSelect from "../../components/Select/ModuleSelect";
import Entry from "../../components/Sortables/Entry";
import LoginButton from "../../components/User/LoginButton";
import { sendPOST } from "../../lib/fetcher";
import { keepAndCapFirstThree } from "../../lib/functions";
import { userActions } from "../../store/user";
import { ClassDB } from "../../types/db";
import { RootState, Option, ClassSwapRequest } from "../../types/types";
import { GetSwapDataResponse, SwapData } from "../api/swap";
import { GetClassesResponse, GroupedByClassNo } from "../api/swap/getClasses";

const Swap: NextPage = () => {
    const dispatch = useDispatch();

    // check if user is logged in
    const state = useSelector((state: RootState) => state);

    // Prevent hydration errors
    const [user, setUser] = useState<TelegramUser>();
    useEffect(() => {
        if (state.user) setUser(state.user);
        else setUser(undefined);
    }, [state.user]);

    // Get current swap requests
    const [swapData, setSwapData] = useState<SwapData>();

    useEffect(() => {
        if (!user) return;
        fetch("/api/swap")
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                if (data.success && data.data) {
                    const selfSwaps = data.data.openSwaps.filter(
                        (swap: any) => swap.from_t_id === user?.id
                    );
                    const othersSwaps = data.data.openSwaps.filter(
                        (swap: any) => swap.from_t_id !== user?.id
                    );
                    setSwapData({
                        classData: data.data.classData,
                        openSwaps: othersSwaps,
                        selfSwaps: selfSwaps,
                        requestedClasses: data.data.requestedClasses,
                    });
                } else {
                    alert(data.error);
                }
            });
    }, [user]);
  
    const deleteHandler = (id: string) => {
        
    }

    const router = useRouter();



    if (!user)
        return (
            <>
                <Heading fontSize="xl" textAlign="center">
                    {" "}
                    You must login to access this page.
                </Heading>
                <Center>
                    <LoginButton />
                </Center>
            </>
        );

    return (
        <Stack spacing={5} h="100%">
            <Center>
                <Button
                    colorScheme="blue"
                    onClick={() => router.push("/swap/create")}
                >
                    Create new swap request
                </Button>
            </Center>

            <Tabs variant="enclosed" colorScheme="blue" isFitted>
                <TabList>
                    <Tab>All swaps</Tab>
                    <Tab>Your swaps</Tab>
                </TabList>

                <TabPanels
                    borderLeft={"1px solid"}
                    borderRight={"1px solid"}
                    borderBottom={"1px solid"}
                    borderColor={useColorModeValue("gray.200", "gray.700")}
                >
                    <TabPanel>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                            {swapData?.openSwaps.map((swap, index) => (
                                <Card key={index}>
                                    <Stack spacing={3}>
                                        <Entry>
                                            <Flex alignItems="center">
                                                <Box flex={1} mx={3}>
                                                    <Text
                                                        fontWeight={"semibold"}
                                                    >
                                                        {swap.moduleCode}{" "}
                                                        {keepAndCapFirstThree(
                                                            swap.lessonType
                                                        )}{" "}
                                                        [{swap.classNo}]
                                                    </Text>
                                                    {(
                                                        swapData.classData.filter(
                                                            (class_) =>
                                                                class_.classNo ===
                                                                    swap.classNo &&
                                                                class_.moduleCode ===
                                                                    swap.moduleCode &&
                                                                class_.lessonType ===
                                                                    swap.lessonType
                                                        ) || []
                                                    ).map((class_, index2) => (
                                                        <Box key={index2}>
                                                            <Text>
                                                                {class_.day}{" "}
                                                                {
                                                                    class_.startTime
                                                                }
                                                                -
                                                                {class_.endTime}{" "}
                                                                {/* {showAdd && `(${classSel.venue})`} */}
                                                            </Text>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Flex>
                                        </Entry>
                                        <Center>
                                            <ArrowDownIcon w={12} h={12} />
                                        </Center>
                                        <SimpleGrid
                                            columns={{ base: 2, sm: 3, lg: 4 }}
                                        >
                                            {swapData.requestedClasses[
                                                swap.swapId
                                            ].map((requestedClass, index3) => (
                                                <Entry key={index3}>
                                                    <Text textAlign="center">
                                                        {keepAndCapFirstThree(
                                                            swap.lessonType
                                                        )}{" "}
                                                        [
                                                        {
                                                            requestedClass.wantedClassNo
                                                        }
                                                        ]{" "}
                                                    </Text>
                                                </Entry>
                                                // <Entry key={index3}>
                                                //     <Flex alignItems="center">
                                                //         <Box flex={1} mx={3}>
                                                //             <Text fontWeight={"semibold"}>
                                                //                 {keepAndCapFirstThree(
                                                //                     swap.lessonType
                                                //                 )}{" "}
                                                //                 [{requestedClass.wantedClassNo}]
                                                //             </Text>
                                                //             {(
                                                //                 swapData.classData.filter(
                                                //                     (class_) =>
                                                //                         class_.classNo ===
                                                //                             requestedClass.wantedClassNo &&
                                                //                         class_.moduleCode ===
                                                //                             swap.moduleCode &&
                                                //                         class_.lessonType ===
                                                //                             swap.lessonType
                                                //                 ) || []
                                                //             ).map((class_, index) => (
                                                //                 <Box key={index}>
                                                //                     <Text>
                                                //                         {class_.day}{" "}
                                                //                         {class_.startTime}-
                                                //                         {class_.endTime}{" "}
                                                //                         {/* {showAdd && `(${classSel.venue})`} */}
                                                //                     </Text>
                                                //                 </Box>
                                                //             ))}
                                                //         </Box>
                                                //     </Flex>
                                                // </Entry>
                                            ))}
                                        </SimpleGrid>
                                        <Divider />
                                        <Flex alignItems="center">
                                            <HStack flex={1}>
                                                <Avatar
                                                    size={"sm"}
                                                    src={
                                                        swap.photo_url
                                                            ? swap.photo_url
                                                            : "/Telegram.svg"
                                                    }
                                                    name={swap.first_name}
                                                />
                                                <Text>
                                                    By {swap.first_name}
                                                </Text>
                                            </HStack>
                                            <Button
                                                size="sm"
                                                colorScheme="blue"
                                                onClick={() =>
                                                    window.open(
                                                        `https://t.me/${swap.username}`
                                                    )
                                                }
                                            >
                                                {" "}
                                                Contact{" "}
                                            </Button>
                                        </Flex>
                                    </Stack>
                                </Card>
                            ))}
                        </SimpleGrid>
                    </TabPanel>
                    <TabPanel>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                            {swapData?.selfSwaps.map((swap, index) => (
                                <Card key={index}>
                                    <Stack spacing={3}>
                                        <Entry>
                                            <Flex alignItems="center">
                                                <Box flex={1} mx={3}>
                                                    <Text
                                                        fontWeight={"semibold"}
                                                    >
                                                        {swap.moduleCode}{" "}
                                                        {keepAndCapFirstThree(
                                                            swap.lessonType
                                                        )}{" "}
                                                        [{swap.classNo}]
                                                    </Text>
                                                    {(
                                                        swapData.classData.filter(
                                                            (class_) =>
                                                                class_.classNo ===
                                                                    swap.classNo &&
                                                                class_.moduleCode ===
                                                                    swap.moduleCode &&
                                                                class_.lessonType ===
                                                                    swap.lessonType
                                                        ) || []
                                                    ).map((class_, index2) => (
                                                        <Box key={index2}>
                                                            <Text>
                                                                {class_.day}{" "}
                                                                {
                                                                    class_.startTime
                                                                }
                                                                -
                                                                {class_.endTime}{" "}
                                                                {/* {showAdd && `(${classSel.venue})`} */}
                                                            </Text>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Flex>
                                        </Entry>
                                        <Center>
                                            <ArrowDownIcon w={12} h={12} />
                                        </Center>
                                        <SimpleGrid
                                            columns={{ base: 1, md: 2 }}
                                        >
                                            {swapData.requestedClasses[
                                                swap.swapId
                                            ].map((requestedClass, index3) => (
                                                <Entry key={index3}>
                                                    <Flex alignItems="center">
                                                        <Box flex={1} mx={3}>
                                                            <Text
                                                                fontWeight={
                                                                    "semibold"
                                                                }
                                                            >
                                                                {keepAndCapFirstThree(
                                                                    swap.lessonType
                                                                )}{" "}
                                                                [
                                                                {
                                                                    requestedClass.wantedClassNo
                                                                }
                                                                ]
                                                            </Text>
                                                            {(
                                                                swapData.classData.filter(
                                                                    (class_) =>
                                                                        class_.classNo ===
                                                                            requestedClass.wantedClassNo &&
                                                                        class_.moduleCode ===
                                                                            swap.moduleCode &&
                                                                        class_.lessonType ===
                                                                            swap.lessonType
                                                                ) || []
                                                            ).map(
                                                                (
                                                                    class_,
                                                                    index
                                                                ) => (
                                                                    <Box
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        <Text>
                                                                            {
                                                                                class_.day
                                                                            }{" "}
                                                                            {
                                                                                class_.startTime
                                                                            }
                                                                            -
                                                                            {
                                                                                class_.endTime
                                                                            }{" "}
                                                                            {/* {showAdd && `(${classSel.venue})`} */}
                                                                        </Text>
                                                                    </Box>
                                                                )
                                                            )}
                                                        </Box>
                                                    </Flex>
                                                </Entry>
                                            ))}
                                        </SimpleGrid>
                                        <Divider />
                                        <Flex alignItems="center">
                                            <HStack flex={1}>
                                                <Avatar
                                                    size={"sm"}
                                                    src={
                                                        swap.photo_url
                                                            ? swap.photo_url
                                                            : "/Telegram.svg"
                                                    }
                                                    name={swap.first_name}
                                                />
                                                <Text>
                                                    By {swap.first_name}
                                                </Text>
                                            </HStack>
                                            <Button
                                                size="sm"
                                                colorScheme="red"
                                                onClick={() => {}}
                                            >
                                                {" "}
                                                Delete{" "}
                                            </Button>
                                        </Flex>
                                    </Stack>
                                </Card>
                            ))}
                        </SimpleGrid>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Stack>
    );
};

export default Swap;
