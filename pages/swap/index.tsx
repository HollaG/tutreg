import {
    ArrowDownIcon,
    ArrowUpDownIcon,
    ArrowUpIcon,
    TimeIcon,
} from "@chakra-ui/icons";
import {
    Avatar,
    Badge,
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
    Tag,
    Text,
    useColorModeValue,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { title } from "process";
import { MouseEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TelegramLoginButton, { TelegramUser } from "telegram-login-button";
import Card from "../../components/Card/Card";
import ConfirmDelete from "../../components/Dialogs/ConfirmDelete";
import ModuleSelect from "../../components/Select/ModuleSelect";
import Entry from "../../components/Sortables/Entry";
import SwapArrows from "../../components/Swap/SwapArrows";
import SwapEntry from "../../components/Swap/SwapEntry";
import LoginButton from "../../components/User/LoginButton";
import UserDisplay from "../../components/User/UserDisplay";
import { sendDELETE, sendPOST } from "../../lib/fetcher";
import {
    cleanArrayString,
    formatTimeElapsed,
    keepAndCapFirstThree,
} from "../../lib/functions";
import { requestSwapHelper } from "../../lib/helpers";
import { requestComm } from "../../lib/requestor";
import { miscActions } from "../../store/misc";
import { userActions } from "../../store/user";
import { ClassDB } from "../../types/db";
import { RootState, Option, ClassSwapRequest } from "../../types/types";
import { GetSwapDataResponse, SwapData } from "../api/swap";
import { GetClassesResponse, GroupedByClassNo } from "../api/swap/getClasses";
import { RequestSwapResponseData } from "../api/swap/request";

const CustomCardProps = {
    _hover: {
        boxShadow: "lg",
    },
    cursor: "pointer",
};

const Swap: NextPage = () => {
    const dispatch = useDispatch();

    // check if user is logged in
    const state = useSelector((state: RootState) => state);

    // Prevent hydration errors
    const [user, setUser] = useState<TelegramUser | null>();
    const [userChecked, setUserChecked] = useState(false);
    useEffect(() => {
        if (state.user) {
            setUser(state.user);
        } else setUser(undefined);
    }, [state.user]);

    // Get current swap requests
    const [swapData, setSwapData] = useState<SwapData>();

    const [counter, setCounter] = useState(0);
    useEffect(() => {
        fetch("/api/swap")
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.data) {
                    const selfSwaps = data.data.openSwaps.filter(
                        (swap: any) => swap.from_t_id === user?.id
                    );
                    const othersSwaps = data.data.openSwaps.filter(
                        (swap: any) =>
                            swap.from_t_id !== user?.id &&
                            swap.status !== "Completed" // only show pending swaps
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
    }, [user, counter]);

    const router = useRouter();

    const borderColor = useColorModeValue("gray.200", "gray.700");

    const [hasRequestedSwap, setHasRequestedSwap] = useState("");

    const requestSwap =
        (
            swapId: number,
            user: TelegramUser | null,
            type: "request" | "remove"
        ) =>
        async (e: MouseEvent<HTMLButtonElement>) => {
            try {
                e.stopPropagation();

                const response = await requestSwapHelper(
                    dispatch,
                    swapId,
                    user,
                    type
                );
                if (!response) return;
                if (response.error || !response.success) {
                    toast({
                        title: "Error",
                        description: response?.error,
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                } else {
                    // update swap data: response.data contains the new requestors
                    // prevent user from selecting the button again
                    setHasRequestedSwap(
                        type === "remove" ? "Unrequested!" : "Requested!"
                    );

                    toast({
                        title: "Success",
                        description:
                            type === "remove"
                                ? "Removed your request!"
                                : "Requested! They will contact you shortly.",
                        status: "success",
                        duration: 3000,
                    });

                    // setSwapData((prevState) => {
                    //     if (!prevState) return undefined;
                    //     const prevOpenSwaps = [...prevState.openSwaps];
                    //     const updatedOpenSwaps = prevOpenSwaps.map((swap) => {
                    //         if (swap.swapId === swapId) {
                    //             return {
                    //                 ...swap,
                    //                 requestors: response.data,
                    //             };
                    //         } else return swap;
                    //     });

                    //     return {
                    //         ...prevState,
                    //         openSwaps: updatedOpenSwaps,
                    //     };
                    // });
                }
            } catch (e) {}
        };

    const toast = useToast();
    const disclosure = useDisclosure();
    const [deletingSwapId, setDeletingSwapId] = useState(0);
    const promptDelete =
        (swapId: number) => (e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            disclosure.onOpen();
            setDeletingSwapId(swapId);
        };
    const handleDelete = async () => {
        const response = await sendDELETE(`/api/swap/${deletingSwapId}`, user);
        if (response.success) {
            toast({
                title: "Swap deleted!",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            setCounter((prev) => prev + 1);
        } else {
            toast({
                title: "Error deleting swap",
                description: response.error,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // color for highlighted tut class
    const highlightedColor = useColorModeValue("green.200", "green.700");
    const [selectedModuleCodeLessonType, setSelectedModuleCodeLessonType] =
        useState<Option | null>(null);
    const [availableClassNos, setAvailableClassNos] = useState<string[]>([]);
    const [selectedClassNo, setSelectedClassNo] = useState<Option | null>(null);
    const selectModuleCodeLessonTypeHandler = (opt: Option) => {
        dispatch(miscActions.setHighlightedClassNos([]));
        setSelectedModuleCodeLessonType(opt);
        setAvailableClassNos([]);
        setSelectedClassNo(null);
        if (!opt) return;
        const moduleCode = opt.value.split(": ")[0];
        const lessonType = opt.value.split(": ")[1];
        const swapsMatching = swapData?.openSwaps.filter(
            (swap) =>
                swap.moduleCode === moduleCode && swap.lessonType === lessonType
        );

        const availableClassNos: string[] = [];
        swapsMatching?.forEach((swap) => {
            if (swapData?.requestedClasses[swap.swapId]) {
                const requestedClasses =
                    swapData?.requestedClasses[swap.swapId];
                const classNos = requestedClasses.map(
                    (key) => key.wantedClassNo
                );
                availableClassNos.push(...classNos);
                availableClassNos.push(swap.classNo);
            }
        });
        // remvoe duplicates from availableClassNos
        const uniqueAvailableClassNos = [...new Set(availableClassNos.flat())];
        setAvailableClassNos(uniqueAvailableClassNos);
    };
    const selectClassNoHandler = (opt: Option) => {
        setSelectedClassNo(opt);
        if (!opt) dispatch(miscActions.setHighlightedClassNos([]));
        else dispatch(miscActions.setHighlightedClassNos([opt.value]));
    };

    const checkIfShouldDisplay = (swap: ClassSwapRequest) => {
        if (!selectedModuleCodeLessonType && !selectedClassNo) return true;

        if (selectedModuleCodeLessonType) {
            const moduleCode =
                selectedModuleCodeLessonType.value.split(": ")[0];
            const lessonType =
                selectedModuleCodeLessonType.value.split(": ")[1];
            if (!selectedClassNo)
                return (
                    swap.moduleCode === moduleCode &&
                    swap.lessonType === lessonType
                );
            else {
                // find requested class numbers for this swap
                const requestedClasses = swapData?.requestedClasses[
                    swap.swapId
                ].map((class_) => class_.wantedClassNo);
                return (
                    swap.moduleCode === moduleCode &&
                    swap.lessonType === lessonType &&
                    (swap.classNo === selectedClassNo.value ||
                        requestedClasses?.includes(selectedClassNo.value))
                );
            }
        }
    };

    const [tabIndex, setTabIndex] = useState(0);
    const handleTabsChange = (index: number) => {
        setTabIndex(index);
    };

    useEffect(() => {
        if (!user) {
            setTabIndex(0);
        }
        dispatch(miscActions.setHighlightedClassNos([]));
    }, [user, dispatch]);

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

            <Tabs
                variant="enclosed"
                colorScheme="blue"
                isFitted
                index={tabIndex}
                onChange={handleTabsChange}
            >
                <TabList>
                    <Tab>All swaps</Tab>
                    {user && <Tab>Your swaps</Tab>}
                </TabList>

                <TabPanels
                    borderLeft={"1px solid"}
                    borderRight={"1px solid"}
                    borderBottom={"1px solid"}
                    borderColor={borderColor}
                >
                    <TabPanel>
                        <SimpleGrid
                            columns={{ base: 1, md: 2 }}
                            mb={3}
                            spacing={3}
                        >
                            <Select
                                // first filter the array, making a string[] so we cna remove duplicates with set, then map it back into Option
                                options={[
                                    ...new Set(
                                        swapData?.openSwaps.map(
                                            (swap) =>
                                                `${swap.moduleCode}: ${swap.lessonType}`
                                        )
                                    ),
                                ]
                                    .map((moduleCodeLessonType) => ({
                                        value: moduleCodeLessonType,
                                        label: moduleCodeLessonType,
                                    }))
                                    .sort((a, b) =>
                                        a.label.localeCompare(b.label)
                                    )}
                                placeholder="Filter by module and lesson type (tut/sec etc...)"
                                value={selectedModuleCodeLessonType}
                                isClearable
                                onChange={(opt: any) =>
                                    selectModuleCodeLessonTypeHandler(opt)
                                }
                            />
                            <Select
                                placeholder="Filter by class number..."
                                options={availableClassNos
                                    .map((class_) => ({
                                        label: class_,
                                        value: class_,
                                    }))
                                    .sort((a, b) =>
                                        a.label.localeCompare(b.label)
                                    )}
                                onChange={(opt: any) =>
                                    selectClassNoHandler(opt)
                                }
                                value={selectedClassNo}
                                isClearable
                            />
                        </SimpleGrid>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                            {swapData?.openSwaps.map(
                                (swap, index) =>
                                    checkIfShouldDisplay(swap) && (
                                        <Card
                                            key={index}
                                            {...CustomCardProps}
                                            onClick={() =>
                                                router.push(
                                                    `/swap/${swap.swapId}`
                                                )
                                            }
                                        >
                                            <Stack spacing={3}>
                                                <Flex
                                                    alignItems="center"
                                                    justifyContent="space-between"
                                                >
                                                    <HStack>
                                                        <HStack flex={1}>
                                                            <UserDisplay
                                                                user={swap}
                                                            />
                                                        </HStack>
                                                    </HStack>

                                                    {cleanArrayString(
                                                        swap.requestors
                                                    ).includes(
                                                        user?.id.toString() ||
                                                            ""
                                                    ) ? (
                                                        <Button
                                                            size="sm"
                                                            colorScheme="blue"
                                                            onClick={requestSwap(
                                                                swap.swapId,
                                                                user || null,
                                                                "remove"
                                                            )}
                                                            disabled={
                                                                hasRequestedSwap ===
                                                                "Unrequested!"
                                                            }
                                                        >
                                                            {hasRequestedSwap ||
                                                                "Unrequest"}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            colorScheme="blue"
                                                            onClick={requestSwap(
                                                                swap.swapId,
                                                                user || null,
                                                                "request"
                                                            )}
                                                            disabled={
                                                                hasRequestedSwap ===
                                                                "Requested!"
                                                            }
                                                        >
                                                            {hasRequestedSwap ||
                                                                "Request"}
                                                        </Button>
                                                    )}
                                                </Flex>
                                                <Center>
                                                    {cleanArrayString(
                                                        swap.requestors
                                                    ).includes(
                                                        user?.id.toString() ||
                                                            ""
                                                    ) && (
                                                        <Tag
                                                            colorScheme="green"
                                                            variant="solid"
                                                        >
                                                            {" "}
                                                            Requested{" "}
                                                        </Tag>
                                                    )}
                                                </Center>
                                                <Divider />
                                                <SwapEntry
                                                    // badge="PS1101E"
                                                    bgColor={
                                                        state.misc.highlightedClassNos.includes(
                                                            swap.classNo
                                                        )
                                                            ? highlightedColor
                                                            : undefined
                                                    }
                                                    title={`${swap.moduleCode}
                                            ${keepAndCapFirstThree(
                                                swap.lessonType
                                            )}
                                            [${swap.classNo}]`}
                                                    classNo={swap.classNo}
                                                    classes={
                                                        swapData.classData.filter(
                                                            (class_) =>
                                                                class_.classNo ===
                                                                    swap.classNo &&
                                                                class_.moduleCode ===
                                                                    swap.moduleCode &&
                                                                class_.lessonType ===
                                                                    swap.lessonType
                                                        ) || []
                                                    }
                                                />
                                                <SwapArrows />
                                                <SimpleGrid
                                                    columns={{
                                                        base: 2,
                                                        // sm: 3,
                                                        // lg: 4,
                                                    }}
                                                >
                                                    {swapData.requestedClasses[
                                                        swap.swapId
                                                    ].map(
                                                        (
                                                            requestedClass,
                                                            index3
                                                        ) => (
                                                            <SwapEntry
                                                                bgColor={
                                                                    state.misc.highlightedClassNos.includes(
                                                                        requestedClass.wantedClassNo
                                                                    )
                                                                        ? highlightedColor
                                                                        : undefined
                                                                }
                                                                key={index3}
                                                                classNo={
                                                                    requestedClass.wantedClassNo
                                                                }
                                                                classes={
                                                                    swapData.classData.filter(
                                                                        (
                                                                            class_
                                                                        ) =>
                                                                            class_.classNo ===
                                                                                requestedClass.wantedClassNo &&
                                                                            class_.moduleCode ===
                                                                                swap.moduleCode &&
                                                                            class_.lessonType ===
                                                                                swap.lessonType
                                                                    ) || []
                                                                }
                                                                title={`${keepAndCapFirstThree(
                                                                    swap.lessonType
                                                                )}
                                                        [${
                                                            requestedClass.wantedClassNo
                                                        }]`}
                                                            />
                                                        )
                                                    )}
                                                </SimpleGrid>
                                                <Divider />
                                                <Flex justifyContent="space-between">
                                                    <HStack
                                                        alignItems="center"
                                                        // justifyContent="center"
                                                    >
                                                        <TimeIcon />
                                                        <Text>
                                                            Created{" "}
                                                            {formatTimeElapsed(
                                                                swap.createdAt.toString()
                                                            )}
                                                        </Text>
                                                    </HStack>{" "}
                                                    <Badge
                                                        colorScheme="purple"
                                                        fontSize="1em"
                                                    >
                                                        {swap.moduleCode}
                                                    </Badge>
                                                </Flex>
                                            </Stack>
                                        </Card>
                                    )
                            )}
                        </SimpleGrid>
                    </TabPanel>
                    {user && (
                        <TabPanel>
                            <SimpleGrid
                                columns={{ base: 1, md: 2 }}
                                spacing={3}
                            >
                                {swapData?.selfSwaps.map((swap, index) => (
                                    <Card
                                        key={index}
                                        {...CustomCardProps}
                                        onClick={() =>
                                            router.push(`/swap/${swap.swapId}`)
                                        }
                                    >
                                        <Stack spacing={3}>
                                            <Flex alignItems="center">
                                                <HStack flex={1}>
                                                    <UserDisplay user={swap} />
                                                </HStack>
                                                <Button
                                                    size="sm"
                                                    colorScheme="red"
                                                    onClick={promptDelete(
                                                        swap.swapId
                                                    )}
                                                >
                                                    {" "}
                                                    Delete{" "}
                                                </Button>
                                            </Flex>
                                            <Center>
                                                {swap.status === "Completed" ? (
                                                    <Tag
                                                        colorScheme="green"
                                                        variant="solid"
                                                    >
                                                        {" "}
                                                        Completed{" "}
                                                    </Tag>
                                                ) : (
                                                    <Tag
                                                        colorScheme="blue"
                                                        variant="solid"
                                                    >
                                                        Pending
                                                    </Tag>
                                                )}
                                            </Center>
                                            <Divider />
                                            <SwapEntry
                                                title={`${swap.moduleCode}
                                                ${keepAndCapFirstThree(
                                                    swap.lessonType
                                                )}
                                                [${swap.classNo}]`}
                                                classNo={swap.classNo}
                                                classes={
                                                    swapData.classData.filter(
                                                        (class_) =>
                                                            class_.classNo ===
                                                                swap.classNo &&
                                                            class_.moduleCode ===
                                                                swap.moduleCode &&
                                                            class_.lessonType ===
                                                                swap.lessonType
                                                    ) || []
                                                }
                                            />

                                            <SwapArrows />
                                            <SimpleGrid
                                                columns={{ base: 1, md: 2 }}
                                            >
                                                {swapData.requestedClasses[
                                                    swap.swapId
                                                ].map(
                                                    (
                                                        requestedClass,
                                                        index3
                                                    ) => (
                                                        <SwapEntry
                                                            key={index3}
                                                            classNo={
                                                                requestedClass.wantedClassNo
                                                            }
                                                            classes={
                                                                swapData.classData.filter(
                                                                    (class_) =>
                                                                        class_.classNo ===
                                                                            requestedClass.wantedClassNo &&
                                                                        class_.moduleCode ===
                                                                            swap.moduleCode &&
                                                                        class_.lessonType ===
                                                                            swap.lessonType
                                                                ) || []
                                                            }
                                                            title={`${keepAndCapFirstThree(
                                                                swap.lessonType
                                                            )}
                                                        [${
                                                            requestedClass.wantedClassNo
                                                        }]`}
                                                        />
                                                    )
                                                )}
                                            </SimpleGrid>
                                            <Divider />
                                            <Flex justifyContent="space-between">
                                                <HStack alignItems="center">
                                                    <TimeIcon />
                                                    <Text>
                                                        Created{" "}
                                                        {formatTimeElapsed(
                                                            swap.createdAt.toString()
                                                        )}
                                                    </Text>
                                                </HStack>
                                                <Badge
                                                    colorScheme="purple"
                                                    fontSize="1em"
                                                >
                                                    {swap.moduleCode}
                                                </Badge>
                                            </Flex>
                                        </Stack>
                                    </Card>
                                ))}
                            </SimpleGrid>
                        </TabPanel>
                    )}
                </TabPanels>
            </Tabs>
            <ConfirmDelete {...disclosure} cb={handleDelete} />
        </Stack>
    );
};

export default Swap;
