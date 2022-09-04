import { DeleteIcon } from "@chakra-ui/icons";
import { Flex, Box, Text, useColorModeValue } from "@chakra-ui/react";

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

const SwapEntry: React.FC<{
    classes: {
        day: string;
        startTime: string;
        endTime: string;
        lessonType: string;
        [key: string]: any;
    }[];

    title: string;
    classNo: string;

    deleteHandler?: (desiredClassNo: string) => void;
    canDelete?: boolean;
}> = ({
    classes,
    title,
    deleteHandler = (desiredClassNo) => {},
    classNo,
    canDelete = false,
}) => {
    const deleteIconColor = useColorModeValue("red.500", "red.500");

    return (
        <Entry>
            <Flex alignItems="center">
                <Box flex={1} mx={3}>
                    <Text fontWeight={"semibold"}>
                        {/* {getAlphabet(index || 0)}.{" "} */}
                        {title}
                    </Text>
                    {classes.map((classSel, index) => (
                        <Box key={index}>
                            <Text>
                                {DAY_MAP[classSel.day]} {classSel.startTime}-
                                {classSel.endTime}{" "}
                                {/* {showAdd && `(${classSel.venue})`} */}
                            </Text>
                        </Box>
                    ))}
                </Box>
                {canDelete && (
                    <DeleteIcon
                        cursor="pointer"
                        onClick={() => deleteHandler(classNo)}
                        color={deleteIconColor}
                    />
                )}
            </Flex>
        </Entry>
    );
};

export default SwapEntry;
