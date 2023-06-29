import { ArrowDownIcon, ExternalLinkIcon, TimeIcon } from "@chakra-ui/icons";
import { TbArrowsDownUp, TbArrowsUpRight } from "react-icons/tb";
import {
    Alert,
    AlertIcon,
    Avatar,
    AvatarGroup,
    Badge,
    Box,
    Button,
    Center,
    Collapse,
    Flex,
    Heading,
    HStack,
    Icon,
    Link,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
    SimpleGrid,
    Slide,
    Stack,
    Tag,
    Text,
    Tooltip,
    useDisclosure,
    useToast,
    Wrap,
    WrapItem,
} from "@chakra-ui/react";
import type {
    GetServerSideProps,
    InferGetServerSidePropsType,
    NextPage,
} from "next";
import { useRouter } from "next/router";
import { useEffect, useState, MouseEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TelegramUser } from "telegram-login-button";
import Card from "../../components/Card/Card";
import ConfirmComplete from "../../components/Dialogs/ConfirmComplete";
import ConfirmDelete from "../../components/Dialogs/ConfirmDelete";
import Entry from "../../components/Sortables/Entry";
import SwapArrows from "../../components/Swap/SwapArrows";
import SwapEntry from "../../components/Swap/SwapEntry";
import UserDisplay from "../../components/User/UserDisplay";
import { sendDELETE, sendPATCH, sendPOST } from "../../lib/fetcher";
import {
    cleanArrayString,
    formatDate,
    formatTimeElapsed,
    encodeLessonTypeToShorthand,
} from "../../lib/functions";
import { requestSwapHelper } from "../../lib/helpers";
import { miscActions } from "../../store/misc";
import { ModuleWithClassDB } from "../../types/db";
import { ClassOverview, ClassSwapRequest, RootState } from "../../types/types";
import {
    GetSwapClassesData,
    SpecificSwapResponseData,
} from "../api/swap/[swapId]";
import UserAvatar from "../../components/User/UserAvatar";
import { TimetableLessonEntry } from "../../types/timetable";
import Timetable from "../../components/ReusableTimetable/Timetable";
import { GetSwapDataResponse, SwapData } from "../api/swap";
import SwapCodeIndicator from "../../components/Swap/SwapModuleCodeIndicator";

const ROOT_URL = process.env.NEXT_PUBLIC_ROOT_URL;

export const getServerSideProps: GetServerSideProps<{
    response: GetSwapClassesData;
    users: TelegramUser[];
}> = async (ctx) => {
    // get the data about this swap
    const { swapId } = ctx.query;
    const res = await fetch(`${ROOT_URL}api/swap/${swapId}`);
    const data: GetSwapClassesData = (await res.json()).data;

    const userData = await sendPOST(`${ROOT_URL}api/swap/${swapId}`, {});
    const safeUsers = userData.data;

    console.log({ data });
    return {
        props: {
            response: data,
            users: safeUsers,
        },
    };
};

const SpecificSwap = (
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
    console.log(props);
    const router = useRouter();
    const { swapId } = router.query as { swapId: string };

    // fetch the data about this swap from the backend
    // const [swap, setSwap] = useState<ClassSwapRequest>();
    // const [classData, setClassData] = useState<ModuleWithClassDB[]>();

    const [swapData, setSwapData] = useState<GetSwapClassesData | undefined>(
        props.response
    );
    const [users, setUsers] = useState<TelegramUser[]>(props.users || []);
    const {
        swap,
        drawnClasses,
        currentClassInfo,
        desiredClasses,
        isInternalSwap,
        desiredModules,
    } = swapData || {
        swap: undefined,
        drawnClasses: [],
        currentClassInfo: {
            classNo: "",
            lessonType: "Lecture",
            moduleCode: "",
        },
        desiredClasses: [],
        desiredModules: [],
    };

    // prevent hydration errors with user
    const _user = useSelector((state: RootState) => state.user);
    const [user, setUser] = useState<TelegramUser | null>(null);

    useEffect(() => {
        setUser(_user);
    }, [_user]);

    const misc = useSelector((state: RootState) => state.misc);

    useEffect(() => {
        if (!swapId) return;
        if (swapData?.swap.from_t_id === user?.id) {
            // make a fetch request to find the users who have requested this swap
            // only if you are the creator of the swap
            sendPOST(`/api/swap/${swapId}`, user).then((data) =>
                setUsers(data.data)
            );
        }
    }, [swapData, user, swapId]);

    const dispatch = useDispatch();
    const [hasRequestedSwap, setHasRequestedSwap] = useState("");
    const toast = useToast();
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

                // not signed in
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
            } catch (e) {
                toast({
                    title: "Error",

                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        };

    const deleteDisclosure = useDisclosure();
    const completeDisclosure = useDisclosure();
    const promptDelete = (e: MouseEvent<HTMLButtonElement>) => {
        deleteDisclosure.onOpen();
    };

    const promptComplete = () => {
        completeDisclosure.onOpen();
    };

    const handleDelete = async () => {
        const response = await sendDELETE(`/api/swap/${swapId}`, user);
        if (response.success) {
            toast({
                title: "Swap deleted!",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            router.push("/swap");
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

    const handleComplete = async () => {
        const response = await sendPATCH(`/api/swap/${swapId}`, user);
        if (response.success) {
            toast({
                title: "Swap completed!",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } else {
            toast({
                title: "Error completing swap",
                description: response.error,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const getProperty = (class_: TimetableLessonEntry) => {
        // if (requestedClassNos?.includes(class_.classNo)) return "selected";
        // else return "readonly";

        if (
            currentClassInfo.classNo === class_.classNo &&
            currentClassInfo.moduleCode === class_.moduleCode &&
            currentClassInfo.lessonType === class_.lessonType
        ) {
            return "readonly";
        } else return "selected";
    };

    // handle the expansion of the desired modules
    const [hoveredIndex, setHoveredIndex] = useState(-1);

    if (!swap) return <> Missing info </>;
    return (
        <Stack spacing={5} alignItems="center" h="100%">
            {user && user.id === swap.from_t_id && !misc.notify && (
                <Alert status="info">
                    <AlertIcon />
                    To receive notifications on Telegram when someone requests
                    your swap, click the bell in the top-right corner.
                </Alert>
            )}
            <Card>
                <Stack>
                    <HStack alignItems="center" justifyContent="center">
                        <TimeIcon />
                        <Text>
                            Created{" "}
                            {formatTimeElapsed(swap.createdAt.toString())}, on{" "}
                            {formatDate(new Date(swap.createdAt))}
                        </Text>
                    </HStack>{" "}
                    <Flex>
                        <Stack flex={1}>
                            <UserDisplay user={swap} />

                            {user?.id === swap.from_t_id &&
                                cleanArrayString(swap.requestors).length && (
                                    <>
                                        <TbArrowsDownUp fontSize={"1.75em"} />
                                        <Wrap>
                                            {swap.requestors
                                                .trim()
                                                .split(",")
                                                .map((requestor, index) => {
                                                    const user = users.find(
                                                        (user) =>
                                                            user.id.toString() ===
                                                            requestor
                                                    );
                                                    if (user)
                                                        return (
                                                            <WrapItem
                                                                key={index}
                                                            >
                                                                <Flex>
                                                                    <Link
                                                                        flex={1}
                                                                        isExternal
                                                                        href={`https://t.me/${user.username}`}
                                                                    >
                                                                        <UserDisplay
                                                                            user={
                                                                                user
                                                                            }
                                                                        >
                                                                            <ExternalLinkIcon
                                                                                ml={
                                                                                    1
                                                                                }
                                                                            />
                                                                        </UserDisplay>
                                                                    </Link>
                                                                    {/* <Button onClick={() => window.open(`t.me/${user.username}`)} size="sm">
                                                                Contact
                                                            </Button> */}
                                                                </Flex>
                                                            </WrapItem>
                                                        );
                                                })}{" "}
                                        </Wrap>
                                    </>
                                )}

                            {user?.id !== swap.from_t_id &&
                                cleanArrayString(swap.requestors).length && (
                                    <>
                                        <TbArrowsDownUp fontSize={"1.75em"} />
                                        <Tooltip
                                            placement="bottom-start"
                                            label={`${
                                                cleanArrayString(
                                                    swap.requestors
                                                ).length
                                            } ${
                                                cleanArrayString(
                                                    swap.requestors
                                                ).length === 1
                                                    ? "person"
                                                    : "people"
                                            } requested this swap`}
                                        >
                                            <AvatarGroup size="sm" max={5}>
                                                {swap.requestors
                                                    .trim()
                                                    .split(",")
                                                    .map((requestor, index) => {
                                                        const user = users.find(
                                                            (user) =>
                                                                user.id.toString() ===
                                                                requestor
                                                        );
                                                        if (user)
                                                            return (
                                                                // <Avatar
                                                                //     key={index}
                                                                //     name={
                                                                //         user.first_name
                                                                //     }
                                                                //     src={
                                                                //         user.photo_url
                                                                //     }
                                                                // />
                                                                <UserAvatar
                                                                    user={user}
                                                                    key={index}
                                                                />
                                                            );
                                                    })}
                                            </AvatarGroup>
                                        </Tooltip>
                                    </>
                                )}
                        </Stack>

                        {!user ? (
                            <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={requestSwap(
                                    swap.swapId,
                                    user,
                                    "request"
                                )}
                                disabled={hasRequestedSwap === "Requested!"}
                            >
                                {hasRequestedSwap || "Request"}
                            </Button>
                        ) : user.id === swap.from_t_id ? (
                            <>
                                {swap.status !== "Completed" && (
                                    <Button
                                        size="sm"
                                        colorScheme="blue"
                                        mr={2}
                                        onClick={promptComplete}
                                    >
                                        Complete
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    colorScheme="red"
                                    onClick={promptDelete}
                                >
                                    Delete
                                </Button>
                            </>
                        ) : cleanArrayString(swap.requestors).includes(
                              user?.id.toString() || ""
                          ) ? (
                            <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={requestSwap(
                                    swap.swapId,
                                    user,
                                    "remove"
                                )}
                                disabled={hasRequestedSwap === "Unrequested!"}
                            >
                                {hasRequestedSwap || "Unrequest"}
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={requestSwap(
                                    swap.swapId,
                                    user,
                                    "request"
                                )}
                                disabled={hasRequestedSwap === "Requested!"}
                            >
                                {hasRequestedSwap || "Request"}
                            </Button>
                        )}
                    </Flex>
                    {swap.comments && (
                        <Box>
                            <Heading fontSize="lg">Comments</Heading>
                            <Text>{swap.comments}</Text>
                        </Box>
                    )}
                </Stack>
            </Card>

            <Box w="full">
                <SwapCodeIndicator
                    desiredModulesInfo={desiredModules}
                    currentClassInfo={currentClassInfo}
                    perspective={user?.id === swap.from_t_id ? "self" : "other"}
                />
                <Timetable
                    classesToDraw={drawnClasses}
                    onSelected={() => {}}
                    property={getProperty}
                    showLessonType={!isInternalSwap}
                    showModuleCode={!isInternalSwap}
                />
            </Box>

            <ConfirmDelete {...deleteDisclosure} cb={handleDelete} />
            <ConfirmComplete {...completeDisclosure} cb={handleComplete} />
        </Stack>
    );

    return <></>;
};

export default SpecificSwap;
