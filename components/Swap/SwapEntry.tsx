import { DeleteIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import {
    Flex,
    Box,
    Text,
    useColorModeValue,
    HTMLChakraProps,
    ChakraProps,
    Link,
    Badge,
} from "@chakra-ui/react";

import { keepAndCapFirstThree } from "../../lib/functions";
import Entry from "../Sortables/Entry";
const DAY_MAP: { [key: string]: any } = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
};

interface SwapEntryProps extends ChakraProps {
    classes: {
        day: string;
        startTime: string;
        endTime: string;
        lessonType: string;
        [key: string]: any;
    }[];

    title: string;
    link?: string; // for optional link to external website in title
    badge?: string; // for optional badge in right side of text
    classNo: string;

    deleteHandler?: (desiredClassNo: string) => void;
    canDelete?: boolean;
}

const SwapEntry: React.FC<SwapEntryProps> = ({
    classes,
    title,
    link,
    badge,
    deleteHandler = (desiredClassNo) => {},
    classNo,
    canDelete = false,

    bgColor,
}) => {
    const deleteIconColor = useColorModeValue("red.500", "red.500");

    return (
        <Entry bgColor={bgColor}>
            <Flex alignItems="center">
                
                <Box flex={1} mx={3}>
                    {link ? (
                        <Link
                            isExternal
                            href={link}
                            display="flex"
                            alignItems="center"
                        >
                            <Text mr={2} fontWeight={"semibold"}>
                                {title}
                            </Text>
                            <ExternalLinkIcon />
                        </Link>
                    ) : (
                        <Text fontWeight={"semibold"}>{title}</Text>
                    )}

                    {classes ? (
                        classes.map((classSel, index) => (
                            <Box key={index}>
                                <Text>
                                    {DAY_MAP[classSel.day]} {classSel.startTime}
                                    -{classSel.endTime}{" "}
                                    {/* {showAdd && `(${classSel.venue})`} */}
                                </Text>
                            </Box>
                        ))
                    ) : (
                        <> No info! </>
                    )}
                </Box>
                {canDelete && (
                    <DeleteIcon
                        cursor="pointer"
                        onClick={() => deleteHandler(classNo)}
                        color={deleteIconColor}
                    />
                )}
                {badge && (
                    <Badge colorScheme="orange" fontSize="1.25em">
                        {badge}
                    </Badge>
                )}
            </Flex>
        </Entry>
    );
};

export default SwapEntry;
