import { DeleteIcon, DragHandleIcon } from "@chakra-ui/icons";
import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { useCallback, useEffect } from "react";
import { arrayMove, arrayRemove, List } from "react-movable";
import { useDispatch, useSelector } from "react-redux";
import {
    getAlphabet,
    encodeLessonTypeToShorthand,
} from "../../../lib/functions";
import { classesActions } from "../../../store/classesReducer";
import { ClassOverview, RootState } from "../../../types/types";
import Entry from "../Entry";

const ClassList: React.FC<{
    moduleCodeLessonType: string;
    showAdd: boolean;
}> = ({ moduleCodeLessonType, showAdd }) => {
    const data = useSelector((state: RootState) => state.classesInfo);
    const dispatch = useDispatch();
    const dragHandler = ({
        oldIndex,
        newIndex,
    }: {
        oldIndex: number;
        newIndex: number;
    }) => {
        if (newIndex === -1) {
            // drag out of bounds, delete
            dispatch(
                classesActions.removeSelectedClass({
                    moduleCodeLessonType,
                    classNo:
                        data.selectedClasses[moduleCodeLessonType][oldIndex]
                            .classNo,
                })
            );
        } else {
            dispatch(
                classesActions.changeClassOrder({
                    newOrder: arrayMove(
                        data.selectedClasses[moduleCodeLessonType],
                        oldIndex,
                        newIndex
                    ),
                    moduleCodeLessonType,
                })
            );
        }
    };

    const dragColor = useColorModeValue("gray.200", "gray.400");
    const deleteColor = useColorModeValue("red.300", "red.500");

    const deleteHandler = (moduleData: ClassOverview) => {
        dispatch(
            classesActions.removeSelectedClass({
                classNo: moduleData.classNo,
                moduleCodeLessonType,
            })
        );
    };

    const deleteIconColor = useColorModeValue("red.500", "red.500");

    return (
        <List
            removableByMove
            values={data.selectedClasses[moduleCodeLessonType] || []}
            onChange={dragHandler}
            renderList={({ children, props, isDragged }) => (
                <Box {...props} className={isDragged ? "drag" : "static"}>
                    {children}
                </Box>
            )}
            renderItem={({
                value: moduleData,
                index,
                props,
                isDragged,
                isSelected,
                isOutOfBounds,
            }) => (
                <Box {...props} key={index} borderRadius="md">
                    <Entry
                        // bgColor={
                        //     isSelected || isDragged
                        //         ? isOutOfBounds
                        //             ? deleteColor
                        //             : dragColor
                        //         : undefined
                        // }
                        // key={index}
                        // {...props}
                        dragProps={{
                            isSelected,
                            isDragged,
                            isOutOfBounds,
                        }}
                    >
                        <Flex alignItems="center">
                            <Flex
                                flex={1}
                                data-movable-handle
                                cursor={isDragged ? "grabbing" : "grab"}
                                alignItems="center"
                            >
                                <DragHandleIcon tabIndex={-1} />
                                <Box
                                    flex={1}
                                    mx={3}
                                    data-movable-handle
                                    cursor={isDragged ? "grabbing" : "grab"}
                                >
                                    <Text fontWeight={"semibold"}>
                                        {/* {getAlphabet(index || 0)}.{" "} */}
                                        {/* {(index || 0) + 1}.{" "} */}
                                        {encodeLessonTypeToShorthand(
                                            moduleData?.lessonType || ""
                                        )}{" "}
                                        [{moduleData?.classNo}]
                                    </Text>
                                    {(moduleData?.classes || []).map(
                                        (classSel, index) => (
                                            <Box key={index}>
                                                <Text>
                                                    {classSel.day}{" "}
                                                    {classSel.startTime}-
                                                    {classSel.endTime}{" "}
                                                    {showAdd &&
                                                        `@ ${classSel.venue}`}
                                                </Text>
                                            </Box>
                                        )
                                    )}
                                </Box>
                            </Flex>
                            <DeleteIcon
                                cursor="pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteHandler(moduleData);
                                }}
                                color={deleteIconColor}
                                focusable
                            />
                        </Flex>
                    </Entry>
                </Box>
            )}
        />
    );
};

export default ClassList;
