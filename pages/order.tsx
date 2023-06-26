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
} from "@chakra-ui/react";
import { AnyARecord } from "dns";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactSelect, { InputActionMeta, MultiValue } from "react-select";
import { AsyncSelect, Select } from "chakra-react-select";
import ModuleSortContainer from "../components/Sortables/ModuleSort/ModuleSortContainer";
import ClassSortContainer from "../components/Sortables/ClassSort/ClassSortContainer";
import { sendPOST } from "../lib/fetcher";
import { ModuleCondensed } from "../types/modules";
import { RootState } from "../types/types";
import { ModulesResponseData } from "./api/modules";
import { classesActions } from "../store/classesReducer";

import { Option } from "../types/types";
import ResultContainer from "../components/Sorted/ResultContainer";
import NextLink from "next/link";
import { useRouter } from "next/router";
import Explanation from "../components/Description/Explanation";
import { ImportResponseData } from "./api/import";
import { generateLink, tutregToNUSMods } from "../lib/functions";

import { GrSync } from "react-icons/gr";
import { IconContext } from "react-icons";
import { miscActions } from "../store/misc";

const ay = process.env.NEXT_PUBLIC_AY;
const Order: NextPage = () => {
    const toast = useToast();
    const [link, setLink] = useState("");
    const isError =
        !link.startsWith("https://nusmods.com/timetable/sem") && link !== "";

    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const result: ImportResponseData = await sendPOST("/api/import", {
            url: link,
        });

        const data = result.data;

        if (!data)
            return toast({
                title: "Error importing classes!",
                description: result.error,
                status: "error",
                duration: 5000,
                isClosable: true,
            });

        toast({
            title: "Classes imported",
            status: "success",
            duration: 5000,
            isClosable: true,
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
                    console.log({ data });
                })
                .catch((err) => console.log(err));

            // console.log(router.query)

            // TODO: Continue work on importing URLs
        }
    }, [router.query]);

    const [value, setValue] = useState("");
    const [selectedModules, setSelectedModules] = useState<Option[]>([]);

    const handleInputChange = (
        newValue: string,
        { action }: InputActionMeta
    ) => {
        setValue(newValue);
        return newValue;
    };

    const handleSelectChange = (newValue: Option[]) => {
        setSelectedModules(newValue);
        setTimeout(() => {});
        setValue(value);
    };

    const data = useSelector((state: RootState) => state.classesInfo);

    // Workaround: Chakra Collapse does not show when showCollapse is initially true.
    // Ref: https://github.com/chakra-ui/chakra-ui/issues/2534
    const [hasNoModulesSelected, setHasNoModulesSelected] = useState(false);
    useEffect(
        () => setHasNoModulesSelected(!data.moduleOrder.length),
        [data.moduleOrder.length]
    );

    const [hasNoClassesSelected, setHasNoClassesSelected] = useState(false);
    useEffect(
        () =>
            setHasNoClassesSelected(!Object.keys(data.selectedClasses).length),
        [data.selectedClasses]
    );

    // fetch the list of modules from nusmods
    const [moduleList, setModuleList] = useState<ModuleCondensed[]>();

    useEffect(() => {
        if (!ay) console.log("ERROR: no ay");
        fetch(`https://api.nusmods.com/v2/${ay || "2022-2023"}/moduleList.json`)
            .then((res) => res.json())
            .then((data) => {
                setModuleList(data);
            });
    }, []);

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
                    return console.log("error");

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

        dispatch(classesActions.addModules(modules));

        // when user adds modules, send request to retrieve the classInfo for that
        const response: ModulesResponseData = await sendPOST("/api/modules", {
            modules: modules.map((module) => ({
                moduleCode: module.split(":")[0],
            })),
        });

        if (!response.success || !response.data)
            return alert("Unexpected error");
        dispatch(classesActions.addAvailableClasses(response.data));

        setSelectedModules([]);
    };

    const removeAll = () => {
        setActiveStep(0);
        dispatch(classesActions.removeAll());
    };

    const [showAdd, setShowAdd] = useBoolean();

    const [isLargerThan500] = useMediaQuery(["min-width: 500px"]);

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

    const { hasCopied, onCopy } = useClipboard(timetableLink);

    // const { nextStep, prevStep, setStep, reset, activeStep } = useSteps({
    //     initialStep: 0,
    // });

    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: 3,
    });

    const clickedStepHandler = (step: number) => {
        if (step === 0) {
            setActiveStep(0);
        }
        if (step === 1 && !hasNoModulesSelected) {
            setActiveStep(1);
        }
        if (step === 2 && !hasNoClassesSelected) {
            setActiveStep(2);
        }
    };

    // notify on acad year change
    const misc = useSelector((state: RootState) => state.misc);
    const notifyAcadYearSemChanged = misc.notifyAcadYearSemChanged || false;
    return (
        <>
            <Box mb={4}>
                <Collapse in={notifyAcadYearSemChanged}>
                    <Alert
                        status="success"
                        variant="subtle"
                        // flexDirection="column"
                        // alignItems="center"
                        // height="200px"
                        justifyContent={"space-between"}
                    >
                        <Stack>
                            <Flex alignItems={"center"}>
                                <AlertIcon boxSize="40px" mr={0} />
                                <AlertTitle ml={3} fontSize="lg">
                                    tutreg.com has been updated to AY2023/2024!
                                </AlertTitle>
                            </Flex>
                            <AlertDescription maxWidth="sm">
                                You may need to remove and re-add your courses.
                                All data will be up to date with NUSMods.
                            </AlertDescription>
                        </Stack>
                        <CloseButton
                            alignSelf="flex-start"
                            position="relative"
                            right={-1}
                            top={-1}
                            onClick={() =>
                                dispatch(
                                    miscActions.setAcadYearNotificationDismissed()
                                )
                            }
                        />
                    </Alert>
                </Collapse>
            </Box>
            <Stack spacing={5}>
                <Heading size="lg" textAlign="center">
                    {" "}
                    To get started, import your NUSMods Timetable 📅{" "}
                </Heading>
                <Center textAlign="center">
                    <Stack spacing={1} alignItems="center">
                        <Text>
                            {" "}
                            You can rank your courses according to the priority
                            in the <Tag> Rank Courses </Tag> step.
                        </Text>
                        <Text>
                            {" "}
                            Simply drag and drop the courses in the order that
                            you want.
                        </Text>
                        <Text>
                            {" "}
                            Then, add and rank the other classes that you want
                            in the <Tag>Rank Classes</Tag> step, and see the
                            results in <Tag>Computed Ranking</Tag>.
                        </Text>
                    </Stack>
                </Center>
                <form onSubmit={handleSubmit}>
                    <Flex>
                        <FormControl isInvalid={isError}>
                            <Flex>
                                <Box flexGrow={1} mr={3}>
                                    <Input
                                        placeholder="https://nusmods.com/timetable/sem-1/share?..."
                                        value={link}
                                        onChange={(e) =>
                                            setLink(e.target.value)
                                        }
                                    />
                                    <FormHelperText>
                                        Paste the link you get when clicking{" "}
                                        <Button
                                            leftIcon={
                                                <IconContext.Provider
                                                    value={{ color: "orange" }}
                                                >
                                                    <GrSync />
                                                </IconContext.Provider>
                                            }
                                            size="xs"
                                            colorScheme={"orange"}
                                            variant="outline"
                                        >
                                            {" "}
                                            Share/Sync{" "}
                                        </Button>{" "}
                                        in{" "}
                                        <Link
                                            href="https://nusmods.com"
                                            isExternal
                                        >
                                            NUSMods
                                        </Link>{" "}
                                        above.
                                    </FormHelperText>

                                    {isError && (
                                        <FormErrorMessage>
                                            Invalid share link!
                                        </FormErrorMessage>
                                    )}
                                </Box>
                                <Tooltip
                                    hasArrow
                                    label="Importing a new timetable will clear your previously selected courses, if any!"
                                    textAlign="center"
                                >
                                    <Button
                                        type="submit"
                                        colorScheme="blue"
                                        isDisabled={isSubmitting || !link}
                                    >
                                        {" "}
                                        {isSubmitting
                                            ? "Importing..."
                                            : "Import"}{" "}
                                    </Button>
                                </Tooltip>
                            </Flex>
                        </FormControl>
                    </Flex>
                </form>

                <Text textAlign="center">or, add courses manually</Text>
                <form onSubmit={(e) => e.preventDefault()}>
                    <Flex>
                        <Box flex={1} mr={3}>
                            <FormControl>
                                <AsyncSelect
                                    instanceId={`${ay}-select`}
                                    closeMenuOnSelect={false}
                                    placeholder="Search..."
                                    value={selectedModules}
                                    isMulti
                                    // cacheOptions
                                    loadOptions={loadOptions}
                                    // inputValue={value}
                                    onInputChange={handleInputChange}
                                    onChange={(newValue: any) =>
                                        handleSelectChange(newValue)
                                    }
                                />
                                <FormHelperText>
                                    Search for a course (min. 3 chars)
                                </FormHelperText>
                                <FormHelperText>
                                    Courses unavailable for bidding in tutorial
                                    rounds are not shown.
                                </FormHelperText>
                            </FormControl>
                        </Box>
                        <Button
                            onClick={() => addModules()}
                            type="submit"
                            colorScheme="blue"
                        >
                            {" "}
                            Add{" "}
                        </Button>
                    </Flex>
                </form>
                {/* <Collapse in={showCollapse}> */}
                <Stack spacing={5}>
                    <Center>
                        <HStack>
                            <Button
                                size="sm"
                                colorScheme="red"
                                onClick={() => removeAll()}
                            >
                                {" "}
                                Remove all mods{" "}
                            </Button>
                            <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={setShowAdd.toggle}
                            >
                                {" "}
                                {showAdd ? `Hide` : `Show`} details{" "}
                            </Button>
                        </HStack>
                    </Center>

                    <Stepper
                        index={activeStep}
                        orientation={useBreakpointValue({
                            base: "vertical",
                            md: "horizontal",
                        })}
                    >
                        <Step onClick={() => clickedStepHandler(0)}>
                            <HStack cursor={"pointer"}>
                                <StepIndicator>
                                    <StepStatus
                                        complete={<StepIcon />}
                                        incomplete={<StepNumber />}
                                        active={<StepNumber />}
                                    />
                                </StepIndicator>

                                <Box flexShrink="0">
                                    <StepTitle> Rank courses </StepTitle>
                                    <StepDescription>
                                        Rank your courses, highest priority
                                        first
                                    </StepDescription>
                                </Box>
                            </HStack>
                            <StepSeparator />
                        </Step>
                        <Step onClick={() => clickedStepHandler(1)}>
                            <HStack
                                cursor={
                                    hasNoModulesSelected
                                        ? "not-allowed"
                                        : "pointer"
                                }
                            >
                                <StepIndicator>
                                    <StepStatus
                                        complete={<StepIcon />}
                                        incomplete={<StepNumber />}
                                        active={<StepNumber />}
                                    />
                                </StepIndicator>

                                <Box flexShrink="0">
                                    <StepTitle> Rank classes </StepTitle>
                                    <StepDescription>
                                        Rank your classes per course
                                    </StepDescription>
                                </Box>
                            </HStack>
                            <StepSeparator />
                        </Step>
                        <Step onClick={() => clickedStepHandler(2)}>
                            <HStack
                                cursor={
                                    hasNoClassesSelected
                                        ? "not-allowed"
                                        : "pointer"
                                }
                            >
                                <StepIndicator>
                                    <StepStatus
                                        complete={<StepIcon />}
                                        incomplete={<StepNumber />}
                                        active={<StepNumber />}
                                    />
                                </StepIndicator>

                                <Box flexShrink="0">
                                    <StepTitle> Computed ranking </StepTitle>
                                    <StepDescription>
                                        Export to browser extension
                                    </StepDescription>
                                </Box>
                            </HStack>
                            <StepSeparator />
                        </Step>
                    </Stepper>
                    <Flex width="100%" justify="flex-end">
                        <Button
                            isDisabled={activeStep === 0}
                            mr={4}
                            onClick={() => setActiveStep(activeStep - 1)}
                            size="sm"
                            variant="ghost"
                        >
                            Prev step
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setActiveStep(activeStep + 1)}
                            isDisabled={
                                activeStep === 3 - 1 ||
                                (activeStep === 0 && hasNoModulesSelected) ||
                                (activeStep === 1 && hasNoClassesSelected)
                            }
                        >
                            Next step
                        </Button>
                    </Flex>
                    <Box display={activeStep === 0 ? "unset" : "none"}>
                        {" "}
                        <ModuleSortContainer showAdd={showAdd} />
                    </Box>
                    <Box display={activeStep === 1 ? "unset" : "none"}>
                        {" "}
                        <ClassSortContainer showAdd={showAdd} />
                    </Box>
                    <Box display={activeStep === 2 ? "unset" : "none"}>
                        <ResultContainer showAdd={showAdd} />
                    </Box>
                </Stack>
                {/* </Collapse> */}
                <Divider />

                <Explanation />
            </Stack>
        </>
    );
};

export default Order;
