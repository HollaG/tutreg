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
import { TimetableLessonEntry } from "../../types/timetable";
import Timetable from "../ReusableTimetable/Timetable";
const CustomCardProps = {
    _hover: {
        boxShadow: "lg",
    },
    cursor: "pointer",
};

const SelfSwapCard: React.FC<{
    swap: ClassSwapRequest;
    user: TelegramUser | null | undefined;
    requestSwap: (
        swapId: number,
        user: TelegramUser | null,
        type: "request" | "remove"
    ) => any;
    hasRequestedSwap: string;
    swapData: SwapData | undefined;
    promptDelete: (swapId: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}> = ({ swap, user, requestSwap, hasRequestedSwap, swapData, promptDelete }) => {
    const state = useSelector((state: RootState) => state);
    const highlightedColor = useColorModeValue("green.200", "green.700");

    if (!swapData) return null;

    // TODO: I believe that using the Timetable component here is too difficult to read.
    // const requestedClasses = swapData.requestedClasses[swap.swapId].flatMap(class_ => swapData.classData.filter(c => c.classNo === class_.wantedClassNo && c.moduleCode === swap.moduleCode && c.lessonType === swap.lessonType));
    // const currentClasses = swapData.classData.filter(
    //     (class_) =>
    //         class_.classNo === swap.classNo &&
    //         class_.moduleCode === swap.moduleCode &&
    //         class_.lessonType === swap.lessonType
    // );

    // const requestedClassNos = requestedClasses.map(class_ => class_.classNo);
    // const currentClassNo  =swap.classNo

    // const lst: ClassOverview[] = [...requestedClasses, ...currentClasses]
    //     .map((class_) => {
    //         const classes_ = swapData.classData.filter(c => c.classNo === class_.classNo && c.moduleCode === class_.moduleCode && c.lessonType === class_.lessonType)
    //         return {
    //             classNo: class_.classNo,
    //             moduleCode: classes_[0].moduleCode,
    //             lessonType: classes_[0].lessonType,
    //             moduleName: classes_[0].moduleName,
    //             size: classes_[0].size,
    //             classes: classes_,
    //         };
    //     });

    // const getProperty = (class_: TimetableLessonEntry) => {
    //     if (requestedClassNos.includes(class_.classNo)) return "selected";
    //     else if (class_.classNo === currentClassNo) return "readonly";
    //     else return "";
    // };

    // console.log(lst)

    // console.log({requestedClasses, currentClasses})
    return (
        <NextLink passHref href={`/swap/${swap.swapId}`}>
            <Link style={{ textDecoration: "none" }}>
                <Card {...CustomCardProps}>
                    <Stack spacing={3}>
                        <Flex alignItems="center">
                            <HStack flex={1}>
                                <UserDisplay user={swap} />
                            </HStack>
                            <Button
                                size="sm"
                                colorScheme="red"
                                onClick={promptDelete(swap.swapId)}
                            >
                                {" "}
                                Delete{" "}
                            </Button>
                        </Flex>
                        <Center>
                            {swap.status === "Completed" ? (
                                <Tag colorScheme="green" variant="solid">
                                    {" "}
                                    Completed{" "}
                                </Tag>
                            ) : (
                                <Tag colorScheme="blue" variant="solid">
                                    Pending
                                </Tag>
                            )}
                        </Center>
                        <Divider />
                        <SwapEntry
                            title={`${swap.moduleCode}
                                                ${encodeLessonTypeToShorthand(
                                                    swap.lessonType
                                                )}
                                                [${swap.classNo}]`}
                            classNo={swap.classNo}
                            classes={
                                swapData.classData.filter(
                                    (class_) =>
                                        class_.classNo === swap.classNo &&
                                        class_.moduleCode === swap.moduleCode &&
                                        class_.lessonType === swap.lessonType
                                ) || []
                            }
                        />

                        <SwapArrows />
                        <SimpleGrid
                            columns={{
                                base: 1,
                                md: 2,
                            }}
                        >
                            {swapData.requestedClasses[swap.swapId].map(
                                (requestedClass, index3) => (
                                    <SwapEntry
                                        key={index3}
                                        classNo={requestedClass.wantedClassNo}
                                        classes={
                                            swapData.classData.filter(
                                                (class_) =>
                                                    class_.classNo ===
                                                        requestedClass.wantedClassNo &&
                                                    class_.moduleCode ===
                                                        swap.moduleCode &&
                                                    class_.lessonType ===
                                                        swap.lessonType
                                            ) || []
                                        }
                                        title={`${encodeLessonTypeToShorthand(
                                            swap.lessonType
                                        )}
                                                        [${
                                                            requestedClass.wantedClassNo
                                                        }]`}
                                    />
                                )
                            )}
                        </SimpleGrid>

                        {/* TODO: I believe that using the Timetable component here is too difficult to read. */}
                        {/* <Timetable classesToDraw={lst} onSelected={() => {}} property={getProperty} tinyMode={true}/> */}
                        <Divider />
                        <Flex justifyContent="space-between">
                            <HStack alignItems="center">
                                <TimeIcon />
                                <Text>
                                    {formatTimeElapsed(
                                        swap.createdAt.toString()
                                    )}
                                </Text>
                            </HStack>
                            <Badge colorScheme="orange" fontSize="1em">
                                {swap.moduleCode}
                            </Badge>
                        </Flex>
                    </Stack>
                </Card>
            </Link>
        </NextLink>
    );
};

export default SelfSwapCard;
