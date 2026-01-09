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
  property?: "readonly" | "selected" | "static";
  onSelected: (class_: TimetableLessonEntry, selected: boolean) => void;
  tinyMode?: boolean;
  selectedColor?: string; // possibility to override
  showModuleCode?: boolean;
  showLessonType?: boolean;

  getClassNames?: (class_: TimetableLessonEntry) => string;


  getOverrideColor?: (class_: TimetableLessonEntry) => string;
  getFillMode?: (class_: TimetableLessonEntry) => "solid" | "outline"
  getDisplayMode?: (class_: TimetableLessonEntry) => "detailed" | "compact" | "hidden"
}> = ({
  class_,
  property,
  onSelected,
  tinyMode = false,
  selectedColor = "teal",
  getOverrideColor,
  getDisplayMode,
  getFillMode,


  showModuleCode = false,
  showLessonType = false,
  getClassNames,
}) => {
    const BTN_COLOR_SCHEME = getOverrideColor
      ? getOverrideColor(class_)
      : selectedColor || "teal";

    const displayMode = getDisplayMode ? getDisplayMode(class_) : "detailed";
    const fillMode = getFillMode ? getFillMode(class_) : "solid";

    const GRAY_BACKGROUND = useColorModeValue("gray.100", "gray.900");

    const HOVER_COLOR = useColorModeValue(
      `${BTN_COLOR_SCHEME}.100`,
      `${BTN_COLOR_SCHEME}.800`
    );
    // const BTN_COLOR_SCHEME = "purple";
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

    const STATIC_STRIPED_BG_COLOR = useColorModeValue(
      'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 11px)',
      'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.2) 10px, rgba(255,255,255,0.2) 11px)'
    )

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
              colorScheme={"orange"}
              // infinitely growing and shrinking
              // className="pulse"
              className={getClassNames ? getClassNames(class_) : ""}
            >
              <Stack spacing={0}>
                {(showModuleCode || showLessonType) && (
                  <Text fontSize={{ base: "xs", md: "sm" }}>
                    {showModuleCode ? class_.moduleCode : ""}{" "}
                    {showLessonType
                      ? encodeLessonTypeToShorthand(
                        class_.lessonType
                      )
                      : ""}
                  </Text>
                )}
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
              </Stack>
            </Button>
          </Flex>{" "}
        </Center>
      );
    }

    // STATIC property: display ALL information, NO matter the extra params
    if (property === "static") {

      return (
        <Center w="100%" h="100%">
          <Flex
            height="95%"
            transform={"scale(0.95)"}
            justifyContent={"center"}
            textAlign="center"
            w="100%"
            position="relative"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              backgroundImage={STATIC_STRIPED_BG_COLOR}
              // pointerEvents="none"
              borderRadius="md"

              // we want the "button" look, but not block clicks
              // cannot put the onClick in the Button as that would trigger the hover animation
              // TODO: implement a specific variable to manage this behaviour
              onClick={() => toggleHandler()}
              cursor={'pointer'}

            />
            <Button
              pointerEvents={'none'}
              size={"xs"}
              w="100%"
              h="100%"
              justifyContent={"left"}
              textAlign="left"
              pl={{ base: 1, md: 2 }}
              // cursor="not-allowed"
              position="relative"
              {...({
                variant: "outline",
                opacity: 1,
                colorScheme: BTN_COLOR_SCHEME,
              }
              )}
              overflow="hidden"
            >
              <Flex flexWrap={"wrap"} alignItems="center">

                {/* <Text
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
                </Text> */}
                <Stack spacing={0}>
                  {(showModuleCode || showLessonType) && (
                    <Text fontSize={{ base: "xs", md: "sm" }}>
                      {showModuleCode ? class_.moduleCode : ""}{" "}
                      {showLessonType
                        ? encodeLessonTypeToShorthand(
                          class_.lessonType
                        )
                        : ""}
                    </Text>
                  )}
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
                    {displayMode === "detailed" ? <Stack spacing={0}>
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
                    </Stack> : null}
                  </Flex>
                </Stack>
              </Flex>
            </Button>
          </Flex>{" "}
        </Center>
      );
    }

    const btnProps = sel
      ? {
        variant: fillMode,
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
      }

    return (
      <Center w="100%" h={"100%"}>
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
            {...(btnProps)}
            onClick={() => toggleHandler()}
            className={getClassNames ? getClassNames(class_) : ""}
          >
            <Stack spacing={0}>
              {(showModuleCode || showLessonType) && (
                <Text fontSize={{ base: "xs", md: "sm" }}>
                  {showModuleCode ? class_.moduleCode : ""}{" "}
                  {showLessonType
                    ? encodeLessonTypeToShorthand(
                      class_.lessonType
                    )
                    : ""}
                </Text>
              )}
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
                {displayMode === "detailed" ? <Stack spacing={0}>
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
                </Stack> : null}
              </Flex>
            </Stack>
          </Button>
        </Flex>{" "}
      </Center>
    );
  };

export default React.memo(TimetableSelectable);

export const ExampleTimetableSelectableStatic: React.FC = () => {

  const STATIC_STRIPED_BG_COLOR = useColorModeValue(
    'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 11px)',
    'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.2) 10px, rgba(255,255,255,0.2) 11px)'
  )
  return (
    <Flex
      height="95%"
      transform={"scale(0.95)"}
      justifyContent={"center"}
      textAlign="center"
      w="100%"
      position="relative"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundImage={STATIC_STRIPED_BG_COLOR}
        pointerEvents="none"
        borderRadius="md"
      />
      <Button
        pointerEvents={'none'}
        size={"xs"}
        w="100%"
        h="100%"
        justifyContent={"left"}
        textAlign="left"
        pl={{ base: 1, md: 2 }}
        cursor="not-allowed"
        position="relative"
        {...({
          variant: "outline",
          opacity: 1,
          colorScheme: 'blue',
        }
        )}
        // onClick={() => toggleHandler()}
        overflow="hidden"
      // height={16}
      >

      </Button>
    </Flex>
  )
}
