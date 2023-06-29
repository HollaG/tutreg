import { TimeIcon } from "@chakra-ui/icons";
import {
    Badge,
    Button,
    Center,
    Divider,
    Flex,
    HStack,
    Link,
    SimpleGrid,
    Stack,
    Tag,
    useColorModeValue,
    Text,
    Box,
} from "@chakra-ui/react";
import {
    cleanArrayString,
    encodeLessonTypeToShorthand,
    formatTimeElapsed,
} from "../../lib/functions";
import swap from "../../pages/swap";
import user from "../../store/user";
import Card from "../Card/Card";
import UserDisplay from "../User/UserDisplay";
import SwapArrows from "./SwapArrows";
import SwapEntry from "./SwapEntry";
import NextLink from "next/link";
import { ClassOverview, ClassSwapRequest, RootState } from "../../types/types";
import { TelegramUser } from "telegram-login-button";
import { useSelector } from "react-redux";
import { SwapData } from "../../pages/api/swap";
import Timetable from "../ReusableTimetable/Timetable";
import SwapCodeIndicator from "./SwapModuleCodeIndicator";
import { GetSwapClassesData } from "../../pages/api/swap/[swapId]";
const CustomCardProps = {
    _hover: {
        boxShadow: "lg",
    },
    cursor: "pointer",
};

const SwapCard: React.FC<{
    swap: ClassSwapRequest;
    user: TelegramUser | null | undefined;
    // requestSwap: (
    //     swapId: number,
    //     user: TelegramUser | null,
    //     type: "request" | "remove"
    // ) => any;
    // hasRequestedSwap: string;
    swapData: GetSwapClassesData;

    RequestButton: React.ReactElement;
}> = ({
    swap,
    user,
    // requestSwap,
    // hasRequestedSwap,
    swapData,
    RequestButton,
}) => {
    const state = useSelector((state: RootState) => state);
    const highlightedColor = useColorModeValue("green.200", "green.700");

    if (!swapData) return null;

    return (
        <NextLink href={`/swap/${swap.swapId}`}>
            <Link
                style={{
                    textDecoration: "none",
                }}
            >
                <Flex justifyContent={"space-between"}>
                    <Flex alignItems={"center"}>
                        <UserDisplay swap={swap} />
                        {RequestButton}
                    </Flex>
                    <Text fontSize="sm" fontWeight="semibold">
                        {formatTimeElapsed(swap.createdAt.toString())}
                    </Text>
                </Flex>
                <Box p={4}>
                    <SwapCodeIndicator
                        currentClassInfo={swapData.currentClassInfo}
                        desiredClassesInfo={swapData.desiredClasses}
                        desiredModulesInfo={swapData.desiredModules}
                        drawnClasses={swapData.drawnClasses}
                    />
                </Box>
            </Link>
        </NextLink>
    );

    // return (
    //     <NextLink href={`/swap/${swap.swapId}`}>
    //         <Link
    //             style={{
    //                 textDecoration: "none",
    //             }}
    //         >
    //             <Card {...CustomCardProps}>
    //                 <Stack spacing={3}>
    //                     <Flex
    //                         alignItems="center"
    //                         justifyContent="space-between"
    //                     >
    //                         <HStack>
    //                             <HStack flex={1}>
    //                                 <UserDisplay user={swap} />
    //                             </HStack>
    //                         </HStack>

    //                         {cleanArrayString(swap.requestors).includes(
    //                             user?.id.toString() || ""
    //                         ) ? (
    //                             <Button
    //                                 size="sm"
    //                                 colorScheme="blue"
    //                                 onClick={requestSwap(
    //                                     swap.swapId,
    //                                     user || null,
    //                                     "remove"
    //                                 )}
    //                                 disabled={
    //                                     hasRequestedSwap === "Unrequested!"
    //                                 }
    //                             >
    //                                 {!user
    //                                     ? "Request"
    //                                     : hasRequestedSwap || "Unrequest"}
    //                             </Button>
    //                         ) : (
    //                             <Button
    //                                 size="sm"
    //                                 colorScheme="blue"
    //                                 onClick={requestSwap(
    //                                     swap.swapId,
    //                                     user || null,
    //                                     "request"
    //                                 )}
    //                                 disabled={hasRequestedSwap === "Requested!"}
    //                             >
    //                                 {hasRequestedSwap === "Requested!" ||
    //                                     "Request"}
    //                             </Button>
    //                         )}
    //                     </Flex>
    //                     <Center>
    //                         {user &&
    //                             cleanArrayString(swap.requestors).includes(
    //                                 user?.id.toString() || ""
    //                             ) && (
    //                                 <Tag colorScheme="green" variant="solid">
    //                                     {" "}
    //                                     Requested{" "}
    //                                 </Tag>
    //                             )}
    //                     </Center>
    //                     <Divider />

    //                     <SwapEntry
    //                         // badge="PS1101E"
    //                         bgColor={
    //                             state.misc.highlightedClassNos.includes(
    //                                 swap.classNo
    //                             )
    //                                 ? highlightedColor
    //                                 : undefined
    //                         }
    //                         title={`${swap.moduleCode}
    // ${encodeLessonTypeToShorthand(swap.lessonType)}
    // [${swap.classNo}]`}
    //                         classNo={swap.classNo}
    //                         classes={
    //                             swapData.classData.filter(
    //                                 (class_) =>
    //                                     class_.classNo === swap.classNo &&
    //                                     class_.moduleCode === swap.moduleCode &&
    //                                     class_.lessonType === swap.lessonType
    //                             ) || []
    //                         }
    //                     />
    //                     <SwapArrows />
    //                     <SimpleGrid
    //                         columns={{
    //                             base: 2,
    //                             // sm: 3,
    //                             // lg: 4,
    //                         }}
    //                     >
    //                         {swapData.requestedClasses[swap.swapId].map(
    //                             (requestedClass, index3) => (
    //                                 <SwapEntry
    //                                     bgColor={
    //                                         state.misc.highlightedClassNos.includes(
    //                                             requestedClass.wantedClassNo
    //                                         )
    //                                             ? highlightedColor
    //                                             : undefined
    //                                     }
    //                                     key={index3}
    //                                     classNo={requestedClass.wantedClassNo}
    //                                     classes={
    //                                         swapData.classData.filter(
    //                                             (class_) =>
    //                                                 class_.classNo ===
    //                                                     requestedClass.wantedClassNo &&
    //                                                 class_.moduleCode ===
    //                                                     swap.moduleCode &&
    //                                                 class_.lessonType ===
    //                                                     swap.lessonType
    //                                         ) || []
    //                                     }
    //                                     title={`${encodeLessonTypeToShorthand(
    //                                         swap.lessonType
    //                                     )}
    //             [${requestedClass.wantedClassNo}]`}
    //                                 />
    //                             )
    //                         )}
    //                     </SimpleGrid>

    //                     <Divider />
    //                     <Flex justifyContent="space-between">
    //                         <HStack
    //                             alignItems="center"
    //                             // justifyContent="center"
    //                         >
    //                             <TimeIcon />
    //                             <Text>
    //                                 {formatTimeElapsed(
    //                                     swap.createdAt.toString()
    //                                 )}
    //                             </Text>
    //                         </HStack>{" "}
    //                         <Badge colorScheme="orange" fontSize="1em">
    //                             {swap.moduleCode}
    //                         </Badge>
    //                     </Flex>
    //                 </Stack>
    //             </Card>
    //         </Link>
    //     </NextLink>
    // );
};

export default SwapCard;
