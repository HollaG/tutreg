import {
    Box,
    Button,
    Center,
    Checkbox,
    CheckboxGroup,
    Flex,
    FormControl,
    FormHelperText,
    SimpleGrid,
    Stack,
    Text,
    useBoolean,
    useCheckbox,
    useColorModeValue,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { Step, Steps, useSteps } from "chakra-ui-steps";
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
import { keepAndCapFirstThree } from "../../lib/functions";
import { ClassDB } from "../../types/db";
import { GetClassesResponse, GroupedByClassNo } from "../api/swap/getClasses";

import { Option, RootState } from "../../types/types";
import Entry from "../../components/Sortables/Entry";
import OrderSwapPriorityList from "../../components/Swap/OrderSwapPriorityList";
import { ArrowDownIcon, DeleteIcon } from "@chakra-ui/icons";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import SwapEntry from "../../components/Swap/SwapEntry";
import { miscActions } from "../../store/misc";

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
    return `${keepAndCapFirstThree(classes[0].lessonType)} [${
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
    reset: () => void;
    setStep: (step: number) => void;
    activeStep: number;

    currentClassInfo: {
        moduleCode: string;
        lessonType: string;
        classNo: string;
    };
    setCurrentClassInfo: Dispatch<
        SetStateAction<{
            moduleCode: string;
            lessonType: string;
            classNo: string;
        }>
    >;

    classes: GroupedByClassNo;
    setClasses: Dispatch<SetStateAction<GroupedByClassNo>>;
}> = ({
    nextStep,
    prevStep,
    setStep,
    reset,
    activeStep,
    setCurrentClassInfo,
    classes,
    setClasses,
    currentClassInfo,
}) => {
    const [moduleCodeLessonTypeValue, setModuleCodeLessonTypeValue] =
        useState("");

    const selectHandler = async (option: Option[]) => {
        console.log(option);

        // Send request to find the classes available for this moduleCodeLessonType
        const moduleCodeLessonType = option[0].value;
        const moduleCode = moduleCodeLessonType.split(": ")[0];
        const lessonType = moduleCodeLessonType.split(": ")[1];

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
        }
    };

    const selectCurrentClassHandler = (option: Option) => {
        console.log(option);
        setCurrentClassInfo((prevState) => ({
            ...prevState,
            classNo: option.value,
        }));
    };
    console.log({currentClassInfo})
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
            <FormControl>
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
            </FormControl>
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
        </Stack>
    );
};

const Step2: React.FC<{
    nextStep: () => void;
    prevStep: () => void;
    reset: () => void;
    setStep: (step: number) => void;
    activeStep: number;
    classes: GroupedByClassNo;
    setClasses: Dispatch<SetStateAction<GroupedByClassNo>>;

    currentClassInfo: {
        moduleCode: string;
        lessonType: string;
        classNo: string;
    };
    setCurrentClassInfo: Dispatch<
        SetStateAction<{
            moduleCode: string;
            lessonType: string;
            classNo: string;
        }>
    >;
    values: (string | number)[];
    setValues: Dispatch<SetStateAction<(string | number)[]>>;
}> = ({
    nextStep,
    prevStep,
    setStep,
    reset,
    activeStep,
    setCurrentClassInfo,
    classes,
    setClasses,
    currentClassInfo,

    values,
    setValues,
}) => {
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
            <SwapEntry
                classNo={currentClassInfo.classNo}
                classes={classes[currentClassInfo.classNo]}
                title={`${currentClassInfo.moduleCode} ${keepAndCapFirstThree(
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
            </SimpleGrid>
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
    reset: () => void;
    setStep: (step: number) => void;
    activeStep: number;
    classes: GroupedByClassNo;

    currentClassInfo: {
        moduleCode: string;
        lessonType: string;
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
}> = ({
    classes,
    prevStep,
    setDesiredClasses,
    desiredClasses,
    submitHandler,
    currentClassInfo,
    // isEqualRank,
    // setIsEqualRank,
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
            {/* <OrderSwapPriorityList
                enabled={!isEqualRank}
                classes={classes}
                desiredClasses={desiredClasses}
                setDesiredClasses={setDesiredClasses}
            /> */}
            <SwapEntry
                classNo={currentClassInfo.classNo}
                classes={classes[currentClassInfo.classNo]}
                title={`${currentClassInfo.moduleCode} ${keepAndCapFirstThree(
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
                    title={`${(index || 0) + 1}. ${keepAndCapFirstThree(
                        currentClassInfo.lessonType
                    )} [${desiredClassNo}]`}
                    canDelete
                    deleteHandler={() => deleteHandler(desiredClassNo)}
                />
            ))}
        </Stack>
    );
};
const CreateSwap: NextPage = () => {
    const stepsControl = useSteps({
        initialStep: 0,
    });
    const { nextStep, prevStep, setStep, reset, activeStep } = stepsControl;

    const [currentClassInfo, setCurrentClassInfo] = useState<{
        moduleCode: string;
        lessonType: string;
        classNo: string;
    }>({
        moduleCode: "",
        lessonType: "",
        classNo: "",
    });

    // All the available classes for user-selected moduleCode and lessonType
    const [classes, setClasses] = useState<GroupedByClassNo>({});

    // Handle checkboxes for step 2
    const [desiredClasses, setDesiredClasses] = useState<(string | number)[]>(
        []
    );

    // const [isEqualRank, setIsEqualRank] = useBoolean(false);

    const user = useSelector((state: RootState) => state.user);
    const router = useRouter();
    const dispatch = useDispatch()
    const submitHandler = async () => {
        console.log(desiredClasses);
        console.log(currentClassInfo);

        const response = await sendPOST("/api/swap/create", {
            desiredClasses,
            currentClassInfo,
            user,
        });
        if (!response.success || !response.data) {
            alert(response.error);
        } else {
            router.push(`/swap/${response.data}`); 
        }
    };


    // Redirect back to homepage if no user
    useEffect(() => {
        if (!user) {
            // router.push("/swap");
            dispatch(miscActions.setNeedsLogIn(true))
        }
    }, [user, dispatch]);

    return (
        user && (
            <Stack spacing={5} alignItems="center" h="100%">
                <Steps activeStep={activeStep}>
                    {steps.map(({ label }) => (
                        <Step label={label} key={label}></Step>
                    ))}
                </Steps>
                {activeStep === 0 && (
                    <Step1
                        {...stepsControl}
                        setCurrentClassInfo={setCurrentClassInfo}
                        classes={classes}
                        setClasses={setClasses}
                        currentClassInfo={currentClassInfo}
                    />
                )}
                {activeStep === 1 && (
                    <Step2
                        {...stepsControl}
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
                        {...stepsControl}
                        currentClassInfo={currentClassInfo}
                        classes={classes}
                        desiredClasses={desiredClasses}
                        setDesiredClasses={setDesiredClasses}
                        // isEqualRank={isEqualRank}
                        // setIsEqualRank={setIsEqualRank}
                        submitHandler={submitHandler}
                    />
                )}
            </Stack>
        )
    );
};

export default CreateSwap;
