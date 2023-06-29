import { Icon } from "@chakra-ui/icons";
import { Heading, Tag, Flex, Stack, Text, Box } from "@chakra-ui/react";
import {
    TbArrowDown,
    TbArrowsDownUp,
    TbChevronDownLeft,
    TbCornerDownRight,
} from "react-icons/tb";
import { HalfInfo, FullInfo } from "../../pages/swap/create";
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
}: {
    desiredModulesInfo?: HalfInfo[];
    desiredClassesInfo?: FullInfo[];
    currentClassInfo: FullInfo;

    onHover?: (class_: FullInfo | null) => void;
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
                    <Icon viewBox="0 0 200 200" color={`${"orange"}`} mr={1}>
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

                                        {desiredClasses?.map((c, i) => (
                                            <Text
                                                mr={1}
                                                onMouseEnter={() =>
                                                    onHover && onHover(c)
                                                }
                                                onMouseLeave={() =>
                                                    onHover && onHover(null)
                                                }
                                                borderBottom="1px dotted black"
                                                cursor="help"
                                            >
                                                {c.classNo}
                                                {desiredClasses?.length ===
                                                i + 1
                                                    ? ""
                                                    : ", "}{" "}
                                            </Text>
                                        ))}
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
