import { Icon } from "@chakra-ui/icons";
import {
    Heading,
    Tag,
    Flex,
    Stack,
    Text,
    Box,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
    useColorModeValue,
} from "@chakra-ui/react";
import {
    TbArrowDown,
    TbArrowsDownUp,
    TbChevronDownLeft,
    TbCornerDownRight,
} from "react-icons/tb";
import { convertDayToAbbrev } from "../../lib/functions";
import { HalfInfo, FullInfo } from "../../pages/swap/create";
import { ClassOverview } from "../../types/types";
import SwapArrows from "./SwapArrows";

/**
 * Lists the modules that the user has selected to swap with
 *
 * @param desiredModulesInfo The desired modules to swap to
 * @param currentClassInfo The current class that the user is in
 * @returns React component
 */
const SwapCodeIndicator = ({
    desiredModulesInfo,
    currentClassInfo,
    desiredClassesInfo,

    onHover,
    drawnClasses,
}: {
    desiredModulesInfo?: HalfInfo[];
    desiredClassesInfo?: FullInfo[];
    currentClassInfo: FullInfo;

    // hovering over each class
    onHover?: (class_: FullInfo | null) => void;

    // if supplied, will show additional info in the popup
    drawnClasses?: ClassOverview[];
}) => {
    return !desiredModulesInfo ? (
        <Heading fontSize="2xl" display="flex" alignItems="center">
            <Icon viewBox="0 0 200 200" color={`${"orange.500"}`} mr={1}>
                <path
                    fill="currentColor"
                    d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
                />
            </Icon>
            {currentClassInfo.moduleCode}: {currentClassInfo.lessonType}
        </Heading>
    ) : (
        <Flex justifyContent={"left"}>
            <Stack flexWrap="wrap">
                <Heading fontSize="2xl" display="flex" alignItems="center">
                    <Icon
                        viewBox="0 0 200 200"
                        color={`${"orange.500"}`}
                        mr={1}
                    >
                        <path
                            fill="currentColor"
                            d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
                        />
                    </Icon>
                    {currentClassInfo.moduleCode}: {currentClassInfo.lessonType}{" "}
                    [{currentClassInfo.classNo}]
                </Heading>

                {/* <TbArrowsDownUp fontSize="2em" /> */}
                <Flex>
                    <SwapArrows />
                </Flex>
                <Flex>
                    <Box></Box>
                    <Flex flexWrap={"wrap"}>
                        {desiredModulesInfo.map((desiredModule, i) => {
                            const desiredClasses = desiredClassesInfo?.filter(
                                (desiredClass) =>
                                    desiredClass.lessonType ===
                                        desiredModule.lessonType &&
                                    desiredClass.moduleCode ===
                                        desiredModule.moduleCode
                            );
                            return (
                                <Box mb={2} mr={3}>
                                    <Text
                                        display="flex"
                                        alignItems="center"
                                        key={i}
                                    >
                                        <Icon
                                            viewBox="0 0 200 200"
                                            color={`${"teal"}`}
                                            mr={1}
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
                                            />
                                        </Icon>
                                        {desiredModule.moduleCode}:{" "}
                                        {desiredModule.lessonType}
                                    </Text>
                                    <Flex
                                        ml={0.5}
                                        alignItems="center"
                                        flexWrap={"wrap"}
                                    >
                                        <TbChevronDownLeft />

                                        {desiredClasses?.map((dc, i) => {
                                            const thisClassFullInfo =
                                                drawnClasses?.find(
                                                    (c) =>
                                                        c.classNo ===
                                                            dc.classNo &&
                                                        c.lessonType ===
                                                            dc.lessonType &&
                                                        c.moduleCode ===
                                                            dc.moduleCode
                                                );
                                            return (
                                                <Popover>
                                                    <PopoverTrigger>
                                                        <Text
                                                            mr={1}
                                                            onMouseEnter={() =>
                                                                onHover &&
                                                                onHover(dc)
                                                            }
                                                            onMouseLeave={() =>
                                                                onHover &&
                                                                onHover(null)
                                                            }
                                                            borderBottom="1px dotted"
                                                            borderBottomColor={useColorModeValue(
                                                                "black",
                                                                "white"
                                                            )}
                                                            cursor="help"
                                                        >
                                                            {dc.classNo}
                                                            {desiredClasses?.length ===
                                                            i + 1
                                                                ? ""
                                                                : ", "}{" "}
                                                        </Text>
                                                    </PopoverTrigger>
                                                    <PopoverContent>
                                                        <PopoverArrow />

                                                        <PopoverBody>
                                                            <Stack spacing={1}>
                                                                {thisClassFullInfo &&
                                                                    thisClassFullInfo.classes.map(
                                                                        (
                                                                            c,
                                                                            i
                                                                        ) => (
                                                                            <Text
                                                                                key={
                                                                                    i
                                                                                }
                                                                            >
                                                                                {convertDayToAbbrev(
                                                                                    c.day
                                                                                )}{" "}
                                                                                {
                                                                                    c.startTime
                                                                                }{" "}
                                                                                -{" "}
                                                                                {
                                                                                    c.endTime
                                                                                }{" "}
                                                                                @{" "}
                                                                                {
                                                                                    c.venue
                                                                                }
                                                                            </Text>
                                                                        )
                                                                    )}{" "}
                                                            </Stack>
                                                        </PopoverBody>
                                                    </PopoverContent>
                                                </Popover>
                                            );
                                        })}
                                    </Flex>
                                </Box>
                            );
                        })}
                    </Flex>
                </Flex>
            </Stack>
        </Flex>
    );
};

export default SwapCodeIndicator;
