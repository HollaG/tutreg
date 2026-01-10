import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightAddon,
  Link,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useBoolean,
  useColorModeValue,
  useMediaQuery,
  Text,
  Collapse,
  Divider,
  Tooltip,
  useToast,
  InputLeftAddon,
  InputRightElement,
  useClipboard,
  Tag,
  Stepper,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepStatus,
  StepTitle,
  StepSeparator,
  useSteps,
  useBreakpointValue,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  CloseButton,
  FormLabel,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  PopoverFooter,
  InputLeftElement,
  Kbd,
  useDisclosure,
  AspectRatio,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Container,
  Grid,
} from "@chakra-ui/react";
import { AnyARecord } from "dns";
import { NextPage } from "next";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactSelect, { InputActionMeta, MultiValue } from "react-select";
import { AsyncSelect, Select } from "chakra-react-select";
import ModuleSortContainer from "../components/Sortables/ModuleSort/ModuleSortContainer";
import ClassSortContainer from "../components/Sortables/ClassSort/ClassSortContainer";
import { sendPOST } from "../lib/fetcher";
import { ModuleCondensed } from "../types/modules";
import { RootState } from "../types/types";
import { ModulesResponseData } from "./api/modules";
import { classesActions, ClassState } from "../store/classesReducer";

import { Option } from "../types/types";
import ResultContainer from "../components/Sorted/ResultContainer";
import NextLink from "next/link";
import { useRouter } from "next/router";
import Explanation from "../components/Description/Explanation";
import { ImportResponseData } from "./api/import";
import {
  formatTimeElapsed,
  generateLink,
  getModuleColor,
  tutregToNUSMods,
} from "../lib/functions";

import { GrSync } from "react-icons/gr";
import { IconContext } from "react-icons";
import { miscActions, MiscState } from "../store/misc";
import { CopyIcon, InfoOutlineIcon, QuestionIcon, QuestionOutlineIcon } from "@chakra-ui/icons";
import Image from "next/image";
import OrderImage from "../public/assets/order_illustration.svg";
import CTA_GENERAL, { PlayIcon } from "../components/CTA_general";
import ModuleSelect from "../components/Select/ModuleSelect";
import Mousetrap from "mousetrap";
import { Keybind } from "../components/Navbar";
import { isMobile } from "react-device-detect";
import {
  ERROR_TOAST_OPTIONS,
  SUCCESS_TOAST_OPTIONS,
} from "../lib/toasts.utils";
import { fireDb } from "../firebase";
import { deleteDoc, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { resolve } from "node:path/win32";
import { FullPage } from "../components/PageWrap/FullPage";
import { ContainedPage } from "../components/PageWrap/ContainedPage";
import Timetable from "../components/ReusableTimetable/Timetable";
import { LiveTimetable } from "../components/ReusableTimetable/LiveTimetable";
import useLocalStorageState from "use-local-storage-state";
const ay = process.env.NEXT_PUBLIC_AY;
const sem = process.env.NEXT_PUBLIC_SEM;
const SYNC_COLLECTION_NAME =
  process.env.NEXT_PUBLIC_SYNC_COLLECTION_NAME || "userStorage";
const Order: NextPage = () => {
  const isBiggerThanXl = useBreakpointValue({ base: false, xl: true });
  const _miscState = useSelector((state: RootState) => state.misc);
  const [miscState, setMiscState] = useState<MiscState | null>(null);
  const _dualMode = useSelector((state: RootState) => state.misc.dualMode);
  const [dualMode, setDualMode] = useState(true);
  useEffect(() => {
    setDualMode(_dualMode);
  }, [_dualMode]);

  useEffect(() => {
    setMiscState(_miscState);
  }, [_miscState]);


  const toast = useToast();
  const user = useSelector((state: RootState) => state.user);

  const [link, setLink] = useState("");
  const isError =
    !link.startsWith("https://nusmods.com/timetable/sem") && !link.includes('shorten.nusmods.com') && link !== "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result: ImportResponseData = await sendPOST("/api/import", {
      url: link,
    });

    const data = result.data;

    if (!data) {
      setIsSubmitting(false);
      return toast({
        title: "Error importing classes!",
        description: result.error,
        ...ERROR_TOAST_OPTIONS,
      });
    }

    toast({
      title: "Classes imported",
      ...SUCCESS_TOAST_OPTIONS,
    });
    dispatch(classesActions.setState(data));
    setIsSubmitting(false);
  };

  // Check if the user is importing something
  const router = useRouter();

  const [isImportingShareURL, setIsImportingShareURL] = useState(false);

  useEffect(() => {
    if (router.query.share) {
      const link = tutregToNUSMods(
        `https://tutreg.com/order?share=${router.query.share}`
      ) as string;
      sendPOST("/api/import", {
        url: link,
      })
        .then((result: ImportResponseData) => {
          const data = result.data;
        })
        .catch((err) => {
          toast({
            title: "Error importing classes!",
            description: err,
            ...ERROR_TOAST_OPTIONS,
          });
        });

      // console.log(router.query)

      // TODO: Continue work on importing URLs
    }
  }, [router.query]);

  const [selectedModules, setSelectedModules] = useState<Option[]>([]);

  const handleSelectChange = (newValue: Option[]) => {
    setSelectedModules(newValue);
    setTimeout(() => { });
  };

  const data = useSelector((state: RootState) => state.classesInfo);

  // fetch the list of modules from nusmods
  const [moduleList, setModuleList] = useState<ModuleCondensed[]>();

  useEffect(() => {
    fetch(`https://api.nusmods.com/v2/${ay || "2023-2024"}/moduleList.json`)
      .then((res) => res.json())
      .then((data) => {
        setModuleList(data);
      })
      .catch((err) => {
        toast({
          title: "Error fetching modules!",
          description: err,
          ...ERROR_TOAST_OPTIONS,
        });
      });
  }, []);

  // custom filter to prevent duplicate modules from appearing
  const filterSelectedModules = (option: Option) =>
    !(
      selectedModules.map((sel) => sel.value).includes(option.value) ||
      data.moduleOrder.includes(option.value)
    );

  const loadOptions = (inputValue: string) =>
    new Promise<any[]>((resolve) => {
      if (!moduleList) return resolve([]);

      const sanitizedValue = inputValue.trim().toUpperCase();
      if (inputValue.length < 3 || inputValue.length > 8) {
        resolve([]);
        return;
      }

      const matchedModules = moduleList.filter((module) =>
        module.moduleCode.includes(sanitizedValue)
      );

      if (!matchedModules.length) return resolve([]);

      // Request from internal database
      sendPOST(`/api/modules`, {
        modules: matchedModules,
      }).then((result: ModulesResponseData) => {
        if (!result.success || !result.data)
          return toast({
            title: "Error fetching modules!",
            description: result.error,
            ...ERROR_TOAST_OPTIONS,
          });

        const options = Object.keys(result.data).map((key) => ({
          value: key,
          label: key,
        }));

        // filter the options to remove a) already selected b) already in classesSelected
        const filteredOptions = options.filter(
          (option) =>
            !(
              selectedModules
                .map((sel) => sel.value)
                .includes(option.value) ||
              data.moduleOrder.includes(option.value)
            )
        );

        // Group the options by module code
        const groupedOptions: {
          label: string;
          options: Option[];
        }[] = [];

        filteredOptions.forEach((option) => {
          if (
            !groupedOptions.find(
              (opt) => opt.label === option.label.split(":")[0]
            )
          ) {
            groupedOptions.push({
              label: option.label.split(":")[0],
              options: [option],
            });
          } else {
            groupedOptions
              .find(
                (opt) =>
                  opt.label === option.label.split(":")[0]
              )
              ?.options.push(option);
          }
        });

        resolve(groupedOptions);
      });
    });

  const dispatch = useDispatch();
  const addModules = async () => {
    if (!selectedModules.length) return;
    const modules = selectedModules.map((module) => module.value);

    // when user adds modules, send request to retrieve the classInfo for that
    const response: ModulesResponseData = await sendPOST("/api/modules", {
      modules: modules.map((module) => ({
        moduleCode: module.split(":")[0],
      })),
    });

    if (!response.success || !response.data)
      return alert("Unexpected error");

    dispatch(classesActions.addAvailableClasses(response.data));

    // note: this must be AFTER add availalbe classes, beacuse we don't want other code to try to access a non-existent class
    // when the other components update

    dispatch(classesActions.addModules(modules));
    setSelectedModules([]);
  };

  const [showAdditionalDetails, { toggle }] = useBoolean();

  // Update the displayed link whenever the modules changes
  const [timetableLink, setTimetableLink] = useState("");
  useEffect(() => {
    if (Object.keys(data.selectedClasses).length === 0) {
      setTimetableLink("");
    } else {
      setTimetableLink(
        generateLink({ ...data.selectedClasses, ...data.nonBiddable })
      );
    }
  }, [data]);

  // the previous previous last updated time
  // Note: Store all this data in a Ref.
  // Refs are memory-based, so even in a callback, even if it's not recreated, we will have access to the latest data.
  const lastLastUpdatedReference = useRef(data.lastUpdated);
  const classesStateReference = useRef(data);
  useEffect(() => {
    classesStateReference.current = data;
  }, [data]);
  const [alertNewer, setAlertNewer] = useState<number | null>();
  const [alertOlder, setAlertOlder] = useState<number | null>();
  // Set a timeout that will fire after 15 seconds.
  // restarts the timer when the user changes again.
  useEffect(() => {
    if (!user) return;
    const timeout = setTimeout(() => {
      // update the firebase
      // only update the cloud if the user has dismissed the alert that the data timing is behind.
      // check if there is a sync conflict first.

      const docRef = doc(
        fireDb,
        SYNC_COLLECTION_NAME,
        user.id.toString()
      );

      if (!alertNewer && !alertOlder) {
        // Check if the firebase data is newer than the local data
        // If it is, then we should alert the user that their data is behind.
        // If it isn't, then we can just overwrite.

        // Consider this scenario
        // On computer A: user changes some data. A is synced to Firebase.
        // On computer B: user downloads the data. B is synced to Firebase.
        // On computer A: user changes more data. A is synced to Firebase and firebase is updated.
        // On computer B: B is no longer synced to firebase (Firebase is ahead) user changes some data. This data CANNOT be uploaded.
        const docDb = getDoc(docRef);

        docDb.then((d) => {
          if (!d.exists()) {
            // user has no data in firebase
            uploadLocalData();
            return;
          }
          const fireData = d.data() as ClassState;
          // check if the latest firebase data is not the same as the last updated before the latest change
          if (
            fireData.lastUpdated !==
            lastLastUpdatedReference.current
          ) {
            // alert error
            // sync conflict!
            if (
              fireData.lastUpdated >
              classesStateReference.current.lastUpdated
            ) {
              // cloud is NEWER

              setAlertNewer(fireData.lastUpdated);
            } else {
              // cloud is OLDER

              setAlertNewer(fireData.lastUpdated);
            }
          } else {
            console.log("Data uploaded to cloud");
            uploadLocalData();
          }
        });
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [data, user, alertNewer, alertOlder]);

  // When the user loads the page, check to see if they have newer data in Firebase.
  useEffect(() => {
    // only if they're logged in
    if (!user) return;
    const docRef = doc(fireDb, SYNC_COLLECTION_NAME, user.id.toString());
    // try to get the doc
    const docData = getDoc(docRef);
    docData.then((d) => {
      if (!d.exists()) {
        // the data doesn't exist in the state, copy over the data from the redux store
        // const classesInfo = classesStateReference.current;
        // setDoc(docRef, classesInfo);
      } else {
        const cloudClassesInfo = d.data() as ClassState;

        // if AY and SEM are different, delete the data.
        if (
          cloudClassesInfo.AY !== ay ||
          cloudClassesInfo.SEM !== sem
        ) {
          deleteDoc(docRef);
          return;
        } else {
          // if the data in the server is NEWER, check if the user wants to overwrite local data.
          if (
            cloudClassesInfo.lastUpdated >
            classesStateReference.current.lastUpdated
          ) {
            setAlertNewer(cloudClassesInfo.lastUpdated);
          } else if (
            cloudClassesInfo.lastUpdated <
            classesStateReference.current.lastUpdated
          ) {
            // the data in the cloud is OLDER. Do we want to overwrite local?

            setAlertOlder(cloudClassesInfo.lastUpdated);
          } else {
            setAlertNewer(null);
            setAlertOlder(null);
          }
        }
      }
    });
  }, [user]);

  /**
   * The user decides to replace local data with that in Firebase.
   */
  const replaceLocalData = () => {
    if (!user) return;
    const docRef = doc(fireDb, SYNC_COLLECTION_NAME, user.id.toString());
    const docData = getDoc(docRef);

    docData.then((d) => {
      const fireData = d.data() as ClassState;
      dispatch(classesActions.setState(fireData));
      classesStateReference.current = fireData;
      lastLastUpdatedReference.current = fireData.lastUpdated;
      setAlertNewer(null);
      setAlertOlder(null);
    });
  };

  /**
   * The user decides to upload local data to the cloud, overriding any data in it.
   */
  const uploadLocalData = () => {
    if (!user) return;
    const classesInfo = classesStateReference.current;
    const docRef = doc(fireDb, SYNC_COLLECTION_NAME, user?.id.toString());

    setAlertNewer(null);
    setAlertOlder(null);
    setDoc(docRef, classesInfo);

    // update the last updated reference
    lastLastUpdatedReference.current = classesInfo.lastUpdated;
  };

  const steps = [
    {
      title: "Rank & add courses",
      description: "Rank each course according to how much you want it",
    },
    {
      title: "Rank & add classes",
      description:
        "Rank each class in each course according to how much you want it",
    },
    {
      title: "Computed ranking",
      description: "View the generated optimized ranking",
    },
    {
      title: "Export to EduRec",
      description: "Export the generated ranking to EduRec",
    },
  ];
  const { activeStep, setActiveStep } = useSteps({
    index: 1,
    count: steps.length,
  });

  const [shareLink, setShareLink] = useState("");
  const { hasCopied, onCopy } = useClipboard(shareLink);

  const clickedCopy = () => {
    setActiveStep(4);
    onCopy();
  };

  // handle onboarding stuff (TODO - add guide)
  const beginOnboarding = () => {
    step1Ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  // refs for each step
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);

  const classesInfo = useSelector((state: RootState) => state.classesInfo);

  useEffect(() => {
    if (!classesInfo) return;
    // check if step 1 is done (at least 1 module selected)

    // check if step 2 and 3 is done (at least 1 class selected )
    if (Object.keys(classesInfo.selectedClasses).length) {
      setActiveStep(3);
    } else if (classesInfo.moduleOrder.length) {
      setActiveStep(1);
    } else {
      setActiveStep(0);
    }
    // check if step 2 is done (at least 1 class selected)
  }, [classesInfo]);

  const DetailsButton = (
    <Tooltip label="Show additional details such as vacancies">
      <Button
        size="xs"
        colorScheme={"teal"}
        variant={showAdditionalDetails ? "solid" : "ghost"}
        onClick={toggle}
        width="90px"
        ml={2}
      >
        {" "}
        {showAdditionalDetails ? "Hide" : "View"} details{" "}
      </Button>
    </Tooltip>
  );

  // I appreciate NUSMods for giving the code for this section.
  // Code located in: src/views/components/KeyboardShortcuts.tsx
  // to let the user scroll to each step easily
  const shortcuts = useRef<Keybind[]>([]);
  useEffect(() => {
    function bind(
      key: string,
      description: string,
      action: (e: Event) => void
    ) {
      shortcuts.current.push({ key, description });
      Mousetrap.bind(key, action);
    }
    bind("`", "Go to top of page", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    bind("1", "Go to step 1", () => {
      step1Ref.current?.scrollIntoView({ behavior: "smooth" });
    });
    bind("2", "Go to step 2", () => {
      step2Ref.current?.scrollIntoView({ behavior: "smooth" });
    });
    bind("3", "Go to step 3", () => {
      step3Ref.current?.scrollIntoView({ behavior: "smooth" });
    });
    bind("4", "Go to step 4", () => {
      step4Ref.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => {
      shortcuts.current.forEach(({ key }) => Mousetrap.unbind(key));
      shortcuts.current = [];
    };
  }, []);

  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    setShowShortcuts(!isMobile);
  }, [isMobile]);

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
              Rank Tutorial Video
            </AlertDialogHeader>

            <AlertDialogBody>
              <AspectRatio ratio={16 / 9}>
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/aE4eNiOIm4M"
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

  const Wrapper = dualMode ? FullPage : ContainedPage;


  // ------------- LEGEND --------------
  // generate a colour map for the modules selected
  let colorList: string[] = []
  const [colorMap, setColorMap] = useState<(string | null)[]>([])
  useEffect(() => {
    setColorMap(classesInfo.colorMap)
  }, [classesInfo.colorMap])

  colorMap.forEach((mclt, index) => {
    // cap at 3
    if (mclt != null && colorList.length < 3) colorList.push(getModuleColor(colorMap, mclt))
  })
  const STATIC_STRIPED_BG_COLOR = useColorModeValue(
    'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 11px)',
    'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.2) 10px, rgba(255,255,255,0.2) 11px)'
  )


  return (<FullPage>
    <SimpleGrid columns={{ base: 1, xl: (dualMode) ? 2 : 1 }} spacingX={"6rem"} spacingY="2rem">
      <Container maxW={"container.lg"}>


        <Stack>
          {alertNewer && (
            <Alert
              status="warning"
              justifyContent={"space-between"}
              // flexWrap="wrap"
              alignItems={"center"}
            >
              <Flex alignItems={"center"}>
                <AlertIcon />A newer version of your ranking has been
                detected in the cloud (uploaded{" "}
                {formatTimeElapsed(new Date(alertNewer).toString())}).
              </Flex>
              <Flex
                minWidth={"160px"}
                flexWrap="wrap"
                justifyContent={"end"}
              >
                <Button
                  size="xs"
                  colorScheme={"red"}
                  onClick={replaceLocalData}
                  mb={1}
                >
                  Download cloud
                </Button>
                <Button
                  size="xs"
                  colorScheme={"red"}
                  ml={2}
                  onClick={uploadLocalData}
                >
                  Upload local
                </Button>
              </Flex>
            </Alert>
          )}
          {alertOlder && (
            <Alert
              status="warning"
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Flex alignItems={"center"} flexGrow={1}>
                <AlertIcon />
                An older version of your ranking has been detected in
                the cloud (uploaded{" "}
                {formatTimeElapsed(new Date(alertOlder).toString())}).
              </Flex>
              <Flex
                minWidth={"160px"}
                flexWrap="wrap"
                justifyContent={"end"}

              >
                <Button
                  size="xs"
                  colorScheme={"red"}
                  mb={1}
                  onClick={replaceLocalData}
                >
                  Download cloud
                </Button>
                <Button
                  size="xs"
                  colorScheme={"red"}
                  onClick={uploadLocalData}
                  ml={2}
                >
                  Upload local
                </Button>
              </Flex>
            </Alert>
          )}
          <CTA_GENERAL
            title="🥇 Rank your classes"
            description="Not sure how to rank your classes for Tutorial Registration? Use this tool to generate the most optimal ranking for you, based on your preferences!"
            image={OrderImage}
            ButtonLeft={
              <Button
                // rounded={"full"}
                // size={"lg"}
                fontWeight={"normal"}
                px={6}
                colorScheme={"blue"}
                onClick={beginOnboarding}
              >
                Get started
              </Button>
            }
            ButtonRight={HOW_IT_WORKS}
          />
          <Stepper index={activeStep} orientation="vertical" w="full">
            <Box width="100%" ref={step1Ref}>
              <Step>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>

                <Box w="100%" ml={2}>
                  <Flex
                    alignItems={"center"}
                    justifyContent="space-between"
                  >
                    <Box>
                      <StepTitle>{steps[0].title}</StepTitle>
                      <StepDescription>
                        {steps[0].description}
                      </StepDescription>
                    </Box>
                    {DetailsButton}
                  </Flex>

                  <Stack p={1}>
                    <form onSubmit={handleSubmit}>
                      <Flex>
                        <FormControl isInvalid={isError}>
                          <Flex
                            // alignItems={"center"}
                            justifyContent="space-between"
                          >
                            <Box mr={3} flexGrow={1}>
                              <Input
                                placeholder="https://shorten.nusmods.com/?... OR https://nusmods.com/timetable/sem-1/share?..."
                                value={link}
                                onChange={(e) =>
                                  setLink(
                                    e.target.value
                                  )
                                }
                              />

                              {
                                <FormHelperText>
                                  {" "}
                                  Paste the timetable
                                  link you send to
                                  your friends!
                                </FormHelperText>
                              }
                              {isError && (
                                <FormErrorMessage>
                                  Invalid share link!
                                </FormErrorMessage>
                              )}
                            </Box>
                            <Box
                              width="85px"
                              minWidth={"85px"}
                              flexShrink={0}
                            >
                              <Tooltip
                                hasArrow
                                label="Importing a new timetable will clear your previously selected courses, if any!"
                                textAlign="center"
                              >
                                <Button
                                  type="submit"
                                  colorScheme="blue"
                                  isDisabled={!link}
                                  isLoading={
                                    isSubmitting
                                  }
                                >
                                  {" "}
                                  Import
                                </Button>
                              </Tooltip>
                            </Box>
                          </Flex>
                        </FormControl>
                      </Flex>
                    </form>
                    <Flex
                      justifyContent={"space-between"}
                      alignItems="center"
                    >
                      <Divider />
                      <Text mx={3} fontWeight="semibold">
                        {" "}
                        or{" "}
                      </Text>
                      <Divider />
                    </Flex>
                    <form onSubmit={(e) => e.preventDefault()}>
                      <Flex>
                        <Box flex={1} mr={3}>
                          {/* <FormControl>
                                                <AsyncSelect
                                                    instanceId={`${ay}-select`}
                                                    closeMenuOnSelect={false}
                                                    placeholder="Search..."
                                                    value={selectedModules}
                                                    isMulti
                                                    // cacheOptions
                                                    loadOptions={loadOptions}
                                                    // inputValue={value}
                                                    onInputChange={
                                                        handleInputChange
                                                    }
                                                    onChange={(newValue: any) =>
                                                        handleSelectChange(
                                                            newValue
                                                        )
                                                    }
                                                />
                                                <FormHelperText>
                                                    Search for a course (min. 3
                                                    chars)
                                                </FormHelperText>
                                                <FormHelperText>
                                                    Courses unavailable for
                                                    bidding in tutorial rounds
                                                    are not shown.
                                                </FormHelperText>
                                            </FormControl> */}
                          <ModuleSelect
                            onSelect={handleSelectChange}
                            additionalFilter={
                              filterSelectedModules
                            }
                            isMulti
                            hideNonBiddable={true}
                          />
                        </Box>
                        <Button
                          onClick={() => addModules()}
                          type="submit"
                          colorScheme="blue"
                          width="85px"
                        >
                          {" "}
                          Add{" "}
                        </Button>
                      </Flex>
                    </form>
                    <ModuleSortContainer
                      showAdditionalDetails={
                        showAdditionalDetails
                      }
                    />
                  </Stack>
                </Box>

                <StepSeparator />
              </Step>
            </Box>
            <Box width="100%" ref={step2Ref}>
              <Step>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>

                <Box w="100%" ml={2}>
                  <Flex
                    alignItems={"center"}
                    justifyContent="space-between"
                  >
                    <Box>
                      <StepTitle>{steps[1].title}</StepTitle>
                      <StepDescription>
                        {steps[1].description}
                      </StepDescription>
                    </Box>
                    {DetailsButton}
                  </Flex>
                  <Stack p={1}>
                    <ClassSortContainer
                      showAdditionalDetails={
                        showAdditionalDetails
                      }
                    />
                  </Stack>
                </Box>

                <StepSeparator />
              </Step>
            </Box>
            <Box w="100%" ref={step3Ref}>
              <Step>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>

                <Box w="100%" ml={2}>
                  <Flex
                    alignItems={"center"}
                    justifyContent="space-between"
                  >
                    <Box>
                      <StepTitle>{steps[2].title}</StepTitle>
                      <StepDescription>
                        {steps[2].description}
                      </StepDescription>
                    </Box>
                    {DetailsButton}
                  </Flex>
                  <Stack p={1}>
                    <ResultContainer
                      showAdditionalDetails={
                        showAdditionalDetails
                      }
                      setShareLink={setShareLink}
                    />
                  </Stack>
                </Box>

                <StepSeparator />
              </Step>
            </Box>
            <Box w="100%" ref={step4Ref}>
              <Step>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>

                <Box w="100%" ml={2}>
                  <Flex
                    alignItems={"center"}
                    justifyContent="space-between"
                  >
                    <Box>
                      <StepTitle>{steps[3].title}</StepTitle>
                      <StepDescription>
                        {steps[3].description}
                      </StepDescription>
                    </Box>
                    {/* {DetailsButton} */}
                  </Flex>
                </Box>

                <StepSeparator />
              </Step>
            </Box>
          </Stepper>
          <Stack p={1}>
            <Box>
              <Flex
                fontWeight="semibold"
                mb={2}
                ml={2}
                display="flex"
                flexWrap={"wrap"}
              >
                {" "}
                Export link
                <Popover>
                  <PopoverTrigger>
                    <Text
                      as={Box}
                      ml={2}
                      fontWeight="normal"
                      borderBottom={"2px dotted"}
                      // borderBottomColor={useColorModeValue(
                      //     "black",
                      //     "white"
                      // )}
                      cursor="help"
                    >
                      to Tutreg Companion Extension
                    </Text>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverCloseButton />

                    <PopoverBody fontWeight={"normal"}>
                      The Tutreg Companion Extension helps you
                      import the ranking of classes you just made
                      above into EduRec with just two button
                      presses.
                    </PopoverBody>
                    <PopoverFooter
                      display="flex"
                      justifyContent={"right"}
                      w="100%"
                      alignItems={"center"}
                    >
                      <Box>
                        <Link
                          // as={NextLink}
                          isExternal
                          href="https://chrome.google.com/webstore/detail/tutreg-companion-extensio/alklihigfndbjjihbglpfpadlmkcgdja"
                          // open in new window
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="xs"
                            mr={2}
                            colorScheme="orange"
                          >
                            Get extension{" "}
                          </Button>
                        </Link>
                      </Box>
                      <Box>
                        <Link as={NextLink} href="/extension">
                          <Button
                            size="xs"
                            colorScheme={"blue"}
                          >
                            Learn more
                          </Button>
                        </Link>
                      </Box>
                    </PopoverFooter>
                  </PopoverContent>
                </Popover>
              </Flex>
              <InputGroup>
                {/* <InputLeftAddon>Export link</InputLeftAddon> */}

                <InputLeftElement>
                  <CopyIcon />
                </InputLeftElement>
                <Input
                  readOnly
                  value={shareLink}
                  onClick={clickedCopy}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={clickedCopy}
                    w="70px"
                    colorScheme={hasCopied ? "green" : "gray"}
                    mr={2}
                  >
                    {hasCopied ? "Copied!" : "Copy"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Box>
          </Stack>

          {showShortcuts && (
            <Text
              mt={10}
              fontWeight="light"
              textAlign={"right"}
              fontSize="sm"
            >
              {" "}
              Pst, did you know you can press <Kbd>1</Kbd> <Kbd> 2</Kbd>{" "}
              <Kbd> 3</Kbd> <Kbd>4</Kbd> to jump steps?{" "}
            </Text>
          )}
        </Stack>
      </Container>
      <Box
        position="sticky"
        top="64px"          // below your Nav height
        alignSelf="start"   // important so it doesn't stretch
        maxH="calc(100vh - 64px)"
        overflowY="auto"    //</SimpleGrid>>
      >
        <Flex justifyContent={"space-between"} mb={3}>
          {miscState && <>

            {!miscState.timetableModifyingMode ? <Grid gridTemplateColumns={'64px 1fr'} alignItems={'center'} columnGap={4}>
              <HStack>{colorList.map((color, index) => <Button key={`solid-${index}`} size="xxs" colorScheme={color}></Button>)}
              </HStack>
              <Tooltip label="These are the classes that you intend to bid for in Tutorial Registration. Solid colours indicate your top choices.">
                <Text>Biddable classes (first choice) <QuestionOutlineIcon fontSize={"sm"} /></Text>
              </Tooltip>
              <HStack>
                {colorList.map((color, index) => <Button key={`subtle-${index}`} size="xxs" colorScheme={color} variant="subtle"></Button>)}
              </HStack>
              <Tooltip label="These are the classes that you intend to bid for in Tutorial Registration. Subtle colours indicate your lower choices.">
                <Text>Biddable classes (not first choice) <QuestionOutlineIcon fontSize={"sm"} /></Text>
              </Tooltip>
              <Box style={{
                width: "64px",
                height: "1rem",
                backgroundImage: STATIC_STRIPED_BG_COLOR,
              }}></Box>
              <Tooltip label="These are reference classes that you do not intend to bid for in Tutorial Registration. They are added to your timetable for reference only.">

                <Text>Reference classes <QuestionOutlineIcon fontSize={"sm"} /></Text>
              </Tooltip>

            </Grid> : <Grid gridTemplateColumns={'64px 1fr'} alignItems={'center'} columnGap={4}>
              <Button size="xxs" colorScheme={getModuleColor(colorMap, `${miscState.timetableModifyingMode.moduleCode}: ${miscState.timetableModifyingMode.lessonType}`)}></Button>
              <Text>Classes you've selected for {miscState.timetableModifyingMode.moduleCode}: {miscState.timetableModifyingMode.lessonType}</Text>
              <Button size="xxs" colorScheme={getModuleColor(colorMap, `${miscState.timetableModifyingMode.moduleCode}: ${miscState.timetableModifyingMode.lessonType}`)} variant={"outline"}></Button>

              <Text>Other classes you can select (click to select)</Text>
              <Box style={{
                width: "64px",
                height: "1rem",
                backgroundImage: STATIC_STRIPED_BG_COLOR,
              }}></Box>
              <Text>Classes not relating to {miscState.timetableModifyingMode.moduleCode}: {miscState.timetableModifyingMode.lessonType}</Text>

            </Grid>}
          </>
          }

          {isBiggerThanXl &&
            <Button onClick={() => { dispatch(miscActions.setDualMode(!dualMode)); dispatch(miscActions.setTimetableModifyingMode(null)) }} colorScheme="teal" size="sm">
              {dualMode ? "Switch to single view" : "Switch to dual view"}
              {!dualMode ? <Tag ml={3} size={"sm"} style={{
                background: "linear-gradient(135deg, #ffd6e7 0%, #ffe7c7 18%, #fff6bf 36%, #d9ffd6 54%, #d6f0ff 72%, #ead6ff 90%, #ffd6e7 100%)",
                color: "#111"
              }}>NEW</Tag> : null}
            </Button>}
        </Flex>
        <LiveTimetable />

      </Box>
    </SimpleGrid>
  </FullPage>);
};

export default Order;
