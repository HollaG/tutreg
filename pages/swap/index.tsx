import {
  AddIcon,
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  TimeIcon,
} from "@chakra-ui/icons";
import {
  Alert,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  AspectRatio,
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

import { requestComm } from "../../lib/requestor";
import { miscActions } from "../../store/misc";
import { userActions } from "../../store/user";
import { ClassDB } from "../../types/db";
import { RootState, Option, ClassSwapRequest } from "../../types/types";
import { GetSwapDataResponse, SwapData } from "../api/swap";
import { GetClassesResponse, GroupedByClassNo } from "../api/swap/getClasses";

import NextLink from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import SwapCard from "../../components/Swap/SwapCard";
import Loading from "../../components/Indicators/Loading";
import Ended from "../../components/Indicators/Ended";

import { GetSwapClassesData, getSwapData } from "../api/swap/[swapId]";
import { TbCheck, TbChevronDown, TbNewSection, TbPlus } from "react-icons/tb";
import { LessonType } from "../../types/modules";
import CTA_GENERAL, { PlayIcon } from "../../components/CTA_general";

import SwapImage from "../../public/assets/swap_illustration.svg";
import RequestButton from "../../components/Swap/RequestButton";
import { FullInfo } from "./create";
import RequestAlert from "../../components/Swap/RequestAlert";
import { doc, onSnapshot } from "firebase/firestore";
import { fireDb } from "../../firebase";
import { REQUEST_INDEX_COLLECTION_NAME } from "../api/swap/request-specific";
import {
  ERROR_TOAST_OPTIONS,
  SUCCESS_TOAST_OPTIONS,
} from "../../lib/toasts.utils";
import executeQuery from "../../lib/db";

const SWAP_VISIBLE_AMOUNT = 20;
const CustomCardProps = {
  _hover: {
    boxShadow: "lg",
  },
  cursor: "pointer",
};

export const getServerSideProps: GetServerSideProps<{
  openSwaps: GetSwapClassesData[];
}> = async (ctx) => {
  // get the data about this swap - directly query the database instead of HTTP request
  const swaps: ClassSwapRequest[] = await executeQuery({
    query: `SELECT * FROM swaps LEFT JOIN users ON swaps.from_t_id = users.id WHERE ay = ? AND semester = ? AND status = 'Open' ORDER BY swaps.status DESC, swaps.createdAt DESC`,
    values: [process.env.NEXT_PUBLIC_AY, process.env.NEXT_PUBLIC_SEM],
  });

  if (!swaps.length) {
    return {
      props: {
        openSwaps: [],
      },
    };
  }

  const promisedSwapData = swaps.map((swap) =>
    getSwapData(swap.swapId, swap)
  );

  try {
    const swapData = await Promise.all(promisedSwapData);

    return {
      props: {
        openSwaps: swapData,
      },
    };
  } catch (e) {
    console.error("Error fetching swap data:", e);
    return {
      props: {
        openSwaps: [],
      },
    };
  }
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

      setRequestedSwaps([]);
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

  const router = useRouter();

  const borderColor = useColorModeValue("gray.200", "gray.700");

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
        ...SUCCESS_TOAST_OPTIONS,
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
        ...ERROR_TOAST_OPTIONS,
      });
    }
  };

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
    setVisibleSwaps(allSwapsData?.openSwaps.slice(0, newVisibleAmount));
  };

  const infiniteScrollRef = useRef<HTMLDivElement>(null);

  // "How It Works"
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const HOW_IT_WORKS = (
    <>
      <Button
        // rounded={"full"}
        // size={"lg"}
        fontWeight={"normal"}
        px={6}
        leftIcon={<PlayIcon h={4} w={4} color={"gray.300"} />}
        onClick={onOpen}
      >
        How It Works
      </Button>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        size={"6xl"}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Swap Tutorial Video
            </AlertDialogHeader>

            <AlertDialogBody>
              <AspectRatio ratio={16 / 9}>
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/_jSCD4AlbgI"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </AspectRatio>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Close
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );

  // Requesting a specific swap
  const {
    isOpen: isRequestOpen,
    onOpen: onRequestOpen,
    onClose: onRequestClose,
  } = useDisclosure();
  const cancelRequestRef = useRef<HTMLButtonElement>(null);
  // what the user HAS (his current class)

  // we actually set it as type TimetableLessonEntry but TimetableLessonEntry <: FullInfo
  const [userRequest, setUserRequest] = useState<FullInfo | null>(null);
  const [interactedSwap, setInteractedSwap] =
    useState<ClassSwapRequest | null>(null);

  const beforeRequestSwap = (info: FullInfo, swap: ClassSwapRequest) => {
    // don't allow the user to request his own class
    // if (user && user.id === swap?.from_t_id) {
    //     return;
    // }

    if (!user) {
      dispatch(miscActions.setNeedsLogIn(true));
    } else {
      setUserRequest(info);
      setInteractedSwap(swap);
      onRequestOpen();
    }
  };

  const liveRequestSwap = () => {
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
    if (!interactedSwap) {
      return toast({
        title: "Error",
        description: "You have not selected a swap",
        ...ERROR_TOAST_OPTIONS,
      });
    }

    // send an api request to backend
    sendPOST(`/api/swap/request-specific`, {
      swapId: interactedSwap?.swapId,
      moduleCode: userRequest.moduleCode,
      lessonType: userRequest.lessonType,
      classNo: userRequest.classNo,
      userId: user.id,
      hash: user.hash,
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
        onRequestClose();
        setUserRequest(null);
      });
  };

  // Listener to update the list of requested swaps whenever a request changes
  const [requestedSwaps, setRequestedSwaps] = useState<GetSwapClassesData[]>(
    []
  );
  useEffect(() => {
    if (!user) return;
    const docRef = doc(fireDb, "requestIndex", user.id.toString());
    const unsubscribe = onSnapshot(docRef, {
      next: (snapshot) => {
        const ids = snapshot.data()?.requests;

        if (!ids) return;
        setRequestedSwaps(
          allSwapsData.openSwaps.filter((s) =>
            ids.includes(s.swap.swapId.toString())
          )
        );
      },
    });
    return () => unsubscribe();
  }, [user]);
  return (
    <Stack spacing={5} h="100%">
      <Alert status='info'>
        <AlertIcon />
        The swap page will be revamped for AY25/26 Semester 1. Keep a lookout!
      </Alert>
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
        ButtonRight={HOW_IT_WORKS}
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
          <Tab>All ({allSwapsData?.openSwaps.length})</Tab>
          {user && (
            <Tab>Created ({allSwapsData?.selfSwaps.length})</Tab>
          )}
          {user && <Tab> Requested ({requestedSwaps.length})</Tab>}
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
                  flexShrink={0}
                >
                  Type
                </MenuButton>
                <MenuList>
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
            </Flex>

            <InfiniteScroll
              dataLength={visibleSwaps?.length || 0}
              next={handleLoadMore}
              hasMore={
                (allSwapsData?.openSwaps.length || 0) >
                visibleAmount
              }
              loader={<Loading />}
              endMessage={<Ended scrollTo={infiniteScrollRef} />}
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
                {visibleSwaps?.map((swapData, index) => (
                  <SwapCard
                    key={index}
                    swap={swapData.swap}
                    swapData={swapData}
                    user={user}
                    RequestButton={
                      <RequestButton
                        size="xs"
                        onClick={(option) => {
                          beforeRequestSwap(
                            option,
                            swapData.swap
                          );
                        }}
                        options={
                          swapData.desiredClasses
                        }
                      />
                    }
                    onRequest={(option) =>
                      beforeRequestSwap(
                        option,
                        swapData.swap
                      )
                    }
                  />
                ))}
              </Stack>
            </InfiniteScroll>
          </TabPanel>
          {user && (
            <TabPanel>
              <Stack spacing={6} divider={<Divider />}>
                {allSwapsData?.selfSwaps.map(
                  (swapData, index) => (
                    <SwapCard
                      key={index}
                      swap={swapData.swap}
                      swapData={swapData}
                      user={user}
                      RequestButton={
                        <Button
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
          {user && (
            <TabPanel>
              <Stack spacing={6} divider={<Divider />}>
                {requestedSwaps.map((swapData, index) => (
                  <SwapCard
                    key={index}
                    swap={swapData.swap}
                    swapData={swapData}
                    user={user}
                  />
                ))}
              </Stack>
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
      <ConfirmDelete {...disclosure} cb={handleDelete} />
      <RequestAlert
        isOpen={isRequestOpen}
        cancelRef={cancelRequestRef}
        onClose={onRequestClose}
        onConfirm={liveRequestSwap}
        swap={interactedSwap}
        userRequest={userRequest}
      />
    </Stack>
  );
};

export default Swap;
