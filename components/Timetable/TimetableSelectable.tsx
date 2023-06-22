import {
    Box,
    Button,
    Center,
    Flex,
    Stack,
    Text,
    useBoolean,
    useBreakpointValue,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    checkMultipleDifferentWeeks,
    combineNumbers,
    combineNumbersDatabase,
    encodeLessonTypeToShorthand,
} from "../../lib/functions";
import { classesActions } from "../../store/classesReducer";
import { TimetableLessonEntry } from "../../types/timetable";
import { RootState } from "../../types/types";

const BASE_BUTTON_LAYOUT = {};

const TimetableSelectable: React.FC<{
    class_: TimetableLessonEntry;
    selected: boolean;
}> = ({ class_, selected }) => {
    // console.log("timetable selectable rendering");
    const GRAY_BACKGROUND = useColorModeValue("gray.100", "gray.900");
    const HOVER_COLOR = useColorModeValue("blue.100", "blue.800");
    const BTN_COLOR_SCHEME = "blue";
    const TEXT_COLOR = useColorModeValue("black", "white");
    const [sel, setSel] = useBoolean(selected);

    // const showSmallerText = useBreakpointValue()

    const weeksDisplay = combineNumbersDatabase(class_.weeks);
    const changedClasses: string[] = useSelector(
        (state: RootState) => state.classesInfo.changedClasses
    );

    const dispatch = useDispatch();

    const toggleHandler = () => {
        // handleSelect(class_, !sel)
        dispatch(
            classesActions.updateChangedClasses({
                class_: class_,
                selected: !sel,
            })
        );
        // selectedHandler(class_, !sel);
        setSel.toggle();
    };

    // TODO: this piece of code causes EVERY SINGLE TimetableSelectable to re-render when the one is selected.
    // But, I don't think there's any better way to do this.
    // Maybe we only do it if there exists a class with multiple lessons?
    // We can check for the # of unique classNos vs the # of TimetableEntries
    useEffect(() => {
        if (changedClasses.includes(class_.classNo)) {
            setSel.on();
        } else {
            setSel.off();
        }
    }, [changedClasses]);

    return (
        <Center w="100%" h="100%">
            <Flex
                height="95%"
                transform={"scale(0.95)"}
                justifyContent={"center"}
                textAlign="center"
                w="100%"
            >
                <Button
                    size={"xs"}
                    w="100%"
                    h="100%"
                    justifyContent={"left"}
                    textAlign="left"
                    pl={{ base: 1, md: 2 }}
                    {...(sel
                        ? {
                              variant: "solid",
                              opacity: 1,
                              colorScheme: BTN_COLOR_SCHEME,
                          }
                        : {
                              bgColor: GRAY_BACKGROUND,
                              variant: "outline",
                              opacity: 0.7,
                              colorScheme: "grey",
                              _hover: {
                                  opacity: 1,
                                  bgColor: HOVER_COLOR,
                              },
                          })}
                    onClick={() => toggleHandler()}
                    overflow="hidden"
                >
                    <Flex flexWrap={"wrap"} alignItems="center">
                        <Text
                            // fontSize={{
                            //     base: "xs",
                            //     md: "md",
                            // }}
                            fontSize={{
                                base: "sm",
                                md: "2xl",
                            }}
                            fontWeight="semibold"
                            mr={2}
                        >
                            {class_.classNo}
                        </Text>
                        <Stack spacing={0}>
                            <Text
                                fontSize={{
                                    base: "0.65rem",
                                    md: "sm",
                                }}
                            >
                                {class_.venue}
                            </Text>
                            <Text
                                fontSize={{
                                    base: "0.65rem",
                                    md: "sm",
                                }}
                            >
                                Wks {weeksDisplay}{" "}
                            </Text>
                        </Stack>
                    </Flex>
                </Button>
            </Flex>{" "}
        </Center>
    );
};

export default React.memo(TimetableSelectable);
