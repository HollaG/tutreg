import { DeleteIcon, DragHandleIcon } from "@chakra-ui/icons";
import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { useCallback, useEffect } from "react";
import { arrayMove, arrayRemove, List } from "react-movable";
import { useDispatch, useSelector } from "react-redux";
import { getAlphabet, encodeLessonTypeToShorthand } from "../../../lib/functions";
import { classesActions } from "../../../store/classesReducer";
import { ClassOverview, RootState } from "../../../types/types";
import Entry from "../Entry";

const ClassList: React.FC<{
    moduleCodeLessonType: string;
    showAdd: boolean
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

    // Calculate if this class conflicts with any other classes
    // const unavailableTimings = {}

    // useEffect(() => {
    //     console.log("hellol")
    //     let timings: {[key:string]: any} = {
    //         "Monday": [],
    //         "Tuesday": [],
    //         "Wednesday": [],
    //         "Thursday": [],
    //         "Friday": [],
    //         "Saturday": [],
    //         "Sunday": [],
    //     }

    //     const takenClasses = {...data.selectedClasses, ...data.nonBiddable}
    //     if (!takenClasses) return
       

    //     for (const moduleCodeLessonType in takenClasses) { 
    //         let classesSelected = takenClasses[moduleCodeLessonType]
    //         for (const classes_ of classesSelected) {
    //             for (const class_ of classes_.classes) { 
    //                 timings[class_.day].push(class_)
    //             }
    //         }
    //     }

        
    //     // check if any classes are conflicting

    // }, [data])

    return (
        <List
            removableByMove
            
            values={data.selectedClasses[moduleCodeLessonType] || []}
            onChange={dragHandler}
            renderList={({ children, props, isDragged }) => (
                <Box cursor={isDragged ? "grabbing" : "inherit"} {...props}>
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
                >
                    <Flex alignItems="center">
                        <DragHandleIcon
                            data-movable-handle
                            cursor={isDragged ? "grabbing" : "grab"}
                            tabIndex={-1}
                        />
                        <Box flex={1} mx={3}>
                            <Text fontWeight={"semibold"}>
                                {/* {getAlphabet(index || 0)}.{" "} */}
                                {(index||0)+1}.{" "}
                                {encodeLessonTypeToShorthand(moduleData?.lessonType || "")} [
                                {moduleData?.classNo}]
                            </Text>
                            {(moduleData?.classes || []).map(
                                (classSel, index) => (
                                    <Box key={index}>
                                        <Text>
                                            {classSel.day} {classSel.startTime}-
                                            {classSel.endTime} {showAdd && `(${classSel.venue})`}
                                        </Text>
                                    </Box>
                                )
                            )}
                        </Box>
                        <DeleteIcon
                            cursor="pointer"
                            onClick={() => deleteHandler(moduleData)}
                            color={deleteIconColor}
                        />
                    </Flex>
                </Entry>
            )}
        />
    );
};

export default ClassList;
