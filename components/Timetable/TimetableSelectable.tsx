import {
    Box,
    Button,
    Flex,
    Stack,
    Text,
    useBoolean,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    checkMultipleDifferentWeeks,
    combineNumbers,
    combineNumbersDatabase,
    encodeLessonTypeToShorthand,
} from "../../lib/functions";
import { classesActions } from "../../store/classesReducer";
import { RootState } from "../../types/types";
import { TimetableLessonEntry } from "./Timetable";

const TimetableSelectable: React.FC<{
    class_: TimetableLessonEntry;
    selected: boolean;
}> = ({ class_, selected }) => {
    console.log("timetable selectable rendering");
    const GRAY_BACKGROUND = useColorModeValue("gray.50", "gray.900");
    const HOVER_COLOR = useColorModeValue('teal.100', 'teal.800')

    const [sel, setSel] = useBoolean(selected);

    const weeksDisplay = combineNumbersDatabase(class_.weeks);

    const dispatch = useDispatch();
    // const toggleHandler = () => {
    //     if (selected) {
    //         // remove
    //     } else {
    //         // add
    //         dispatch(
    //             classesActions.addSelectedClass({
    //                 moduleCodeLessonType: `${class_.moduleCode}: ${class_.lessonType}`,
    //                 classNo: class_.classNo,
    //             })
    //         );
    //     }
    // }

    const toggleHandler = () => {
        // handleSelect(class_, !sel)
        dispatch(
            classesActions.updateChangedClasses({
                class_: class_,
                selected: !sel,
            })
        );
        setSel.toggle();
    };

    return (
        <Flex
            height="95%"
            transform={"scale(0.95)"}
            justifyContent={"center"}
            textAlign="center"
        >
            <Button
                size={"xs"}
                w="100%"
                h="100%"
                justifyContent={"left"}
                textAlign="left"
                
                {...(sel
                    ? { variant: "solid", opacity: 1, colorScheme: "teal" }
                    : {
                          bgColor: GRAY_BACKGROUND,
                          variant: "outline",
                          opacity: 0.9,
                          colorScheme: "grey",
                          "_hover": {
                              opacity: 1,
                              bgColor: HOVER_COLOR
                          },
                      })}
                onClick={() => toggleHandler()}
            >
                <Stack spacing={0}>
                    <Text fontSize={"xs"} fontWeight="semibold">
                        {encodeLessonTypeToShorthand(class_.lessonType)} [
                        {class_.classNo}]
                    </Text>
                    <Text fontSize={"0.65rem"} fontWeight="">
                        {class_.venue}
                    </Text>
                    <Text fontSize={"0.65rem"} fontWeight="">
                        Wks {weeksDisplay}{" "}
                    </Text>
                </Stack>
            </Button>
        </Flex>
    );
};

export default React.memo(TimetableSelectable);
