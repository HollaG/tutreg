import {
    Box,
    Button,
    Center,
    Checkbox,
    CheckboxGroup,
    Flex,
    FormControl,
    FormHelperText,
    Input,
    InputGroup,
    InputLeftAddon,
    InputRightElement,
    SimpleGrid,
    Stack,
    Step,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    Stepper,
    StepSeparator,
    StepStatus,
    StepTitle,
    Tag,
    Text,
    useBoolean,
    useCheckbox,
    useColorModeValue,
    useSteps,
    useToast,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
// import { Step, Steps, useSteps } from "chakra-ui-steps";
import type { NextPage } from "next";
import NextLink from "next/link";
import {
    Dispatch,
    FormEvent,
    ReactNode,
    SetStateAction,
    useEffect,
    useState,
} from "react";
import ModuleSelect from "../../components/Select/ModuleSelect";
import { sendPOST } from "../../lib/fetcher";
import { encodeLessonTypeToShorthand } from "../../lib/functions";
import { ClassDB } from "../../types/db";
import { GetClassesResponse, GroupedByClassNo } from "../api/swap/getClasses";

import { ClassOverview, Option, RootState } from "../../types/types";
import Entry from "../../components/Sortables/Entry";
import OrderSwapPriorityList from "../../components/Swap/OrderSwapPriorityList";
import { ArrowDownIcon, DeleteIcon } from "@chakra-ui/icons";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import SwapEntry from "../../components/Swap/SwapEntry";
import { miscActions } from "../../store/misc";
import { LessonType } from "../../types/modules";
import Timetable from "../../components/ReusableTimetable/Timetable";
import React from "react";

import { classesActions } from "../../store/classesReducer";
import { TimetableLessonEntry } from "../../types/timetable";
import { Steps } from "chakra-ui-steps";

const steps = [
    {
        label: "Select your current class",
    },
    {
        label: "Select your desired classes",
    },
    {
        label: "Review",
    },
];

const generateLessonText = (classes: ClassDB[]) => {
    return `${encodeLessonTypeToShorthand(classes[0].lessonType)} [${
        classes[0].classNo
    }]\n${classes
        .map((class_) => `${class_.day} ${class_.startTime}-${class_.endTime}`)
        .join("\n")}`;
};

const generateOptionsForModule = (classes: ClassDB[]) => {
    const lessonText = generateLessonText(classes);

    return {
        value: classes[0].classNo,
        label: lessonText,
    };
};
const Step1: React.FC<{
    nextStep: () => void;
    prevStep: () => void;

    setStep: (step: number) => void;
    activeStep: number;

    currentClassInfo: {
        moduleCode: string;
        lessonType: LessonType;
        classNo: string;
    };
    setCurrentClassInfo: Dispatch<
        SetStateAction<{
            moduleCode: string;
            lessonType: LessonType;
            classNo: string;
        }>
    >;

    classes: GroupedByClassNo;
    setClasses: Dispatch<SetStateAction<GroupedByClassNo>>;

    values: (string | number)[];
    setValues: Dispatch<SetStateAction<(string | number)[]>>;
}> = ({
    nextStep,
    prevStep,
    setStep,

    activeStep,
    setCurrentClassInfo,
    classes,
    setClasses,
    currentClassInfo,
    values,
    setValues,
}) => {
    useEffect(() => {
        setCurrentClassInfo({
            moduleCode: "",
            lessonType: "Lecture",
            classNo: "",
        });
    }, []);
    useEffect(() => {
        setValues([]);
    }, [currentClassInfo.moduleCode]);
    const [moduleCodeLessonTypeValue, setModuleCodeLessonTypeValue] =
        useState("");

    const [availableClassList, setAvailableClassList] = useState<
        ClassOverview[]
    >([]);
    const selectHandler = async (option: Option[]) => {
        console.log(option, "-----------");

        // Send request to find the classes available for this moduleCodeLessonType
        const moduleCodeLessonType = option[0].value;
        const moduleCode = moduleCodeLessonType.split(": ")[0];
        const lessonType = moduleCodeLessonType.split(": ")[1] as LessonType;

        // todo change to fetch
        const response: GetClassesResponse = await sendPOST(
            "/api/swap/getClasses",
            {
                moduleCode,
                lessonType,
            }
        );

        if (response.success && response.data) {
            console.log({ response });
            setClasses(response.data);
            setCurrentClassInfo({
                moduleCode,
                lessonType,
                classNo: "",
            });

            const lst: ClassOverview[] = Object.keys(response.data).map(
                (classNo) => {
                    // @ts-ignore
                    const classes = response.data[classNo];
                    return {
                        classNo,
                        moduleCode: classes[0].moduleCode,
                        lessonType: classes[0].lessonType,
                        moduleName: classes[0].moduleName,
                        size: classes[0].size,
                        classes,
                    };
                }
            );
            setAvailableClassList(lst);
        }
    };

    const selectCurrentClassHandler = (option: Option) => {
        console.log(option, "selectcurclasshandler");
        setCurrentClassInfo((prevState) => ({
            ...prevState,
            classNo: option.value,
        }));
    };

    const selectCurrentClassHandler2 = (
        class_: TimetableLessonEntry,
        selected: boolean
    ) => {
        if (selected) {
            setCurrentClassInfo((prevState) => ({
                ...prevState,
                classNo: class_.classNo,
            }));
        } else {
            setCurrentClassInfo((prevState) => ({
                ...prevState,
                classNo: "",
            }));
        }
    };

    const getProperty = (class_: TimetableLessonEntry) => {
        if (currentClassInfo.classNo === class_.classNo) return "selected";
        else return "";
    };

    const currentlySelectedClass = useSelector(
        (state: RootState) => state.classesInfo.changedClasses
    );
    return (
        <Stack spacing={3} width="100%">
            <Center>
                <Button
                    colorScheme="blue"
                    onClick={() => nextStep()}
                    disabled={
                        !(
                            currentClassInfo.moduleCode &&
                            currentClassInfo.classNo
                        )
                    }
                >
                    Next
                </Button>
            </Center>
            <ModuleSelect
                isMulti={false}
                onSelect={selectHandler}
                moduleCodeLessonTypeValue={moduleCodeLessonTypeValue}
                setModuleCodeLessonTypeValue={setModuleCodeLessonTypeValue}
            />
            {/* <FormControl>
                <Select
                    options={Object.keys(classes)
                        .sort()
                        .map((classNo) =>
                            generateOptionsForModule(classes[classNo])
                        )}
                    onChange={(option) =>
                        selectCurrentClassHandler({
                            value: option?.value || "",
                            label: option?.label || "",
                        })
                    }
                    value={{
                        value: currentClassInfo.classNo,
                        label: currentClassInfo.classNo,
                    }}
                    classNamePrefix="lp-copy-sel"
                />
                <FormHelperText>
                    Select your class that you don&apos;t want
                </FormHelperText>
            </FormControl> */}

            <Timetable
                classesToDraw={availableClassList}
                onSelected={selectCurrentClassHandler2}
                property={getProperty}
            />
            <Center>
                <Button
                    colorScheme="blue"
                    onClick={() => nextStep()}
                    disabled={
                        !(
                            currentClassInfo.moduleCode &&
                            (currentClassInfo.classNo ||
                                currentlySelectedClass.length !== 0)
                        )
                    }
                >
                    Next
                </Button>
            </Center>
        </Stack>
    );
};
const MemoStep1 = React.memo(Step1);

const Step2: React.FC<{
    nextStep: () => void;
    prevStep: () => void;

    setStep: (step: number) => void;
    activeStep: number;
    classes: GroupedByClassNo;
    setClasses: Dispatch<SetStateAction<GroupedByClassNo>>;

    currentClassInfo: {
        moduleCode: string;
        lessonType: LessonType;
        classNo: string;
    };
    setCurrentClassInfo: Dispatch<
        SetStateAction<{
            moduleCode: string;
            lessonType: LessonType;
            classNo: string;
        }>
    >;
    values: (string | number)[];
    setValues: Dispatch<SetStateAction<(string | number)[]>>;
}> = ({
    nextStep,
    prevStep,
    setStep,

    activeStep,
    setCurrentClassInfo,
    classes,
    setClasses,
    currentClassInfo,

    values,
    setValues,
}) => {
    const lst: ClassOverview[] = Object.keys(classes).map((classNo) => {
        const classes_ = classes[classNo];
        return {
            classNo,
            moduleCode: classes_[0].moduleCode,
            lessonType: classes_[0].lessonType,
            moduleName: classes_[0].moduleName,
            size: classes_[0].size,
            classes: classes_,
        };
    });

    const onSelected = (class_: TimetableLessonEntry, selected: boolean) => {
        if (selected) {
            setValues((prevState) => [...prevState, class_.classNo]);
        } else {
            setValues((prevState) =>
                prevState.filter((v) => v !== class_.classNo)
            );
        }
    };

    const getProperty = (class_: TimetableLessonEntry) => {
        if (values.includes(class_.classNo)) return "selected";
        else if (class_.classNo === currentClassInfo.classNo) return "readonly";
        else return "";
    };
    console.log({ values });
    return (
        <Stack spacing={3} width="100%">
            <Center>
                <Button onClick={() => prevStep()}> Back </Button>
                <Button
                    colorScheme="blue"
                    onClick={() => nextStep()}
                    ml={3}
                    disabled={!values.length}
                >
                    {" "}
                    Next{" "}
                </Button>
            </Center>
            {/* <SwapEntry
                classNo={currentClassInfo.classNo}
                classes={classes[currentClassInfo.classNo]}
                title={`${
                    currentClassInfo.moduleCode
                } ${encodeLessonTypeToShorthand(
                    currentClassInfo.lessonType
                )} [${currentClassInfo.classNo}]`}
            />

            <Center>
                <ArrowDownIcon w={12} h={12} />
            </Center>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }}>
                <CheckboxGroup
                    value={values}
                    onChange={(value) => setValues(value)}
                >
                    {Object.keys(classes)
                        .sort()
                        .filter(
                            (classNo) => classNo !== currentClassInfo.classNo
                        )
                        .map((classNo, index) => (
                            <Entry key={index} whiteSpace="pre-line">
                                <Checkbox width="100%" value={classNo}>
                                    <Box>
                                        {generateLessonText(classes[classNo])}
                                    </Box>
                                    {classes[classNo][0].venue}
                                </Checkbox>
                            </Entry>
                        ))}
                </CheckboxGroup>
            </SimpleGrid> */}
            <Flex justifyContent={"right"}>
                <Stack direction={{ base: "row", sm: "row" }}>
                    <Tag colorScheme="red">Class you have</Tag>
                    <Tag colorScheme="teal">Classes you want</Tag>
                </Stack>
            </Flex>
            <Timetable
                classesToDraw={lst}
                onSelected={onSelected}
                property={getProperty}
            />
            <Center>
                <Button onClick={() => prevStep()}> Back </Button>
                <Button
                    colorScheme="blue"
                    onClick={() => nextStep()}
                    ml={3}
                    disabled={!values.length}
                >
                    {" "}
                    Next{" "}
                </Button>
            </Center>
        </Stack>
    );
};

const Step3: React.FC<{
    nextStep: () => void;
    prevStep: () => void;

    setStep: (step: number) => void;
    activeStep: number;
    classes: GroupedByClassNo;

    currentClassInfo: {
        moduleCode: string;
        lessonType: LessonType;
        classNo: string;
    };

    setDesiredClasses: Dispatch<SetStateAction<(string | number)[]>>;
    desiredClasses: (string | number)[];

    // isEqualRank: boolean;
    // setIsEqualRank: {
    //     on: () => void;
    //     off: () => void;
    //     toggle: () => void;
    // };
    submitHandler: () => void;
    comments: string;
    setComments: Dispatch<SetStateAction<string>>;
}> = ({
    classes,
    prevStep,
    setDesiredClasses,
    desiredClasses,
    submitHandler,
    currentClassInfo,
    // isEqualRank,
    // setIsEqualRank,
    comments,
    setComments,
}) => {
    const deleteIconColor = useColorModeValue("red.500", "red.500");

    const deleteHandler = (desiredClassNo: string | number) => {
        setDesiredClasses((prevState) =>
            prevState.filter((classNo) => classNo !== desiredClassNo)
        );
    };
    useEffect(() => {
        if (!desiredClasses.length) prevStep();
    }, [desiredClasses, prevStep]);

    const lst: ClassOverview[] = Object.keys(classes)
        .filter(
            (classNo) =>
                desiredClasses.includes(classNo) ||
                currentClassInfo.classNo === classNo
        )
        .map((classNo) => {
            const classes_ = classes[classNo];
            return {
                classNo,
                moduleCode: classes_[0].moduleCode,
                lessonType: classes_[0].lessonType,
                moduleName: classes_[0].moduleName,
                size: classes_[0].size,
                classes: classes_,
            };
        });

    const getProperty = (class_: TimetableLessonEntry) => {
        if (desiredClasses.includes(class_.classNo)) return "selected";
        else if (class_.classNo === currentClassInfo.classNo) return "readonly";
        else return "";
    };

    return (
        <Stack spacing={3} width="100%">
            {/* <Box textAlign="right">
                <Button colorScheme="blue" size="sm" onClick={setIsEqualRank.toggle}>
                    {isEqualRank ? 'Enable preference ranking' : 'Disable preference ranking'}
                </Button>
            </Box> */}
            <Center>
                <Button onClick={() => prevStep()}> Back </Button>
                <Button
                    colorScheme="blue"
                    onClick={() => submitHandler()}
                    ml={3}
                >
                    {" "}
                    Submit{" "}
                </Button>
            </Center>

            {/* <SwapEntry
                classNo={currentClassInfo.classNo}
                classes={classes[currentClassInfo.classNo]}
                title={`${
                    currentClassInfo.moduleCode
                } ${encodeLessonTypeToShorthand(
                    currentClassInfo.lessonType
                )} [${currentClassInfo.classNo}]`}
            />

            <Center>
                <ArrowDownIcon w={12} h={12} />
            </Center>

            {desiredClasses.map((desiredClassNo, index) => (
                <SwapEntry
                    key={index}
                    classNo={currentClassInfo.classNo}
                    classes={classes[desiredClassNo]}
                    title={`${(index || 0) + 1}. ${encodeLessonTypeToShorthand(
                        currentClassInfo.lessonType
                    )} [${desiredClassNo}]`}
                    canDelete
                    deleteHandler={() => deleteHandler(desiredClassNo)}
                />
            ))} */}
            <Flex justifyContent={"right"}>
                <Stack direction={{ base: "row", sm: "row" }}>
                    <Tag colorScheme="red">Class you have</Tag>
                    <Tag colorScheme="teal">Classes you want</Tag>
                </Stack>
            </Flex>
            <Timetable
                classesToDraw={lst}
                onSelected={(_, __) => null}
                property={getProperty}
            />
            <FormControl>
                <Stack>
                    <InputGroup>
                        <InputLeftAddon>Comments (opt.)</InputLeftAddon>
                        <Input
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                        />
                    </InputGroup>
                    {/* <Checkbox defaultChecked>
                        Show Telegram username publicly
                    </Checkbox>
                    <FormHelperText ml={2}>
                        If unchecked, you will be notified when someone requests
                        a swap through the website's Telegram bot.
                    </FormHelperText> */}
                </Stack>
            </FormControl>
            <Center>
                <Button onClick={() => prevStep()}> Back </Button>
                <Button
                    colorScheme="blue"
                    onClick={() => submitHandler()}
                    ml={3}
                >
                    {" "}
                    Submit{" "}
                </Button>
            </Center>
        </Stack>
    );
};
const CreateSwap: NextPage = () => {
    const stepsControl = useSteps({
        count: 3,
        index: 0,
    });
    const {
        goToNext: nextStep,
        goToPrevious: prevStep,
        setActiveStep: setStep,
        activeStep,
    } = stepsControl;

    const [currentClassInfo, setCurrentClassInfo] = useState<{
        moduleCode: string;
        lessonType: LessonType;
        classNo: string;
    }>({
        moduleCode: "",
        lessonType: "Lecture",
        classNo: "",
    });

    // All the available classes for user-selected moduleCode and lessonType
    const [classes, setClasses] = useState<GroupedByClassNo>({});

    // Handle checkboxes for step 2
    const [desiredClasses, setDesiredClasses] = useState<(string | number)[]>(
        []
    );
    console.log({ desiredClasses });
    // const [isEqualRank, setIsEqualRank] = useBoolean(false);

    const user = useSelector((state: RootState) => state.user);
    const router = useRouter();
    const dispatch = useDispatch();
    const toast = useToast();

    const [comments, setComments] = useState("");

    const submitHandler = async () => {
        console.log(desiredClasses);
        console.log(currentClassInfo);

        const response = await sendPOST("/api/swap/create", {
            desiredClasses,
            currentClassInfo,
            user,
            comments,
        });
        if (!response.success || !response.data) {
            toast({
                title: "Error",
                description: response.error,
                status: "error",
            });
        } else {
            router.push(`/swap/${response.data}`);

            toast({
                title: "Swap created",
                status: "success",
                description:
                    "Swap created! If you have enabled notifications, you will be notified on Telegram if someone requests to swap with you.\nYou can toggle this function by clicking the notification bell in the top right corner of the page.",
                duration: 10000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        if (!user) {
            // router.push("/swap");
            dispatch(miscActions.setNeedsLogIn(true));
        }
    }, [user, dispatch]);

    return (
        user && (
            <Stack spacing={5} alignItems="center" h="100%">
                <Stepper index={activeStep} w="100%">
                    {steps.map((step, index) => (
                        <Step key={index}>
                            <StepIndicator>
                                <StepStatus
                                    complete={<StepIcon />}
                                    incomplete={<StepNumber />}
                                    active={<StepNumber />}
                                />
                            </StepIndicator>

                            <Box flexShrink="0">
                                <StepTitle>{step.label}</StepTitle>
                                {/* <StepDescription>
                                    {step.description}
                                </StepDescription> */}
                            </Box>

                            <StepSeparator />
                        </Step>
                    ))}
                </Stepper>

                {/* <Steps activeStep={activeStep}>
                    {steps.map(({ label }) => (
                        <Step label={label} key={label}></Step>
                    ))}
                </Steps> */}
                {activeStep === 0 && (
                    <MemoStep1
                        activeStep={activeStep}
                        nextStep={nextStep}
                        prevStep={prevStep}
                        setStep={setStep}
                        setCurrentClassInfo={setCurrentClassInfo}
                        classes={classes}
                        setClasses={setClasses}
                        currentClassInfo={currentClassInfo}
                        values={desiredClasses}
                        setValues={setDesiredClasses}
                    />
                )}
                {activeStep === 1 && (
                    <Step2
                        activeStep={activeStep}
                        nextStep={nextStep}
                        prevStep={prevStep}
                        setStep={setStep}
                        currentClassInfo={currentClassInfo}
                        setCurrentClassInfo={setCurrentClassInfo}
                        classes={classes}
                        setClasses={setClasses}
                        values={desiredClasses}
                        setValues={setDesiredClasses}
                    />
                )}
                {activeStep === 2 && (
                    <Step3
                        activeStep={activeStep}
                        nextStep={nextStep}
                        prevStep={prevStep}
                        setStep={setStep}
                        currentClassInfo={currentClassInfo}
                        classes={classes}
                        desiredClasses={desiredClasses}
                        setDesiredClasses={setDesiredClasses}
                        // isEqualRank={isEqualRank}
                        // setIsEqualRank={setIsEqualRank}
                        submitHandler={submitHandler}
                        comments={comments}
                        setComments={setComments}
                    />
                )}
            </Stack>
        )
    );
};

export default CreateSwap;
