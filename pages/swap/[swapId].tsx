import { ArrowDownIcon, ExternalLinkIcon, TimeIcon } from "@chakra-ui/icons";
import { TbArrowsDownUp, TbArrowsUpRight } from "react-icons/tb";
import {
  Alert,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
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
  useColorModeValue,
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
import { useEffect, useState, MouseEvent, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TelegramUser } from "telegram-login-button";
import Card from "../../components/Card/Card";
import ConfirmComplete from "../../components/Dialogs/ConfirmComplete";
import ConfirmDelete from "../../components/Dialogs/ConfirmDelete";
import Entry from "../../components/Sortables/Entry";
import SwapArrows from "../../components/Swap/SwapArrows";

import UserDisplay from "../../components/User/UserDisplay";
import { sendDELETE, sendPATCH, sendPOST } from "../../lib/fetcher";
import {
  cleanArrayString,
  formatDate,
  formatTimeElapsed,
  encodeLessonTypeToShorthand,
} from "../../lib/functions";

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
import { FullInfo } from "./create";
import { LessonType } from "../../types/modules";
import RequestButton from "../../components/Swap/RequestButton";
import { doc, onSnapshot } from "firebase/firestore";
import { COLLECTION_NAME, fireDb, SwapReplies } from "../../firebase";
import { db } from "../../lib/db";
import RequestAlert from "../../components/Swap/RequestAlert";
import {
  ERROR_TOAST_OPTIONS,
  SUCCESS_TOAST_OPTIONS,
} from "../../lib/toasts.utils";
import Head from "next/head";

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
  // Handle real-time updates:

  // because we don't have firebase auth, a non-authenticated user will only have read access
  const router = useRouter();
  const dispatch = useDispatch();

  const toast = useToast();
  const { swapId } = router.query as { swapId: string };

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

  // Handle requesting a specific class
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  // what the user HAS (his current class)

  // we actually set it as type TimetableLessonEntry but TimetableLessonEntry <: FullInfo
  const [userRequest, setUserRequest] = useState<FullInfo | null>(null);

  const beforeRequestSwap = (info: FullInfo) => {
    // don't allow the user to request his own class
    if (user && user.id === swap?.from_t_id) {
      return;
    }

    if (!user) {
      dispatch(miscActions.setNeedsLogIn(true));
    } else {
      setUserRequest(info);
      onOpen();
    }
  };

  const liveRequestSwap = (comments: string) =>
  // moduleCode: string,
  // lessonType: LessonType,
  // classNo: string
  {
    if (!user)
      return toast({
        title: "Error",
        description: "You are not logged in",
        ...ERROR_TOAST_OPTIONS,
      });
    if (!userRequest)
      return toast({
        title: "Error",
        description: "You have not selected a class",
        ...ERROR_TOAST_OPTIONS,
      });

    // send an api request to backend
    sendPOST(`/api/swap/request-specific`, {
      swapId,
      moduleCode: userRequest.moduleCode,
      lessonType: userRequest.lessonType,
      classNo: userRequest.classNo,
      userId: user.id,
      hash: user.hash,
      comments,
    })
      .then((res) => {
        if (res.success) {
          toast({
            title: "Success",
            description: res.data,
            ...SUCCESS_TOAST_OPTIONS,
          });
        } else {
          toast({
            title: "Error",
            description: res.error,
            ...ERROR_TOAST_OPTIONS,
          });
        }
      })
      .finally(() => {
        onClose();
        setUserRequest(null);
      });
  };

  // Handle live updates of people who selected
  // note: telegram user ID is exposed, but this is OK. https://www.reddit.com/r/Telegram/comments/cmw9eh/how_do_i_look_up_a_user_via_their_telegram_id/
  const [userReplies, setUserReplies] = useState<TelegramUser[]>([]);
  // convert the array to an object for easier lookup
  const userRepliesObj = useMemo(
    () =>
      userReplies.reduce((acc, curr) => {
        acc[curr.id] = curr;
        return acc;
      }, {} as Record<number, TelegramUser>),
    [userReplies]
  );

  const [swapReplies, setSwapReplies] = useState<SwapReplies | undefined>(
    undefined
  );
  useEffect(() => {
    const docRef = doc(fireDb, COLLECTION_NAME, swapId.toString());

    const unsubscribe = onSnapshot(docRef, {
      next: (doc) => {
        console.log("Recieved a live update!");
        const data = doc.data() as SwapReplies;

        setSwapReplies(data);

        if (user) {
          sendPOST(`/api/swap/${swapId}`, user).then((data) => {
            setUserReplies(data.data);
          });
        }
      },
    });

    return () => unsubscribe && unsubscribe();
  }, [user]);

  const deleteDisclosure = useDisclosure();
  const completeDisclosure = useDisclosure();
  const promptDelete = (e: MouseEvent<HTMLButtonElement>) => {
    deleteDisclosure.onOpen();
  };

  const promptComplete = () => {
    completeDisclosure.onOpen();
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await sendDELETE(`/api/swap/${swapId}`, user);
      if (response.success) {
        toast({
          title: "Swap deleted!",
          ...SUCCESS_TOAST_OPTIONS,
        });
        router.push("/swap");
      } else {
        toast({
          title: "Error deleting swap",
          description: response.error,
          ...ERROR_TOAST_OPTIONS,
        });
      }
    } catch (e: any) {
      toast({
        title: "Error deleting swap",
        description: e.toString(),
        ...ERROR_TOAST_OPTIONS,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const [isCompleting, setIsCompleting] = useState(false);
  const handleComplete = async () => {
    try {
      setIsCompleting(true);
      const response = await sendPATCH(`/api/swap/${swapId}`, user);
      if (response.success) {
        toast({
          title: "Swap completed!",
          ...SUCCESS_TOAST_OPTIONS,
        });

        setSwapData((prev) =>
          prev
            ? {
              ...prev,
              swap: {
                ...prev.swap,
                status: "Completed",
              },
            }
            : undefined
        );
      } else {
        toast({
          title: "Error completing swap",
          description: response.error,
          ...ERROR_TOAST_OPTIONS,
        });
      }
    } catch (e: any) {
      toast({
        title: "Error completing swap",
        description: e.toString(),
        ...ERROR_TOAST_OPTIONS,
      });
    } finally {
      setIsCompleting(false);
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
  const [hoveredClass, setHoveredClass] = useState<null | FullInfo>(null);

  const getClassNames = (class_: TimetableLessonEntry) => {
    if (
      class_.classNo === hoveredClass?.classNo &&
      class_.moduleCode === hoveredClass.moduleCode &&
      class_.lessonType === hoveredClass.lessonType
    )
      return "pulse";
    else return "";
  };

  const textColor = useColorModeValue("gray.700", "gray.300");

  // to prevent errors from the time elapsed function
  // text content did not match
  const [timeAgoString, setTimeAgoString] = useState("");
  useEffect(() => {
    if (swap)
      setTimeAgoString(formatTimeElapsed(swap.createdAt.toString()));
  }, [swap?.createdAt]);

  if (!swap) return <> Missing info </>;

  const summary =
    `Swap request for ⌜${swap.moduleCode} ${encodeLessonTypeToShorthand(swap.lessonType)} [${swap.classNo}]⌝ to one of ${desiredClasses.map(c => `${c.moduleCode} ${encodeLessonTypeToShorthand(c.lessonType)} [${c.classNo}]`).join(', ')}`;
  return (
    <>
      <Head>
        <title>tutreg.com | Swap Request</title>
        <meta name="description" content={summary} />
      </Head>
      <Stack spacing={5} alignItems="center" h="100%">
        <RequestAlert
          isOpen={isOpen}
          cancelRef={cancelRef}
          onClose={onClose}
          onConfirm={liveRequestSwap}
          swap={swap}
          userRequest={userRequest}
        />
        {user && user.id === swap.from_t_id && !misc.notify && (
          <Alert status="info">
            <AlertIcon />
            To receive notifications on Telegram when someone requests
            your swap, click the bell in the top-right corner.
          </Alert>
        )}

        {/* <Card> */}
        <Box w="100%">
          <Stack>
            <HStack alignItems="center" justifyContent="left">
              <TimeIcon />
              <Text textColor={textColor}>
                Created {timeAgoString}, on{" "}
                {formatDate(new Date(swap.createdAt))}
              </Text>
            </HStack>{" "}
            <Flex>
              <Stack flex={1}>
                <UserDisplay user={swap} />

                {swapReplies?.requests && (
                  <Stack flex={1}>
                    <Flex alignItems={"center"}>
                      <TbArrowsDownUp fontSize={"1.75em"} />
                      <Text ml={2}> requested </Text>
                    </Flex>

                    {/* Only show usernames and stuff if the requestor id is the current user */}

                    {user?.id === swap.from_t_id ? (
                      <Wrap spacing={3}>
                        {swapReplies.requests.map(
                          (r, i) => (
                            <WrapItem key={i}>
                              <Tooltip
                                label={`${r.requested.moduleCode} ${r.requested.lessonType} ${r.requested.classNo}`}
                              >
                                <Link
                                  onMouseEnter={() =>
                                    setHoveredClass(
                                      r.requested
                                    )
                                  }
                                  onMouseLeave={() =>
                                    setHoveredClass(
                                      null
                                    )
                                  }
                                  flex={1}
                                  isExternal
                                  href={`https://t.me/${userRepliesObj[
                                    r
                                      .requestorId
                                  ]
                                    ?.username ||
                                    ""
                                    }`}
                                >
                                  <UserDisplay
                                    user={
                                      userRepliesObj[
                                      r
                                        .requestorId
                                      ] || {
                                        username:
                                          r.requestorName,
                                        first_name:
                                          r.requestorName,
                                        auth_date:
                                          "",
                                        hash: "",
                                        id: r.requestorId,
                                        photo_url:
                                          "",
                                      }
                                    }
                                  >
                                    <ExternalLinkIcon
                                      ml={1}
                                    />
                                  </UserDisplay>
                                </Link>
                                {/* <Button onClick={() => window.open(`t.me/${user.username}`)} size="sm">
                                                                Contact
                                                            </Button> */}
                              </Tooltip>
                            </WrapItem>
                          )
                        )}
                      </Wrap>
                    ) : (
                      <Wrap spacing={1}>
                        {swapReplies.requests.map(
                          (r, i) => (
                            <WrapItem key={i}>
                              {" "}
                              <Tooltip
                                label={`${r.requested.moduleCode} ${r.requested.lessonType} ${r.requested.classNo}`}
                              >
                                <Avatar
                                  key={i}
                                  name={
                                    r.requestorName
                                  }
                                  size="sm"
                                  onMouseEnter={() =>
                                    setHoveredClass(
                                      r.requested
                                    )
                                  }
                                  onMouseLeave={() =>
                                    setHoveredClass(
                                      null
                                    )
                                  }
                                />
                              </Tooltip>
                            </WrapItem>
                          )
                        )}
                      </Wrap>
                    )}
                  </Stack>
                )}
              </Stack>

              {user?.id !== swap.from_t_id && (
                <RequestButton
                  size="sm"
                  options={desiredClasses}
                  onClick={beforeRequestSwap}
                />
              )}

              {user?.id === swap.from_t_id && (
                <>
                  {swap.status !== "Completed" && (
                    <Button
                      size="sm"
                      colorScheme="blue"
                      mr={2}
                      onClick={promptComplete}
                      isLoading={isCompleting}
                    >
                      Complete
                    </Button>
                  )}
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={promptDelete}
                    isLoading={isDeleting}
                  >
                    Delete
                  </Button>
                </>
              )}
            </Flex>
            {swap.comments && (
              <Box>
                <Heading fontSize="lg">Comments</Heading>
                <Text>{swap.comments}</Text>
              </Box>
            )}
          </Stack>
        </Box>
        {/* </Card> */}

        <Box w="full">
          <SwapCodeIndicator
            desiredModulesInfo={desiredModules}
            currentClassInfo={currentClassInfo}
            desiredClassesInfo={desiredClasses}
            onHover={setHoveredClass}
            drawnClasses={drawnClasses}
            // FooterButtons={<Button size="xs" colorScheme='blue' onClick={}> </Button>}
            onRequest={beforeRequestSwap}
          />
          <Timetable
            classesToDraw={drawnClasses}
            onSelected={beforeRequestSwap}
            property={getProperty}
            showLessonType={!isInternalSwap}
            showModuleCode={!isInternalSwap}
            getClassNames={getClassNames}
          />
          {user?.id !== swap.from_t_id && <Alert status="info" mt={2}>
            <AlertIcon />
            Click on the class that you have to initiate a swap request with this person.
          </Alert>}
        </Box>

        <ConfirmDelete {...deleteDisclosure} cb={handleDelete} />
        <ConfirmComplete {...completeDisclosure} cb={handleComplete} />
      </Stack ></>
  );

  return <></>;
};

export default SpecificSwap;
