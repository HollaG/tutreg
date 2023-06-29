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
    perspective = "self",
}: {
    desiredModulesInfo?: HalfInfo[];
    desiredClassesInfo?: FullInfo[];
    currentClassInfo: FullInfo;
    perspective?: "self" | "other";
}) => {
    return !desiredModulesInfo ? (
        <Heading fontSize="2xl" display="flex" alignItems="center">
            {/* <Icon
                        viewBox="0 0 200 200"
                        color={`${CURRENT_CLASS_COLOR}`}
                        mr={1}
                    >
                        <path
                            fill="currentColor"
                            d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
                        />
                    </Icon> */}
            <Tag mr={2} colorScheme="orange">
                {perspective === "self" ? "Yours" : "Theirs"}
            </Tag>
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
                    {/* <Tag mr={2} colorScheme="orange">
                        {perspective === "self" ? "Yours" : "Theirs"}
                    </Tag> */}
                    {currentClassInfo.moduleCode}: {currentClassInfo.lessonType}{" "}
                    [{currentClassInfo.classNo}]
                </Heading>

                {/* <TbArrowsDownUp fontSize="2em" /> */}
                <Flex>
                    <SwapArrows />
                </Flex>
                <Flex>
                    <Box>
                        {/* <Tag mr={2} colorScheme="teal">
                            {perspective === "self" ? "Theirs" : "Yours"}
                        </Tag> */}
                    </Box>
                    <Flex flexWrap={"wrap"}>
                        {desiredModulesInfo.map((desiredModule, i) => (
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
                                <Flex ml={0.5} alignItems="center">
                                    <TbChevronDownLeft />
                                    <Text ml={1}>
                                        {desiredClassesInfo
                                            ?.filter(
                                                (desiredClass) =>
                                                    desiredClass.lessonType ===
                                                        desiredModule.lessonType &&
                                                    desiredClass.moduleCode ===
                                                        desiredModule.moduleCode
                                            )
                                            .map((c) => c.classNo)
                                            .join(", ")}
                                    </Text>
                                </Flex>
                            </Box>
                        ))}
                    </Flex>
                </Flex>
            </Stack>
        </Flex>
    );
};

export default SwapCodeIndicator;
