import {
    AddIcon,
    ArrowDownIcon,
    ArrowUpDownIcon,
    ArrowUpIcon,
    ChevronDownIcon,
    TimeIcon,
} from "@chakra-ui/icons";
import {
    Avatar,
    Badge,
    Box,
    Button,
    ButtonGroup,
    Center,
    Divider,
    Flex,
    FormControl,
    FormHelperText,
    Heading,
    HStack,
    Image,
    Input,
    InputGroup,
    InputRightElement,
    Link,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuItemOption,
    MenuList,
    MenuOptionGroup,
    SimpleGrid,
    Spinner,
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
import type {
    GetServerSideProps,
    InferGetServerSidePropsType,
    NextPage,
} from "next";
import { useRouter } from "next/router";
import { title } from "process";
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TelegramLoginButton, { TelegramUser } from "telegram-login-button";
import Card from "../../components/Card/Card";
import ConfirmDelete from "../../components/Dialogs/ConfirmDelete";
import ModuleSelect from "../../components/Select/ModuleSelect";
import Entry from "../../components/Sortables/Entry";
import SwapArrows from "../../components/Swap/SwapArrows";

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

import { GetSwapClassesData } from "../api/swap/[swapId]";
import { TbCheck, TbChevronDown, TbNewSection, TbPlus } from "react-icons/tb";
import { LessonType } from "../../types/modules";
import CTA_GENERAL from "../../components/CTA_general";

import SwapImage from "../../public/assets/swap_illustration.svg";

const SWAP_VISIBLE_AMOUNT = 20;
const CustomCardProps = {
    _hover: {
        boxShadow: "lg",
    },
    cursor: "pointer",
};

const ROOT_URL = process.env.NEXT_PUBLIC_ROOT_URL;

export const getServerSideProps: GetServerSideProps<{
    openSwaps: GetSwapClassesData[];
}> = async (ctx) => {
    // get the data about this swap
    const { swapId } = ctx.query;
    const res = await fetch(`${ROOT_URL}api/swap`);
    const data: { openSwaps: GetSwapClassesData[] } = (await res.json()).data;

    // const userData = await sendPOST(`${ROOT_URL}api/swap/${swapId}`, {});
    // const safeUsers = userData.data;
    // console.log(data.openSwaps);
    return {
        props: {
            openSwaps: data.openSwaps,
            // users: safeUsers,
        },
    };
};

const Swap = (
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
    const dispatch = useDispatch();

    // check if user is logged in
    const state = useSelector((state: RootState) => state);

    // Prevent hydration errors
    const [user, setUser] = useState<TelegramUser | null>();
    const [userChecked, setUserChecked] = useState(false);
    useEffect(() => {
        if (state.user) {
            setUser(state.user);
            // populate the user swaps
            const self = props.openSwaps.filter(
                (swapData) => swapData.swap.from_t_id === state.user?.id
            );

            // remove the user swaps from the open swaps
            const open = props.openSwaps.filter(
                (swapData) => swapData.swap.from_t_id !== state.user?.id
            );
            setAllSwapData({
                openSwaps: open,
                selfSwaps: self,
            });

            setVisibleSwaps(open.slice(0, SWAP_VISIBLE_AMOUNT));
        } else {
            setUser(undefined);
            setRequestState({});
        }
    }, [state.user, props.openSwaps]);

    // Get current swap requests
    const [allSwapsData, setAllSwapData] = useState<{
        openSwaps: GetSwapClassesData[];
        selfSwaps: GetSwapClassesData[];
    }>({
        openSwaps: props.openSwaps,
        selfSwaps: [],
    });

    // Control the swap data visible to the user
    const [_visibleSwaps, setVisibleSwaps] = useState<GetSwapClassesData[]>(
        props.openSwaps.slice(0, SWAP_VISIBLE_AMOUNT)
    );

    // allow for filtering
    // let visibleSwaps = _visibleSwaps;

    const [counter, setCounter] = useState(0);

    const router = useRouter();

    const borderColor = useColorModeValue("gray.200", "gray.700");

    const [requestState, setRequestState] = useState<{
        [swapId: number]: string;
    }>({});

    const requestSwap = async (
        swapId: number,
        user: TelegramUser | null,
        type: "request" | "remove"
    ) => {
        try {
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

                setRequestState((prev) => ({
                    ...prev,
                    [swapId]:
                        type === "remove" ? "Request removed!" : "Requested!",
                }));
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
    const promptDelete = (swapId: number) => {
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
            // remove the swap from the list
            setAllSwapData((prev) => ({
                ...prev,

                selfSwaps: prev.selfSwaps.filter(
                    (swapData) => swapData.swap.swapId !== deletingSwapId
                ),
            }));
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

    // ------------------ FILTERING ------------------
    // Set up the type button
    // get a list of all the different lessonTypes
    const lessonTypes: LessonType[] = [
        ...new Set(
            allSwapsData.openSwaps.flatMap((swapData) =>
                swapData.drawnClasses.map((class_) => class_.lessonType)
            )
        ),
    ];

    const [selectedLessonTypes, setSelectedLessonTypes] = useState<
        LessonType[]
    >([]);
    const menuItemClicked = (lessonType: LessonType) => {
        if (selectedLessonTypes.includes(lessonType)) {
            setSelectedLessonTypes(
                selectedLessonTypes.filter((type) => type !== lessonType)
            );
        } else {
            setSelectedLessonTypes([...selectedLessonTypes, lessonType]);
        }
    };

    const [searchText, setSearchText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    // debounce so we don't get massive lag spikes
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearchQuery(searchText);
        }, 750);

        return () => clearTimeout(delayDebounceFn);
    }, [searchText]);

    let visibleSwaps = useMemo(() => {
        let t = _visibleSwaps;
        if (searchQuery.length) {
            const terms = searchQuery.trim().split(" ");
            t = t.filter((swapData) => {
                // return true if search term found in:
                // 1) moduleCode
                // 2) lessonType
                // 3) classNo
                // --> in both desired and current (just look in drawnClasses)

                return terms.every((term) => {
                    return swapData.drawnClasses.some((class_) => {
                        return (
                            class_.moduleCode
                                .toLowerCase()
                                .includes(term.toLowerCase()) ||
                            class_.lessonType
                                .toLowerCase()
                                .includes(term.toLowerCase()) ||
                            class_.classNo
                                .toLowerCase()
                                .includes(term.toLowerCase())
                        );
                    });
                });

                // if (
                //     swapData.drawnClasses.find((class_) => {
                //         // true if at least one term is found
                //         return (
                //             // class_.moduleCode
                //             //     .toLowerCase()
                //             //     .includes(searchQuery.toLowerCase()) ||
                //             // class_.lessonType
                //             //     .toLowerCase()
                //             //     .includes(searchQuery.toLowerCase()) ||
                //             // class_.classNo
                //             //     .toLowerCase()
                //             //     .includes(searchQuery.toLowerCase())
                //             terms.every((term) =>
                //                 class_.moduleCode
                //                     .toLowerCase()
                //                     .includes(term.toLowerCase())
                //             ) ||
                //             terms.every((term) =>
                //                 class_.lessonType
                //                     .toLowerCase()
                //                     .includes(term.toLowerCase())
                //             ) ||
                //             terms.every((term) =>
                //                 class_.classNo
                //                     .toLowerCase()
                //                     .includes(term.toLowerCase())
                //             )
                //         );
                //     })
                // ) {
                //     return true;
                // } else {
                //     return false;
                // }
            });
        }

        // filter according to selectedLessonTypes (only allow those selected)
        if (selectedLessonTypes.length > 0) {
            t = t.filter((swapData) =>
                swapData.drawnClasses.find((class_) =>
                    selectedLessonTypes.includes(class_.lessonType)
                )
            );
        }

        return t;
    }, [_visibleSwaps, searchQuery, selectedLessonTypes]);

    // const selectModuleCodeLessonTypeHandler = (opt: Option) => {
    //     dispatch(miscActions.setHighlightedClassNos([]));
    //     setSelectedModuleCodeLessonType(opt);
    //     setAvailableClassNos([]);
    //     setSelectedClassNo(null);
    //     if (!opt) return;
    //     const moduleCode = opt.value.split(": ")[0];
    //     const lessonType = opt.value.split(": ")[1];
    //     const swapsMatching = allSwapsData?.openSwaps.filter(
    //         (swapData) =>
    //             swapData.swap.moduleCode === moduleCode &&
    //             swapData.swap.lessonType === lessonType
    //     );

    //     // the list of available class numbers for this slot
    //     const availableClassNos: string[] = [];
    //     // TODO: fix this
    //     // swapsMatching?.forEach((swap) => {
    //     //     if (swapData?.requestedClasses[swap.swapId]) {
    //     //         const requestedClasses =
    //     //             swapData?.requestedClasses[swap.swapId];
    //     //         const classNos = requestedClasses.map(
    //     //             (key) => key.wantedClassNo
    //     //         );
    //     //         availableClassNos.push(...classNos);
    //     //         availableClassNos.push(swap.classNo);
    //     //     }
    //     // });

    //     // remvoe duplicates from availableClassNos
    //     const uniqueAvailableClassNos = [...new Set(availableClassNos.flat())];
    //     setAvailableClassNos(uniqueAvailableClassNos);
    // };
    // const selectClassNoHandler = (opt: Option) => {
    //     setSelectedClassNo(opt);
    //     if (!opt) dispatch(miscActions.setHighlightedClassNos([]));
    //     else dispatch(miscActions.setHighlightedClassNos([opt.value]));
    // };

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
                // TODO: fix this
                // const requestedClasses = swapData?.requestedClasses[
                //     swap.swapId
                // ].map((class_) => class_.wantedClassNo);
                return (
                    swap.moduleCode === moduleCode &&
                    swap.lessonType === lessonType &&
                    swap.classNo === selectedClassNo.value
                    // ||
                    // requestedClasses?.includes(selectedClassNo.value)
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
        console.log("Loading more...");
        const newVisibleAmount = visibleAmount + SWAP_VISIBLE_AMOUNT;
        setVisibleAmount(newVisibleAmount);
        setVisibleSwaps(allSwapsData?.openSwaps.slice(0, newVisibleAmount));
    };

    const infiniteScrollRef = useRef<HTMLDivElement>(null);

    return (
        <Stack spacing={5} h="100%">
            <CTA_GENERAL
                title="🤝 Swap classes with others"
                description="Got CourseRekt? Need to swap a class? Find someone to swap with here! Create a swap request and get notified through Telegram when another person requests your class."
                image={SwapImage}
                ButtonLeft={
                    <Button
                        // rounded={"full"}
                        // size={"lg"}
                        fontWeight={"normal"}
                        px={6}
                        colorScheme={"blue"}
                        onClick={() => router.push("/swap/create")}
                        leftIcon={<AddIcon />}
                    >
                        Create request
                    </Button>
                }
            />

            <Tabs
                variant="soft-rounded"
                colorScheme="blue"
                isFitted
                index={tabIndex}
                onChange={handleTabsChange}
                ref={infiniteScrollRef}
            >
                <TabList>
                    <Tab>All swaps ({allSwapsData?.openSwaps.length})</Tab>
                    {user && (
                        <Tab>Your swaps ({allSwapsData?.selfSwaps.length})</Tab>
                    )}
                </TabList>

                <TabPanels
                    // borderLeft={"1px solid"}
                    // borderRight={"1px solid"}
                    // borderBottom={"1px solid"}
                    borderColor={borderColor}
                >
                    <TabPanel>
                        <Flex mb={4}>
                            <InputGroup size="sm">
                                <Input
                                    // type="search"
                                    placeholder="Search for anything..."
                                    value={searchText}
                                    onChange={(e) =>
                                        setSearchText(e.target.value)
                                    }
                                />
                                <InputRightElement>
                                    {searchQuery !== searchText && (
                                        <Spinner size="xs" />
                                    )}
                                </InputRightElement>
                            </InputGroup>
                            <Menu closeOnSelect={false}>
                                <MenuButton
                                    as={Button}
                                    rightIcon={<ChevronDownIcon />}
                                    size="sm"
                                    ml={2}
                                >
                                    Type
                                </MenuButton>
                                <MenuList>
                                    {/* <Text ml={4} fontWeight="semibold">
                                        {" "}
                                        Select type
                                    </Text>
                                    <MenuDivider />
                                    {lessonTypes.map((type, i) => (
                                        <MenuItem
                                            icon={
                                                selectedLessonTypes.includes(
                                                    type
                                                ) ? (
                                                    <TbCheck />
                                                ) : (
                                                    <></>
                                                )
                                            }
                                            key={i}
                                            onClick={() =>
                                                menuItemClicked(type)
                                            }
                                        >
                                            {" "}
                                            {type}{" "}
                                        </MenuItem>
                                    ))} */}
                                    <MenuOptionGroup
                                        title="Select type"
                                        type="checkbox"
                                    >
                                        {lessonTypes.map((type, i) => (
                                            <MenuItemOption
                                                key={i}
                                                value={type}
                                                onClick={() =>
                                                    menuItemClicked(type)
                                                }
                                            >
                                                {type}
                                            </MenuItemOption>
                                        ))}
                                    </MenuOptionGroup>
                                </MenuList>
                            </Menu>
                            {/* <Button
                                colorScheme="blue"
                                size="sm"
                                ml={2}
                                leftIcon={<TbPlus />}
                            >
                                New
                            </Button> */}
                        </Flex>

                        {!selectedModuleCodeLessonType && (
                            <InfiniteScroll
                                dataLength={visibleSwaps?.length || 0}
                                next={handleLoadMore}
                                hasMore={
                                    (allSwapsData?.openSwaps.length || 0) >
                                    visibleAmount
                                }
                                loader={<Loading />}
                                endMessage={
                                    <Ended scrollTo={infiniteScrollRef} />
                                }
                            >
                                <Stack spacing={6} divider={<Divider />}>
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
                                        (swapData, index) =>
                                            checkIfShouldDisplay(
                                                swapData.swap
                                            ) && (
                                                <SwapCard
                                                    key={index}
                                                    swap={swapData.swap}
                                                    swapData={swapData}
                                                    user={user}
                                                    RequestButton={
                                                        swapData.swap.requestors.includes(
                                                            (
                                                                user?.id ||
                                                                "LONG_STRING_THAT_DOESNT_EXIST"
                                                            ).toString()
                                                        ) ? (
                                                            <Button
                                                                ml={3}
                                                                size="xs"
                                                                colorScheme={
                                                                    "blue"
                                                                }
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    requestSwap(
                                                                        swapData
                                                                            .swap
                                                                            .swapId,
                                                                        user ||
                                                                            null,
                                                                        "remove"
                                                                    );
                                                                }}
                                                                isDisabled={
                                                                    !!requestState[
                                                                        swapData
                                                                            .swap
                                                                            .swapId
                                                                    ]
                                                                }
                                                            >
                                                                {requestState[
                                                                    swapData
                                                                        .swap
                                                                        .swapId
                                                                ] ||
                                                                    "Remove request"}
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                ml={3}
                                                                size="xs"
                                                                colorScheme={
                                                                    "blue"
                                                                }
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    requestSwap(
                                                                        swapData
                                                                            .swap
                                                                            .swapId,
                                                                        user ||
                                                                            null,
                                                                        "request"
                                                                    );
                                                                }}
                                                                isDisabled={
                                                                    !!requestState[
                                                                        swapData
                                                                            .swap
                                                                            .swapId
                                                                    ]
                                                                }
                                                            >
                                                                {requestState[
                                                                    swapData
                                                                        .swap
                                                                        .swapId
                                                                ] || "Request"}
                                                            </Button>
                                                        )
                                                    }
                                                />
                                            )
                                    )}
                                </Stack>
                            </InfiniteScroll>
                        )}

                        {/* The below section should be visible when filtering. We do not infinite-scroll when filtering. */}
                        {/* {selectedModuleCodeLessonType && (
                            <SimpleGrid
                                columns={{ base: 1, md: 1 }}
                                spacing={3}
                            >
                                {allSwapsData?.openSwaps.map(
                                    (swapData, index) =>
                                        checkIfShouldDisplay(swapData.swap) && (
                                            <SwapCard
                                                key={index}
                                                hasRequestedSwap={
                                                    hasRequestedSwap
                                                }
                                                requestSwap={requestSwap}
                                                swap={swapData.swap}
                                                swapData={swapData}
                                                user={user}
                                            />
                                        )
                                )}
                            </SimpleGrid>
                        )} */}
                    </TabPanel>
                    {user && (
                        <TabPanel>
                            <Stack spacing={6} divider={<Divider />}>
                                {allSwapsData?.selfSwaps.map(
                                    (swapData, index) => (
                                        // <SelfSwapCard
                                        //     key={index}
                                        //     hasRequestedSwap={hasRequestedSwap}
                                        //     requestSwap={requestSwap}
                                        //     swap={swapData.swap}
                                        //     swapData={allSwapsData}
                                        //     user={user}
                                        //     promptDelete={promptDelete}
                                        // />
                                        <SwapCard
                                            key={index}
                                            swap={swapData.swap}
                                            swapData={swapData}
                                            user={user}
                                            RequestButton={
                                                <Button
                                                    ml={3}
                                                    size="xs"
                                                    colorScheme={"red"}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        promptDelete(
                                                            swapData.swap.swapId
                                                        );
                                                    }}
                                                >
                                                    {" "}
                                                    Delete{" "}
                                                </Button>
                                            }
                                        />
                                    )
                                )}
                            </Stack>
                        </TabPanel>
                    )}
                </TabPanels>
            </Tabs>
            <ConfirmDelete {...disclosure} cb={handleDelete} />
        </Stack>
    );
};

export default Swap;
