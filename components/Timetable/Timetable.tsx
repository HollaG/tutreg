import {
    Box,
    Center,
    Flex,
    Grid,
    GridItem,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { keepAndCapFirstThree } from "../../lib/functions";
import { ClassDB, ModuleWithClassDB } from "../../types/db";
import { Day, RawLesson } from "../../types/modules";
import { ClassOverview, ModuleCodeLessonType, RootState } from "../../types/types";
import TimetableSelectable from "./TimetableSelectable";

export interface TimetableLessonEntry extends ModuleWithClassDB {
    // startTime: number,
    // endTime: number,
    // day: string,
    pushDown: number;
    minutesUntilPrevClass: number; // in px
    id: string;
    overlaps: string[];
}

type DayRows = {
    [day in Day]: number;
};
const GRID_ITEM_HEIGHT = 50;

const order = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const Timetable: React.FC<{
    // listOfLessons: ClassDB[]
    mclt: string;

}> = ({ mclt }) => {
    console.log("timetable rerendering")
    const ALTERNATE_EVEN_GRID_COLOR = useColorModeValue("gray.100", "gray.500");
    const ALTERNATE_ODD_GRID_COLOR = useColorModeValue("white", "gray.700");
    const BORDER_COLOR = useColorModeValue("gray.300", "gray.600");
    const HEADER_COLOR = useColorModeValue("gray.200", "gray.500");
    const TEXT_HEADER_COLOR = useColorModeValue("gray.600", "gray.200")
    const timetableData = useSelector((state: RootState) => state.timetable);

    const classesList = useSelector(
        (state: RootState) => state.classesInfo.totalModuleCodeLessonTypeMap
    );

    const selectedClasses = useSelector((state: RootState) => state.classesInfo.selectedClasses)

    const isSelected = (class_: TimetableLessonEntry, selectedClasses: ModuleCodeLessonType) => {
        const moduleCodeLessonType = `${class_.moduleCode}: ${class_.lessonType}`
        return !!selectedClasses[moduleCodeLessonType] && !!selectedClasses[moduleCodeLessonType].find((class_2) => class_2.classNo === class_.classNo)
    }


    const classesForThis = classesList[mclt];

    // console.log({ classesForThis });

    let timetableList: TimetableLessonEntry[] = [];

    let earliestTiming = "2400";
    let latestTiming = "0000";

    const totalDayRowsToDraw: DayRows = {
        Monday: 1,
        Tuesday: 1,
        Wednesday: 1,
        Thursday: 1,
        Friday: 1,
        Saturday: 1,
        Sunday: 1,
    };

    classesForThis.forEach((lesson) => {
        // Check how many overlapping lessons there are in final
        // If there are none, pushDown = 0

        const classes = lesson.classes;

        classes.forEach((class_) => {
            let pushDown = 0;
            const overlaps = timetableList.filter(
                (entry: TimetableLessonEntry) => {
                    return (
                        class_.day === entry.day &&
                        Number(class_.startTime) < Number(entry.endTime) &&
                        Number(class_.endTime) > Number(entry.startTime)
                    );
                }
            );

            if (overlaps.length) {
                // there are overlaps.
                // set pushDown to: starting from zero, check if this pushdown value has alr been set in overlaps.
                // if not, set it, if so, continue counting until pushDown = overlaps.length

                // set pushdown to the highest value of pushdown in overlaps + 1
                pushDown =
                    Math.max(...overlaps.map((overlap) => overlap.pushDown)) +
                    1;

                // But, there are cases where the pushdown value is not consecutive
                for (let i = 0; i <= overlaps.length; i++) {
                    // console.log(
                    //     `${overlaps.map(
                    //         (overlap) => overlap.classNo
                    //     )} overlaps with ${class_.classNo}`
                    // );

                    if (!overlaps.find((overlap) => overlap.pushDown === i)) {
                        pushDown = i;
                        break;
                    }

                    // if (overlaps.find((overlap) => overlap.pushDown === i)) {
                    //     break;
                    // }
                    // pushDown = i + 1;
                }
                // pushDown = overlaps.length
            }

            timetableList.push({
                ...class_,
                pushDown,
                minutesUntilPrevClass: 0,
                id: `${class_.moduleCode}-${class_.lessonType}-${class_.classNo}`,

                overlaps: overlaps.map((overlap) => overlap.id),
            });

            // update totalDayRowsToDraw
            if (pushDown + 1 > totalDayRowsToDraw[class_.day as Day]) {
                totalDayRowsToDraw[class_.day as Day] = pushDown + 1;
            }

            // update the timings
            if (Number(class_.startTime) < Number(earliestTiming)) {
                earliestTiming = class_.startTime;
            }
            if (Number(class_.endTime) > Number(latestTiming)) {
                latestTiming = class_.endTime;
            }
        });
    });

    // sort the timetableList
    timetableList = timetableList.sort(
        (c1, c2) => Number(c1.startTime) - Number(c2.startTime)
    );

    // console.log({ timetableList, totalDayRowsToDraw });

    // Create the rowStart and rowEnd for each day

    const rowMappingForDays = order.map((day) => ({
        day: day as Day,
        rowStart: 0,
        rowEnd: 0,
    }));

    order.forEach((dayObj, pos) => {
        let day = dayObj as Day;
        if (pos === 0) {
            rowMappingForDays[pos].rowStart = 0;
            rowMappingForDays[pos].rowEnd =
                rowMappingForDays[pos].rowStart + totalDayRowsToDraw[day] - 1;
        } else {
            rowMappingForDays[pos].rowStart =
                rowMappingForDays[pos - 1].rowEnd + 1;
            rowMappingForDays[pos].rowEnd =
                rowMappingForDays[pos].rowStart + totalDayRowsToDraw[day] - 1;
        }
    });

    // console.log(rowMappingForDays);
    const totalRowsToDraw =
        Object.values(totalDayRowsToDraw).reduce((a, b) => a + b, 0) + 1; // 1 for the timing row

    const totalColumnsToDraw =
        Math.ceil(
            (convertToMinutes(latestTiming) -
                convertToMinutes(earliestTiming)) /
                60
        ) + 1; // # of hours in timetable + 1

    // console.log({ totalRowsToDraw, totalColumnsToDraw });

    

    return (
        <>
            <Grid
                gridTemplateRows={"50px 1fr"}
                templateColumns={`repeat(${totalColumnsToDraw}, 1fr)`}
                // templateAreas={`"header header"
                //                 "day main"`}

                // }
            >
                {/* Headers for timing */}
                {Array.from({ length: totalColumnsToDraw }).map((_, c) => {
                    return (
                        <GridItem key={c}>
                            <Flex alignItems={'flex-end'} height="100%" ml="-18px">
                                {c !== 0 ? (
                                    <Text textColor={TEXT_HEADER_COLOR}>
                                        {convertColumnToTime(c, earliestTiming)}
                                    </Text>
                                ) : (
                                    <></>
                                )}
                            </Flex>
                        </GridItem>
                    );
                })}

                {/* Create the day headers */}
                <GridItem>
                    <Grid
                        gridTemplateRows={`${rowMappingForDays
                            .map(
                                (dayObj) =>
                                    `${dayObj.rowEnd - dayObj.rowStart + 1}fr`
                            )
                            .join(" ")}`}
                        height="100%"
                    >
                        {rowMappingForDays.map((dayObj, r) => (
                            <GridItem
                                key={r}
                                bgColor={HEADER_COLOR}
                                border="1px solid"
                                borderColor={BORDER_COLOR}
                                minH={GRID_ITEM_HEIGHT}
                            >
                                <Center
                                    h={"100%"}
                                    sx={
                                        {
                                            // transform: "rotate(-90deg)",
                                        }
                                    }
                                    textColor={TEXT_HEADER_COLOR}
                                >
                                    {keepAndCapFirstThree(dayObj.day)}
                                </Center>
                            </GridItem>
                        ))}
                    </Grid>
                </GridItem>

                {/* Create the table for the items */}
                <GridItem colSpan={totalColumnsToDraw - 1}>
                    <Box position="relative">
                        <Grid
                            templateRows={`repeat(${totalRowsToDraw - 1}, 1fr)`}
                            templateColumns={`repeat(${
                                totalColumnsToDraw - 1
                            }, 1fr)`}
                        >
                            {Array.from({ length: totalRowsToDraw - 1 }).map(
                                (_, r) => {
                                    const { day, pushDown } = convertRowToDay(
                                        r,
                                        totalDayRowsToDraw
                                    );
                                    return (
                                        <>
                                            <GridItem
                                                colSpan={totalColumnsToDraw - 1}
                                                height={GRID_ITEM_HEIGHT}
                                            >
                                                <Flex h="100%" w="100%">
                                                    {timetableList
                                                        .filter(
                                                            (class_) =>
                                                                class_.day ===
                                                                    day &&
                                                                class_.pushDown ===
                                                                    pushDown
                                                        )
                                                        .map((class_, i) => {
                                                            return (
                                                                <Box
                                                                    key={i}
                                                                    height="100%"
                                                                    
                                                                    width={`${calculateWidthPercent(
                                                                        class_.startTime,
                                                                        class_.endTime,
                                                                        earliestTiming,
                                                                        latestTiming
                                                                    )}%`}
                                                                    marginLeft={`${calculateMarginLeftPercent(
                                                                        calculateMinutesBeforeThePreviousClass(
                                                                            class_,
                                                                            timetableList,
                                                                            earliestTiming
                                                                        ),
                                                                        earliestTiming,
                                                                        latestTiming
                                                                    )}%`}
                                                                  
                                                                >
                                                                    <TimetableSelectable class_={class_} selected={isSelected(class_, selectedClasses)}/>
                                                                </Box>
                                                            );
                                                        })}
                                                </Flex>
                                            </GridItem>
                                        </>
                                    );
                                }
                            )}
                        </Grid>
                        <Grid
                            position="absolute"
                            top={0}
                            left={0}
                            templateRows={`repeat(${totalRowsToDraw - 1}, 1fr)`}
                            templateColumns={`repeat(${
                                totalColumnsToDraw - 1
                            }, 1fr)`}
                            width="100%"
                            zIndex={-1}
                            // borderLeft="2px"
                            borderRight="2px"
                            borderTop="1px"
                            borderBottom="1px"
                            borderColor={ALTERNATE_EVEN_GRID_COLOR}
                        >
                            {Array.from({ length: totalRowsToDraw - 1 }).map(
                                (_, r) =>
                                    Array.from({
                                        length: totalColumnsToDraw - 1,
                                    }).map((__, c) => (
                                        <GridItem
                                            key={`${r}${c}`}
                                            height={GRID_ITEM_HEIGHT}
                                            bgColor={
                                                c % 2
                                                    ? ALTERNATE_EVEN_GRID_COLOR
                                                    : ALTERNATE_ODD_GRID_COLOR
                                            }
                                            borderBottom={
                                                r !== totalRowsToDraw - 2
                                                    ? "1px"
                                                    : "0px"
                                            }
                                            borderColor={
                                                BORDER_COLOR
                                            }
                                        ></GridItem>
                                    ))
                            )}
                        </Grid>
                    </Box>
                </GridItem>
            </Grid>
        </>
    );
};

// function to convert 24 hour timing to minutes since 00:00
const convertToMinutes = (time: string) => {
    const hours = Number(time.slice(0, 2));
    const minutes = Number(time.slice(2, 4));
    return hours * 60 + minutes;
};

// convert column number to beginning of timeslot, given the earliest timeslot
const convertColumnToTime = (column: number, earliestTiming: string) => {
    const earliestMinutes = convertToMinutes(earliestTiming);
    const minutes = earliestMinutes + (column - 1) * 60;
    const hours = Math.floor(minutes / 60);
    const minutesLeft = minutes % 60;
    const minutesString = minutesLeft < 10 ? `0${minutesLeft}` : minutesLeft;
    return `${hours}${minutesString}`;
};

// convert row number to day, given the number of rows per day
const convertRowToDay = (row: number, totalDayRowsToDraw: DayRows) => {
    // row starts from 0 (header row ignored already before we passed in variable)

    let rowT = row;

    // starting from Monday, subtract the rowT until rowT <= 0

    for (let day of order) {
        rowT = rowT - totalDayRowsToDraw[day as Day];
        if (rowT < 0) {
            // <= results in Sunday not showing
            // console.log("returning", day);
            return {
                day,
                pushDown: totalDayRowsToDraw[day as Day] - Math.abs(rowT),
            };
        }
    }

    return {
        day: "Monday",
        pushDown: 0,
    };
};

// function to calculate the width of a timetable block, given the start and end time, and the total time in the timetable (in percent)
const calculateWidthPercent = (
    startTime: string,
    endTime: string,
    earliestTiming: string,
    latestTiming: string
) => {
    const startMinutes = convertToMinutes(startTime);
    const endMinutes = convertToMinutes(endTime);
    const earliestMinutes = convertToMinutes(earliestTiming);
    const latestMinutes = convertToMinutes(latestTiming);
    const totalMinutes = latestMinutes - earliestMinutes;
    const minutes = endMinutes - startMinutes;
    return (minutes / totalMinutes) * 100;
};

const calculateMarginLeftPercent = (
    minutes: number,
    earliestTiming: string,
    latestTiming: string
) => {
    const earliestMinutes = convertToMinutes(earliestTiming);
    const latestMinutes = convertToMinutes(latestTiming);
    const totalMinutes = latestMinutes - earliestMinutes;
    return (minutes / totalMinutes) * 100;
};

const calculateMinutesBeforeThePreviousClass = (
    class_: TimetableLessonEntry,
    timetableList: TimetableLessonEntry[],
    earliestTiming: string
) => {
    const inTheSameRow = timetableList.filter(
        (class_2) =>
            class_2.day === class_.day && class_2.pushDown === class_.pushDown
    );

    // find the index of our class
    const index = inTheSameRow.findIndex(
        (class_2) => class_2.classNo === class_.classNo
    );

    // if index is 0, then we are the first class in the row, so we return the difference between our start time and the earliest timing
    if (index === 0) {
        return (
            convertToMinutes(class_.startTime) -
            convertToMinutes(earliestTiming)
        );
    } else {
        // return the different between index - 1 and us
        return (
            convertToMinutes(class_.startTime) -
            convertToMinutes(inTheSameRow[index - 1].endTime)
        );
    }

    // look for the one that has an earlier, or equal to endTime to our startTime
    const startTime = class_.startTime;

    let currentlyLatestClass = null;
    for (let class_2 of inTheSameRow) {
        if (Number(class_2.endTime) <= Number(startTime)) {
            if (!currentlyLatestClass) {
                currentlyLatestClass = class_2;
            } else {
                if (
                    Number(class_2.endTime) >
                    Number(currentlyLatestClass.endTime)
                ) {
                    currentlyLatestClass = class_2;
                }
            }
        }
    }

    if (!currentlyLatestClass) {
        return convertToMinutes(startTime) - convertToMinutes(earliestTiming);
    } else {
        return (
            convertToMinutes(startTime) -
            convertToMinutes(currentlyLatestClass.startTime)
        );
    }
};

export default React.memo(Timetable);
