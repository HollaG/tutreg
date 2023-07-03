import {
    Box,
    Button,
    Center,
    Container,
    Flex,
    Grid,
    GridItem,
    Text,
    useBreakpoint,
    useBreakpointValue,
    useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { keepAndCapFirstThree } from "../../lib/functions";
import { classesActions } from "../../store/classesReducer";
import { ClassDB, ModuleWithClassDB } from "../../types/db";
import { Day, RawLesson } from "../../types/modules";
import { TimetableLessonEntry } from "../../types/timetable";
import {
    ClassOverview,
    ModuleCodeLessonType,
    RootState,
} from "../../types/types";
import Timetable from "./Timetable";
import TimetableSelectable from "./TimetableSelectable";

const GRID_ITEM_HEIGHT_BIG = 75;
const GRID_ITEM_HEIGHT_SMALL = 50;

const order = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const TimetableContainer: React.FC<{
    // listOfLessons: ClassDB[]
    mclt: string;
    closeHandler: () => void;
}> = ({ mclt, closeHandler: onClose }) => {
    const classesList = useSelector(
        (state: RootState) => state.classesInfo.totalModuleCodeLessonTypeMap
    );

    const selectedClassesMCLT = useSelector(
        (state: RootState) => state.classesInfo.selectedClasses
    );

    const isSelected = (
        class_: TimetableLessonEntry,
        selectedClasses: ClassOverview[]
    ) => {
        return (
            !!selectedClasses &&
            !!selectedClasses.find(
                (class_2) => class_2.classNo === class_.classNo
            )
        );
    };

    const classesForThis = classesList[mclt];

    const dispatch = useDispatch();
    const deselectAllHandler = () => {
        dispatch(classesActions.removeChangedClasses());
    };

    return (
        <Container maxW={"1200px"}>
            <Flex justifyContent="right">
                <Box>
                    <Button
                        colorScheme="red"
                        onClick={() => deselectAllHandler()}
                    >
                        {" "}
                        Deselect all{" "}
                    </Button>
                </Box>
                <Box ml={2}>
                    <Button onClick={onClose} colorScheme="blue">
                        {" "}
                        Save & close{" "}
                    </Button>
                </Box>
            </Flex>
            <Timetable
                classesForThis={classesForThis}
                selectedClasses={selectedClassesMCLT[mclt]}
                isSelected={isSelected}
            />
        </Container>
    );
};

// function to convert # of minutes to 24hour timing
const convertToHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const hoursString = hours < 10 ? `0${hours}` : hours;
    const minutesLeft = minutes % 60;
    const minutesString = minutesLeft < 10 ? `0${minutesLeft}` : minutesLeft;
    return `${hoursString}${minutesString}`;
};

// function to convert 24 hour timing to minutes since 00:00
const convertToMinutes = (time: string) => {
    const hours = Number(time.slice(0, 2));
    const minutes = Number(time.slice(2, 4));
    return hours * 60 + minutes;
};

export default React.memo(TimetableContainer);
