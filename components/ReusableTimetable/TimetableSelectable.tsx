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
    // selected: boolean;
    property?: string;
    onSelected: (class_: TimetableLessonEntry, selected: boolean) => void;
    tinyMode?: boolean;
}> = ({ class_, property, onSelected, tinyMode = false }) => {
    // console.log("timetable selectable rendering");
    const GRAY_BACKGROUND = useColorModeValue("gray.100", "gray.900");
    const HOVER_COLOR = useColorModeValue("green.100", "green.800");
    const BTN_COLOR_SCHEME = "green";
    const TEXT_COLOR = useColorModeValue("black", "white");

    const [sel, setSel] = useBoolean(property === "selected");
    useEffect(() => {
        if (property === "selected") {
            setSel.on();
        } else {
            setSel.off();
        }
    }, [property]);
    // const showSmallerText = useBreakpointValue()

    const weeksDisplay = combineNumbersDatabase(class_.weeks);

    const toggleHandler = () => {
        // handleSelect(class_, !sel)
        // dispatch(
        //     classesActions.updateChangedClasses({
        //         class_: class_,
        //         selected: !sel,
        //     })
        // );
        // selectedHandler(class_, !sel);
        // setSel.toggle();
        onSelected(class_, !sel);
    };

    if (property === "readonly") {
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
                        opacity={1}
                        cursor="not-allowed"
                        colorScheme="red"
                    >
                        <Flex flexWrap={"wrap"} alignItems="center">
                            <Text
                                // fontSize={{
                                //     base: "xs",
                                //     md: "md",
                                // }}
                                fontSize={{
                                    base: "sm",
                                    md: tinyMode ? "sm" : "2xl",
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
                                        md: tinyMode ? "0.65rem" : "xs",
                                    }}
                                    fontWeight="light"
                                >
                                    {class_.venue}
                                </Text>
                                <Text
                                    fontSize={{
                                        base: "0.65rem",
                                        md: tinyMode ? "0.65rem" : "xs",
                                    }}
                                    fontWeight="light"
                                >
                                    Wks {weeksDisplay}{" "}
                                </Text>
                            </Stack>
                        </Flex>
                    </Button>
                </Flex>{" "}
            </Center>
        );
    }

    return (
        <Center w="100%" h="100%">
            <Flex
                height="95%"
                transform={"scale(0.95)"}
                justifyContent={"center"}
                textAlign="center"
                w="100%"
                maxWidth={"100%"}
            >
                <Button
                    size={"xs"}
                    w="100%"
                    h="100%"
                    justifyContent={"left"}
                    textAlign="left"
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
                >
                    <Flex flexWrap={"wrap"}>
                        <Text
                            // fontSize={{
                            //     base: "xs",
                            //     md: "md",
                            // }}
                            fontSize={{
                                base: "sm",
                                md: tinyMode ? "sm" : "2xl",
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
                                    md: tinyMode ? "0.65rem" : "xs",
                                }}
                                // fontWeight="light"
                            >
                                {class_.venue}
                            </Text>
                            <Text
                                fontSize={{
                                    base: "0.65rem",
                                    md: tinyMode ? "0.65rem" : "xs",
                                }}
                                // fontWeight="light"
                            >
                                Wks {weeksDisplay}{" "}
                            </Text>
                        </Stack>
                    </Flex>
                    {/* <Stack
                        direction={{
                            base: "column",
                            md: tinyMode ? "column" : "row",
                        }}
                        spacing={{
                            base: 0,
                            md: tinyMode ? 0 : 2,
                        }}
                        flexWrap="wrap"
                    >
                        <Text
                            // fontSize={{
                            //     base: "xs",
                            //     md: "md",
                            // }}
                            fontSize={{
                                base: "sm",
                                md: tinyMode ? "sm" : "2xl",
                            }}
                            fontWeight="semibold"
                        >
                            {class_.classNo}
                        </Text>
                        <Stack spacing={0}>
                            <Text
                                fontSize={{
                                    base: "0.65rem",
                                    md: tinyMode ? "0.65rem" : "sm",
                                }}
                            >
                                {class_.venue}
                            </Text>
                            <Text
                                fontSize={{
                                    base: "0.65rem",
                                    md: tinyMode ? "0.65rem" : "sm",
                                }}
                            >
                                Wks {weeksDisplay}{" "}
                            </Text>
                        </Stack>
                    </Stack> */}
                </Button>
            </Flex>{" "}
        </Center>
    );
};

export default React.memo(TimetableSelectable);
