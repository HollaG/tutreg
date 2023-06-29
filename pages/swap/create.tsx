import {
    Box,
    Button,
    Center,
    Checkbox,
    CheckboxGroup,
    Flex,
    FormControl,
    FormHelperText,
    Heading,
    Icon,
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
    useMemo,
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
import { TbArrowDown, TbArrowNarrowRight } from "react-icons/tb";
import SwapCodeIndicator from "../../components/Swap/SwapModuleCodeIndicator";

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

const CURRENT_CLASS_COLOR = "orange.500";
const DESIRED_CLASS_COLOR = "teal.500";

/**
 * Converts the result of the API call into an array to be
 * displayed in the timetable, with each element being an objecty
 * representing the class, containing an array of the possible classes
 * per moduleCode/LessonType/ClassNo.
 *
 * (Some classNos might have more than 1 class / lesson)
 *
 * @param param0
 * @returns
 */
export const convertToTimetableList = (data: GroupedByClassNo) => {
    return Object.keys(data)
        .filter((classNo) => data[classNo].length !== 0)
        .map((classNo) => {
            const classes = data[classNo];
            return {
                classNo,
                moduleCode: classes[0].moduleCode,
                lessonType: classes[0].lessonType,
                moduleName: classes[0].moduleName,
                size: classes[0].size,
                classes,
            };
        });
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

    setDesiredClasses: Dispatch<SetStateAction<FullInfo[]>>;

    setDesiredModulesInfo: Dispatch<SetStateAction<HalfInfo[]>>;

    possibleClasses: ClassOverview[];
    setPossibleClasses: Dispatch<SetStateAction<ClassOverview[]>>;
    setPossibleStep2Classes: Dispatch<SetStateAction<ClassOverview[]>>;
}> = ({
    nextStep,
    prevStep,
    setStep,

    activeStep,
    setCurrentClassInfo,

    currentClassInfo,

    setDesiredClasses: setDesiredClassNos,

    setDesiredModulesInfo: setDesiredModulesInfo,

    possibleClasses,
    setPossibleClasses,
    setPossibleStep2Classes,
}) => {
    // useEffect(() => {
    //     setCurrentClassInfo({
    //         moduleCode: "",
    //         lessonType: "Lecture",
    //         classNo: "",
    //     });
    // }, []);

    // const [moduleCodeLessonTypeValue, setModuleCodeLessonTypeValue] =
    //     useState("");

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
            // update the main component

            // update the current selected module and lessontype and
            // remove the current selected classNo
            setCurrentClassInfo({
                moduleCode,
                lessonType,
                classNo: "",
            });

            // by default: set the desiredModule to be the same
            setDesiredModulesInfo([
                {
                    moduleCode,
                    lessonType,
                },
            ]);

            // set what is displayed in the timetable
            const lst: ClassOverview[] = convertToTimetableList(response.data);
            setPossibleClasses(lst);
            setPossibleStep2Classes(lst);

            // reset the desiredClasses when module changes
            setDesiredClassNos([]);
        }
    };

    const selectCurrentClassHandler = (
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
                hideNonBiddable={false}
            />
            <SwapCodeIndicator currentClassInfo={currentClassInfo} />
            <Timetable
                classesToDraw={possibleClasses}
                onSelected={selectCurrentClassHandler}
                property={getProperty}
                selectedColor="orange"
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

const ModuleSelectStep2: React.FC<{
    nextStep: () => void;
    prevStep: () => void;

    setStep: (step: number) => void;
    activeStep: number;

    currentClassInfo: {
        moduleCode: string;
        lessonType: LessonType;
        classNo: string;
    };
    setCurrentClassInfo: Dispatch<SetStateAction<FullInfo>>;
    desiredClasses: FullInfo[];
    setDesiredClasses: Dispatch<SetStateAction<FullInfo[]>>;

    setDesiredModulesInfo: Dispatch<SetStateAction<HalfInfo[]>>;
    desiredModulesInfo: {
        moduleCode: string;
        lessonType: LessonType;
    }[];

    possibleClasses: ClassOverview[];
    setPossibleClasses: Dispatch<SetStateAction<ClassOverview[]>>;

    isInternalSwap: boolean;
}> = ({
    nextStep,
    prevStep,
    setStep,

    activeStep,
    setCurrentClassInfo,

    currentClassInfo,

    desiredClasses,
    setDesiredClasses,

    setDesiredModulesInfo,
    desiredModulesInfo,

    possibleClasses,
    setPossibleClasses,

    isInternalSwap,
}) => {
    // provide another select if the user wants to select a different module code lesson type
    const selectHandler = async (options: Option[]) => {
        console.log(options, "-----------");

        let possibleDesiredClasses: ClassOverview[] = [];
        let desiredModules: HalfInfo[] = [];
        for (const option of options) {
            // Send request to find the classes available for this moduleCodeLessonType
            const moduleCodeLessonType = option.value;
            const moduleCode = moduleCodeLessonType.split(": ")[0];
            const lessonType = moduleCodeLessonType.split(
                ": "
            )[1] as LessonType;

            // todo change to fetch
            const response: GetClassesResponse = await sendPOST(
                "/api/swap/getClasses",
                {
                    moduleCode,
                    lessonType,
                }
            );

            if (response.success && response.data) {
                // update the main component

                // update the desiredModuleInfo for the seelction
                desiredModules.push({
                    moduleCode,
                    lessonType,
                });

                // set what is displayed in the timetable
                const lst: ClassOverview[] = convertToTimetableList(
                    response.data
                );
                // setPossibleClasses(lst);
                possibleDesiredClasses.push(...lst);

                // reset the desiredClasses when module changes
            }
        }
        setPossibleClasses(possibleDesiredClasses);
        console.log("setting desired modulesinfo", desiredModules);
        setDesiredModulesInfo(desiredModules);

        // set desired classes to only classes that are IN desiredModulesInfo
        // (aka remove classes that are no longer selected)
        setDesiredClasses((prev) =>
            prev.filter((v) =>
                desiredModules.find(
                    (e) =>
                        e.moduleCode === v.moduleCode &&
                        e.lessonType === v.lessonType
                )
            )
        );
    };

    console.log({ desiredClasses });
    const onSelected = (class_: TimetableLessonEntry, selected: boolean) => {
        if (selected) {
            setDesiredClasses((prevState) => [
                ...prevState,
                {
                    moduleCode: class_.moduleCode,
                    lessonType: class_.lessonType,
                    classNo: class_.classNo,
                },
            ]);
        } else {
            // remove this specific class
            setDesiredClasses((prevState) =>
                prevState.filter(
                    (v) =>
                        !(
                            v.classNo === class_.classNo &&
                            v.moduleCode === class_.moduleCode &&
                            v.lessonType === class_.lessonType
                        )
                )
            );
        }
    };

    const getProperty = (class_: TimetableLessonEntry) => {
        if (
            desiredClasses.find(
                (e) =>
                    e.classNo === class_.classNo &&
                    e.lessonType === class_.lessonType &&
                    e.moduleCode === class_.moduleCode
            )
        )
            return "selected";
        else if (
            class_.classNo === currentClassInfo.classNo &&
            class_.moduleCode === currentClassInfo.moduleCode &&
            class_.lessonType === currentClassInfo.lessonType
        )
            // possiblility to have different modules entirely
            return "readonly";
        else return "";
    };

    // handle the expansion of the desired modules
    const [hoveredClass, setHoveredClass] = useState<null | FullInfo>(null);
    console.log({ hoveredClass });
    const getClassNames = (class_: TimetableLessonEntry) => {
        if (
            class_.classNo === hoveredClass?.classNo &&
            class_.moduleCode === hoveredClass.moduleCode &&
            class_.lessonType === hoveredClass.lessonType
        )
            return "pulse";
        else return "";
    };

    return (
        <Stack spacing={3} width="100%">
            <Center>
                <Button onClick={() => prevStep()}> Back </Button>
                <Button
                    colorScheme="blue"
                    onClick={() => nextStep()}
                    ml={3}
                    disabled={!setDesiredClasses.length}
                >
                    {" "}
                    Next{" "}
                </Button>
            </Center>

            <ModuleSelect
                isMulti={true}
                onSelect={selectHandler}
                hideNonBiddable={false}
            />

            <SwapCodeIndicator
                desiredModulesInfo={desiredModulesInfo}
                currentClassInfo={currentClassInfo}
                desiredClassesInfo={desiredClasses}
                onHover={setHoveredClass}
                drawnClasses={possibleClasses}
            />
            <Timetable
                classesToDraw={possibleClasses}
                onSelected={onSelected}
                property={getProperty}
                showLessonType={!isInternalSwap}
                showModuleCode={!isInternalSwap}
                getClassNames={getClassNames}
            />

            <Center>
                <Button onClick={() => prevStep()}> Back </Button>
                <Button
                    colorScheme="blue"
                    onClick={() => nextStep()}
                    ml={3}
                    disabled={!setDesiredClasses.length}
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

    currentClassInfo: FullInfo;

    desiredModulesInfo: HalfInfo[];

    displayedClasses: ClassOverview[];

    submitHandler: () => void;
    comments: string;
    setComments: Dispatch<SetStateAction<string>>;

    desiredClasses: FullInfo[];

    isInternalSwap: boolean;
}> = ({
    prevStep,

    submitHandler,
    currentClassInfo,
    // isEqualRank,
    // setIsEqualRank,
    comments,
    setComments,
    displayedClasses,
    desiredClasses,
    desiredModulesInfo,
    isInternalSwap,
}) => {
    const deleteIconColor = useColorModeValue("red.500", "red.500");

    // const deleteHandler = (desiredClassNo: string | number) => {
    //     setDesiredClasses((prevState) =>
    //         prevState.filter((classNo) => classNo !== desiredClassNo)
    //     );
    // };
    // useEffect(() => {
    //     if (!desiredClasses.length) prevStep();
    // }, [desiredClasses, prevStep]);

    const getProperty = (class_: TimetableLessonEntry) => {
        if (
            desiredClasses.find(
                (e) =>
                    e.classNo === class_.classNo &&
                    e.lessonType === class_.lessonType &&
                    e.moduleCode === class_.moduleCode
            )
        ) {
            return "selected";
        } else if (
            currentClassInfo.lessonType === class_.lessonType &&
            currentClassInfo.moduleCode === class_.moduleCode &&
            class_.classNo === currentClassInfo.classNo
        ) {
            return "readonly";
        } else return "";
    };

    // handle the expansion of the desired modules
    const [hoveredClass, setHoveredClass] = useState<null | FullInfo>(null);
    console.log({ hoveredClass });
    const getClassNames = (class_: TimetableLessonEntry) => {
        if (
            class_.classNo === hoveredClass?.classNo &&
            class_.moduleCode === hoveredClass.moduleCode &&
            class_.lessonType === hoveredClass.lessonType
        )
            return "pulse";
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

            <SwapCodeIndicator
                desiredModulesInfo={desiredModulesInfo}
                currentClassInfo={currentClassInfo}
                desiredClassesInfo={desiredClasses}
                onHover={setHoveredClass}
                drawnClasses={displayedClasses}
            />
            <Timetable
                classesToDraw={displayedClasses}
                onSelected={(_, __) => null}
                property={getProperty}
                showLessonType={!isInternalSwap}
                showModuleCode={!isInternalSwap}
                getClassNames={getClassNames}
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

export type HalfInfo = {
    moduleCode: string;
    lessonType: LessonType;
};
export type FullInfo = HalfInfo & {
    classNo: string;
};
const CreateSwap: NextPage = () => {
    // Stepper control
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

    // hooks
    const user = useSelector((state: RootState) => state.user);
    const router = useRouter();
    const dispatch = useDispatch();
    const toast = useToast();

    // Information on the user's class that they have
    const [currentClassInfo, setCurrentClassInfo] = useState<FullInfo>({
        moduleCode: "",
        lessonType: "Lecture",
        classNo: "",
    });

    // The module that the user wants to swap to
    // might be more than 1
    const [desiredModulesInfo, setDesiredModulesInfo] = useState<HalfInfo[]>([
        { moduleCode: "", lessonType: "Lecture" },
    ]);

    // The user's desired classes
    const [desiredClasses, setDesiredClasses] = useState<FullInfo[]>([
        {
            moduleCode: "",
            lessonType: "Lecture",
            classNo: "",
        },
    ]);

    // whether the user is swapping internally (within the same module and lesson type)
    const isInternalSwap =
        desiredModulesInfo[0].lessonType === currentClassInfo.lessonType &&
        desiredModulesInfo[0].moduleCode === currentClassInfo.moduleCode;

    // State handlers that hold the info of the possible classes for both step 1 and 2
    const [possibleStep1Classes, setPossibleStep1Classes] = useState<
        ClassOverview[]
    >([]);
    const [_possibleStep2Classes, setPossibleStep2Classes] = useState<
        ClassOverview[]
    >([]);

    // the possible step2 classes should include the class that is selected from step1.
    // imagine this scenario:
    // step 1 classes for MOD1, choose one
    // step 2 classes for MOD2 --> the timetable won't show the MOD1 classes
    // so we need always ensure that step 2 classes always include the step 1 class
    let possibleStep2Classes = _possibleStep2Classes;
    // if the list of desired modules doesn't include the current module...
    if (
        !desiredModulesInfo.find(
            (desiredModule) =>
                desiredModule.lessonType === currentClassInfo.lessonType &&
                desiredModule.moduleCode === currentClassInfo.moduleCode
        )
    ) {
        const currentClassTimetableEntry = possibleStep1Classes.find(
            (c) => c.classNo === currentClassInfo.classNo
        );
        if (currentClassTimetableEntry) {
            possibleStep2Classes = [
                currentClassTimetableEntry,
                ...possibleStep2Classes,
            ];
        }
    }

    // get the classes that are displayed, i.e. the unique set of classes including 1) selected class from step 1,
    // 2) selected classes from step 2
    const reviewClassesList: ClassOverview[] = [
        // note: the currentClass is ALREADY in possible step 2 classes!!! no need to find it again
        possibleStep1Classes.find(
            (c) => c.classNo === currentClassInfo.classNo
        ),
        ...possibleStep2Classes.filter((c) =>
            desiredClasses.find(
                (ds) =>
                    ds.classNo === c.classNo &&
                    ds.moduleCode === c.moduleCode &&
                    ds.lessonType === c.lessonType
            )
        ),
    ].filter(Boolean) as ClassOverview[];

    // User comments
    const [comments, setComments] = useState("");

    // Submit swap request
    const submitHandler = async () => {
        console.log(desiredClasses);
        console.log(currentClassInfo);

        // const response = await sendPOST("/api/swap/create", {
        //     desiredClassNos: desiredClasses,
        //     currentClassInfo,
        //     user,
        //     comments,
        //     desiredModulesInfo,
        // });
        const response = await sendPOST("/api/swap/create", {
            currentClassInfo,

            desiredClasses,

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

    console.log({
        currentClassInfo,
        desiredModulesInfo,
        desiredClassNos: desiredClasses,
        comments,
    });
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

                {activeStep === 0 && (
                    <Step1
                        activeStep={activeStep}
                        nextStep={nextStep}
                        prevStep={prevStep}
                        setStep={setStep}
                        setCurrentClassInfo={setCurrentClassInfo}
                        currentClassInfo={currentClassInfo}
                        setDesiredClasses={setDesiredClasses}
                        setDesiredModulesInfo={setDesiredModulesInfo}
                        possibleClasses={possibleStep1Classes}
                        setPossibleClasses={setPossibleStep1Classes}
                        setPossibleStep2Classes={setPossibleStep2Classes}
                    />
                )}
                {activeStep === 1 && (
                    <ModuleSelectStep2
                        activeStep={activeStep}
                        nextStep={nextStep}
                        prevStep={prevStep}
                        setStep={setStep}
                        currentClassInfo={currentClassInfo}
                        setCurrentClassInfo={setCurrentClassInfo}
                        desiredClasses={desiredClasses}
                        setDesiredClasses={setDesiredClasses}
                        setDesiredModulesInfo={setDesiredModulesInfo}
                        desiredModulesInfo={desiredModulesInfo}
                        possibleClasses={possibleStep2Classes}
                        setPossibleClasses={setPossibleStep2Classes}
                        isInternalSwap={isInternalSwap}
                    />
                )}
                {activeStep === 2 && (
                    <Step3
                        activeStep={activeStep}
                        nextStep={nextStep}
                        prevStep={prevStep}
                        setStep={setStep}
                        currentClassInfo={currentClassInfo}
                        desiredModulesInfo={desiredModulesInfo}
                        displayedClasses={reviewClassesList}
                        desiredClasses={desiredClasses}
                        submitHandler={submitHandler}
                        comments={comments}
                        setComments={setComments}
                        isInternalSwap={isInternalSwap}
                    />
                )}
            </Stack>
        )
    );
};

export default CreateSwap;
