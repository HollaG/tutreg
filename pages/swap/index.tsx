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
import { MouseEvent, useEffect, useRef, useState } from "react";
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
    encodeLessonTypeToShorthand,
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
import NextLink from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import SwapCard from "../../components/Swap/SwapCard";
import Loading from "../../components/Indicators/Loading";
import Ended from "../../components/Indicators/Ended";
import SelfSwapCard from "../../components/Swap/SelfSwapCard";
const SWAP_VISIBLE_AMOUNT = 10;
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

    // Control the swap data visible to the user
    const [visibleSwaps, setVisibleSwaps] = useState<ClassSwapRequest[]>();

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

                    setVisibleSwaps(othersSwaps.slice(0, SWAP_VISIBLE_AMOUNT));
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

    const [visibleAmount, setVisibleAmount] = useState(SWAP_VISIBLE_AMOUNT);

    const handleLoadMore = () => {
        const newVisibleAmount = visibleAmount + SWAP_VISIBLE_AMOUNT;
        setVisibleAmount(newVisibleAmount);
        setVisibleSwaps(swapData?.openSwaps.slice(0, newVisibleAmount));
    };

    const infiniteScrollRef = useRef<HTMLDivElement>(null);

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
                ref={infiniteScrollRef}
            >
                <TabList>
                    <Tab>All swaps ({swapData?.openSwaps.length})</Tab>
                    {user && (
                        <Tab>Your swaps ({swapData?.selfSwaps.length})</Tab>
                    )}
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

                        {/* The below section should be visible when the user is NOT filtering anything */}
                        {!selectedModuleCodeLessonType && (
                            <InfiniteScroll
                                dataLength={visibleSwaps?.length || 0}
                                next={handleLoadMore}
                                hasMore={
                                    (swapData?.openSwaps.length || 0) >
                                    visibleAmount
                                }
                                loader={<Loading />}
                                endMessage={
                                    <Ended scrollTo={infiniteScrollRef} />
                                }
                            >
                                <SimpleGrid
                                    columns={{ base: 1, md: 2 }}
                                    spacing={3}
                                >
                                    {/* {swapData?.openSwaps.map((swap, index) => (
                                    <SwapCard
                                        hasRequestedSwap={hasRequestedSwap}
                                        requestSwap={requestSwap}
                                        swap={swap}
                                        swapData={swapData}
                                        user={user}
                                    />
                                ))} */}
                                    {visibleSwaps?.map(
                                        (swap, index) =>
                                            checkIfShouldDisplay(swap) && (
                                                <SwapCard
                                                    key={index}
                                                    hasRequestedSwap={
                                                        hasRequestedSwap
                                                    }
                                                    requestSwap={requestSwap}
                                                    swap={swap}
                                                    swapData={swapData}
                                                    user={user}
                                                />
                                            )
                                    )}
                                </SimpleGrid>
                            </InfiniteScroll>
                        )}

                        {/* The below section should be visible when filtering. We do not infinite-scroll when filtering. */}
                        {selectedModuleCodeLessonType && (
                            <SimpleGrid
                                columns={{ base: 1, md: 2 }}
                                spacing={3}
                            >
                                {swapData?.openSwaps.map(
                                    (swap, index) =>
                                        checkIfShouldDisplay(swap) && (
                                            <SwapCard
                                                key={index}
                                                hasRequestedSwap={
                                                    hasRequestedSwap
                                                }
                                                requestSwap={requestSwap}
                                                swap={swap}
                                                swapData={swapData}
                                                user={user}
                                            />
                                        )
                                )}
                            </SimpleGrid>
                        )}
                    </TabPanel>
                    {user && (
                        <TabPanel>
                            <SimpleGrid
                                columns={{ base: 1, md: 2 }}
                                spacing={3}
                            >
                                {swapData?.selfSwaps.map((swap, index) => (
                                    <SelfSwapCard
                                        key={index}
                                        hasRequestedSwap={hasRequestedSwap}
                                        requestSwap={requestSwap}
                                        swap={swap}
                                        swapData={swapData}
                                        user={user}
                                        promptDelete={promptDelete}
                                    />
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
