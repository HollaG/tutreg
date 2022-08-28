import { DragHandleIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, Flex, useColorModeValue, Text } from "@chakra-ui/react";
import { Dispatch, SetStateAction } from "react";
import { arrayMove, arrayRemove, List } from "react-movable";
import { keepAndCapFirstThree } from "../../lib/functions";
import { GroupedByClassNo } from "../../pages/api/swap/getClasses";
import { classesActions } from "../../store/classesReducer";
import { ClassOverview } from "../../types/types";
import Entry from "../Sortables/Entry";

const OrderSwapPriorityList: React.FC<{
    enabled: boolean,
    desiredClasses: (string | number)[];
    setDesiredClasses: Dispatch<SetStateAction<(string | number)[]>>;
    classes: GroupedByClassNo;
}> = ({ desiredClasses, setDesiredClasses, classes, enabled }) => {
    const dragHandler = ({
        oldIndex,
        newIndex,
    }: {
        oldIndex: number;
        newIndex: number;
    }) => {
        if (newIndex === -1) {
            // drag out of bounds, delete
            setDesiredClasses((prevState) => arrayRemove(prevState, oldIndex));
        } else {
            setDesiredClasses((prevState) =>
                arrayMove(prevState, oldIndex, newIndex)
            );
        }
    };

    const dragColor = useColorModeValue("gray.200", "gray.400");
    const deleteColor = useColorModeValue("red.300", "red.500");

    const deleteIconColor = useColorModeValue("red.500", "red.500");

    const deleteHandler = (desiredClassNo: string|number) => {}

    return (
        <List
        
            removableByMove
            values={desiredClasses || []}
            onChange={dragHandler}
            renderList={({ children, props, isDragged }) => (
                <Box cursor={isDragged ? "grabbing" : "inherit"} {...props}>
                    {children}
                </Box>
            )}
            renderItem={({
                value: desiredClassNo,
                index,
                props,
                isDragged,
                isSelected,
                isOutOfBounds,
            }) => (
                <Entry
                    bgColor={
                        isSelected || isDragged
                            ? isOutOfBounds
                                ? deleteColor
                                : dragColor
                            : undefined
                    }
                    key={index}
                    {...props}
                    pointerEvents={enabled ? undefined : "none"}
                >
                    <Flex alignItems="center">
                        {enabled && <DragHandleIcon
                            data-movable-handle
                            cursor={isDragged ? "grabbing" : "grab"}
                            tabIndex={-1}
                        />}
                        <Box flex={1} mx={3}>
                            <Text fontWeight={"semibold"}>
                                {/* {getAlphabet(index || 0)}.{" "} */}
                                {enabled && `${(index || 0) + 1}.`}{" "}
                                {keepAndCapFirstThree(
                                    classes[desiredClassNo][0]?.lessonType || ""
                                )}{" "}
                                [{desiredClassNo}]
                            </Text>
                            {(classes[desiredClassNo]).map(
                                (classSel, index) => (
                                    <Box key={index}>
                                        <Text>
                                            {classSel.day} {classSel.startTime}-
                                            {classSel.endTime}{" "}
                                            {/* {showAdd && `(${classSel.venue})`} */}
                                        </Text>
                                    </Box>
                                )
                            )}
                        </Box>
                        <DeleteIcon
                            cursor="pointer"
                            onClick={() => deleteHandler(desiredClassNo)}
                            color={deleteIconColor}
                        />
                    </Flex>
                </Entry>
            )}
        />
    );
};

export default OrderSwapPriorityList;
