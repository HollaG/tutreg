import {
    Grid,
    GridItem,
    Flex,
    Center,
    useBreakpointValue,
    useColorModeValue,
    Text,
    Box,
} from "@chakra-ui/react";
import React from "react";

import { keepAndCapFirstThree } from "../../lib/functions";
import { Day } from "../../types/modules";
import { DayRows, TimetableLessonEntry } from "../../types/timetable";
import { ClassOverview } from "../../types/types";

import TimetableSelectable from "./TimetableSelectable";

const order = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const GRID_ITEM_HEIGHT_BIG = 75;
const GRID_ITEM_HEIGHT_SMALL = 50;

const Timetable: React.FC<{
    classesToDraw: ClassOverview[];
    property: (class_: TimetableLessonEntry) => string | undefined;
    onSelected: (class_: TimetableLessonEntry, selected: boolean) => void;
    tinyMode?: boolean;
}> = ({ classesToDraw, property, onSelected, tinyMode = false }) => {
    const GRID_ITEM_HEIGHT_RESPONSIVE = useBreakpointValue({
        base: GRID_ITEM_HEIGHT_SMALL,
        md: tinyMode ? GRID_ITEM_HEIGHT_SMALL : GRID_ITEM_HEIGHT_BIG,
    });

    const DEFAULT_FONT_SIZE = tinyMode ? "sm" : "md";
    const COLUMN_WIDTH_START = tinyMode ? "40px" : "50px";
    const ALTERNATE_EVEN_GRID_COLOR = useColorModeValue("gray.100", "gray.900");
    const ALTERNATE_ODD_GRID_COLOR = useColorModeValue("gray.50", "gray.800");

    const HEADER_COLOR = useColorModeValue("blue.200", "blue.700");
    const TEXT_HEADER_COLOR = useColorModeValue("gray.700", "gray.200");

    const BORDER_COLOR = useColorModeValue("gray.400", "gray.500");

    const BORDER_WIDTH = "1px";
    const BORDER_RADIUS = "5px";
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

    classesToDraw.forEach((lesson) => {
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

    // we need to ensure that the end_time and the start time differ by a whole number of hours.
    // start: 1000, end: 1800 --> OK
    // start: 0930, end: 1800 --> NOT ok (add 30)
    // start: 0945, end: 1715 --> NOT ok (add 30)
    // start: 1000, end: 1715 --> NOT ok (add 45)
    // in this case we need to add 30 minutes to the end time
    const minutesDifference =
        convertToMinutes(latestTiming) - convertToMinutes(earliestTiming);
    if (minutesDifference % 60 !== 0) {
        const minutesToAdd = 60 - (minutesDifference % 60);
        // TODO
        latestTiming = convertToHours(
            convertToMinutes(latestTiming) + minutesToAdd
        );
    }

    // sort the timetableList
    timetableList = timetableList.sort(
        (c1, c2) => Number(c1.startTime) - Number(c2.startTime)
    );

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

    if (!timetableList.length) {
        // default values
        earliestTiming = "0800";
        latestTiming = "1800";
    }

    const totalColumnsToDraw =
        Math.ceil(
            (convertToMinutes(latestTiming) -
                convertToMinutes(earliestTiming)) /
                60
        ) + 1; // # of hours in timetable + 1

    return (
        <Grid
            margin="auto"
            gridTemplateRows={"25px 1fr"}
            templateColumns={`${COLUMN_WIDTH_START} repeat(${
                totalColumnsToDraw - 1
            }, 1fr)`}
            // templateAreas={`"header header"
            //                 "day main"`}

            // }
        >
            {/* Headers for timing */}
            {Array.from({ length: totalColumnsToDraw }).map((_, c) => {
                return (
                    <GridItem key={c}>
                        <Flex alignItems={"flex-end"} height="100%" ml="-18px">
                            {c !== 0 ? (
                                <Text
                                    textColor={TEXT_HEADER_COLOR}
                                    fontSize={DEFAULT_FONT_SIZE}
                                >
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
            <GridItem
                // borderLeft={BORDER_WIDTH}
                borderColor={BORDER_COLOR}
                // borderTop={BORDER_WIDTH}
                // borderBottom={BORDER_WIDTH}
            >
                <Grid
                    gridTemplateRows={`${rowMappingForDays
                        .map(
                            (dayObj) =>
                                `${dayObj.rowEnd - dayObj.rowStart + 1}fr`
                        )
                        .join(" ")}`}
                    height="100%"
                    borderRadius="10px"
                >
                    {rowMappingForDays.map((dayObj, r) => (
                        <GridItem
                            key={r}
                            bgColor={HEADER_COLOR}
                            borderTop={r === 0 ? 0 : BORDER_WIDTH}
                            // borderLeft={BORDER_WIDTH}
                            borderRight={BORDER_WIDTH}
                            borderColor={BORDER_COLOR}
                            minH={GRID_ITEM_HEIGHT_RESPONSIVE}
                            {...(r === 0 && {
                                borderTopLeftRadius: BORDER_RADIUS,
                            })}
                            {...(r === rowMappingForDays.length - 1 && {
                                borderBottomLeftRadius: BORDER_RADIUS,
                            })}
                        >
                            <Center
                                h={"100%"}
                                sx={
                                    {
                                        // transform: "rotate(-90deg)",
                                    }
                                }
                                textColor={TEXT_HEADER_COLOR}
                                fontSize={DEFAULT_FONT_SIZE}
                                fontWeight="semibold"
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
                    {/* Table to hold the TimetableSelectables */}
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
                                    <GridItem
                                        colSpan={totalColumnsToDraw - 1}
                                        height={GRID_ITEM_HEIGHT_RESPONSIVE}
                                        key={r}
                                    >
                                        <Flex h="100%" w="100%">
                                            {timetableList
                                                .filter(
                                                    (class_) =>
                                                        class_.day === day &&
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
                                                            <TimetableSelectable
                                                                class_={class_}
                                                                property={property(
                                                                    class_
                                                                )}
                                                                onSelected={
                                                                    onSelected
                                                                }
                                                                tinyMode={
                                                                    tinyMode
                                                                }
                                                            />
                                                        </Box>
                                                    );
                                                })}
                                        </Flex>
                                    </GridItem>
                                );
                            }
                        )}
                    </Grid>

                    {/* Table to draw the background */}
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
                        // borderRight={BORDER_WIDTH}
                        // borderTop={BORDER_WIDTH}
                        // borderBottom={BORDER_WIDTH}
                        borderRightRadius={BORDER_RADIUS}
                        borderColor={BORDER_COLOR}
                    >
                        {Array.from({ length: totalRowsToDraw - 1 }).map(
                            (_, r) =>
                                Array.from({
                                    length: totalColumnsToDraw - 1,
                                }).map((__, c) => (
                                    <GridItem
                                        key={`${r}${c}`}
                                        height={GRID_ITEM_HEIGHT_RESPONSIVE}
                                        bgColor={
                                            c % 2 === 1
                                                ? ALTERNATE_EVEN_GRID_COLOR
                                                : ALTERNATE_ODD_GRID_COLOR
                                        }
                                        {...(doDrawTopBorder(
                                            r,
                                            totalDayRowsToDraw
                                        )
                                            ? {
                                                  borderTop: BORDER_WIDTH,
                                                  borderColor: BORDER_COLOR,
                                              }
                                            : {})}
                                        {...(c === totalColumnsToDraw - 2 &&
                                            r === 0 && {
                                                borderTopRightRadius:
                                                    BORDER_RADIUS,
                                            })}
                                        {...(c === totalColumnsToDraw - 2 &&
                                            r === totalRowsToDraw - 2 && {
                                                borderBottomRightRadius:
                                                    BORDER_RADIUS,
                                            })}
                                    ></GridItem>
                                ))
                        )}
                    </Grid>
                </Box>
            </GridItem>
        </Grid>
    );
};

// function to determine if we should draw a top border
// We draw a bottom border when this cell is the last row before the day changes.
const doDrawTopBorder = (r: number, totalDayRowsToDraw: DayRows) => {
    if (r === 0) {
        return false; // never draw border for the first row
    } else {
        const rowCurDay = convertRowToDay(r, totalDayRowsToDraw).day;
        const prevRowDay = convertRowToDay(r - 1, totalDayRowsToDraw).day;

        return rowCurDay !== prevRowDay;
    }
};

const doDrawBottomBorder = (
    r: number,
    totalDayRowsToDraw: DayRows,
    totalRowsToDraw: number
) => {
    if (r === totalRowsToDraw) {
        return false; // never draw border for the last row
    } else {
        const rowCurDay = convertRowToDay(r, totalDayRowsToDraw).day;
        const nextRowDay = convertRowToDay(r + 1, totalDayRowsToDraw).day;

        return rowCurDay !== nextRowDay;
    }
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

// convert column number to beginning of timeslot, given the earliest timeslot
const convertColumnToTime = (column: number, earliestTiming: string) => {
    const earliestMinutes = convertToMinutes(earliestTiming);
    const minutes = earliestMinutes + (column - 1) * 60;
    const hours = Math.floor(minutes / 60);
    const hoursString = hours < 10 ? `0${hours}` : hours;
    const minutesLeft = minutes % 60;
    const minutesString = minutesLeft < 10 ? `0${minutesLeft}` : minutesLeft;
    return `${hoursString}${minutesString}`;
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
};
export default React.memo(Timetable);
