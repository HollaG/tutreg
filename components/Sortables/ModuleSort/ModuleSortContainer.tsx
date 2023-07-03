import { DeleteIcon, DragHandleIcon } from "@chakra-ui/icons";
import {
    Box,
    Center,
    Container,
    Flex,
    Heading,
    Icon,
    SimpleGrid,
    Stack,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import { arrayMove, arrayRemove, List } from "react-movable";
import { useDispatch, useSelector } from "react-redux";
import { ReactSortable } from "react-sortablejs";
import {
    getModuleColor,
    getVacanciesForAllLessons,
} from "../../../lib/functions";
import { classesActions } from "../../../store/classesReducer";
import { RootState } from "../../../types/types";
import Card from "../../Card/Card";
import Entry from "../Entry";

const ModuleSortContainer: React.FC<{ showAdditionalDetails: boolean }> = ({
    showAdditionalDetails,
}) => {
    const data = useSelector((state: RootState) => state.classesInfo);

    const dispatch = useDispatch();

    // const [modulesState, setModulesState] = useState<any[]>()

    const [modulesList, setModulesList] = useState<
        {
            id: number;
            name: string;
        }[]
    >([]);

    const [initialPop, setInitialPop] = useState<boolean>(false);
    useEffect(() => {
        if (!data.moduleOrder?.length) return setModulesList([]);
        const modulesList = (data.moduleOrder || []).map((selClass, index) => ({
            id: index,
            name: selClass,
        }));
        setModulesList(modulesList);

        if (!initialPop) {
            setInitialPop(true);
        }

        console.log("useeffect in modulesort");
    }, [data.moduleOrder, initialPop]);

    const dragHandler = ({
        oldIndex,
        newIndex,
    }: {
        oldIndex: number;
        newIndex: number;
    }) => {
        if (newIndex === -1) {
            // drag out of bounds, delete
            dispatch(classesActions.removeModule(data.moduleOrder[oldIndex]));
        } else {
            dispatch(
                classesActions.changeModuleCodeLessonTypeOrder(
                    arrayMove(data.moduleOrder, oldIndex, newIndex)
                )
            );
        }
    };

    const deleteModule = (moduleCodeLessonType: string) => {
        dispatch(classesActions.removeModule(moduleCodeLessonType));
    };

    const dragColor = useColorModeValue("gray.100", "gray.700");
    const deleteColor = useColorModeValue("red.300", "red.500");
    const deleteIconColor = useColorModeValue("red.500", "red.500");

    return (
        <Stack spacing={3}>
            <List
                removableByMove
                values={modulesList.map((module) => module.name)}
                onChange={dragHandler}
                renderList={({ children, props, isDragged }) => (
                    <Box {...props} className={isDragged ? "drag" : "static"}>
                        {children}
                    </Box>
                )}
                renderItem={({
                    value,
                    index,
                    props,
                    isDragged,
                    isSelected,
                    isOutOfBounds,
                }) => (
                    <Box {...props} key={value} borderRadius="md">
                        <Entry
                            key={value}
                            // boxShadow={
                            //     isSelected || isDragged
                            //         ? "rgba(0, 0, 0, 0.2) 0px 4px 13px -3px"
                            //         : ""
                            // }
                            // key={value}
                            dragProps={{
                                isSelected,
                                isDragged,
                                isOutOfBounds,
                            }}
                        >
                            <Flex alignItems="center">
                                <Flex
                                    alignItems={"center"}
                                    data-movable-handle
                                    cursor={isDragged ? "grabbing" : "grab"}
                                    flex={1}
                                >
                                    <DragHandleIcon tabIndex={-1} />
                                    <Box mx={3}>
                                        <Text
                                            fontWeight="semibold"
                                            display="flex"
                                            alignItems={"center"}
                                            verticalAlign={"center"}
                                        >
                                            <Icon
                                                viewBox="0 0 200 200"
                                                color={getModuleColor(
                                                    data.colorMap,
                                                    value
                                                )}
                                                mr={2}
                                            >
                                                <path
                                                    fill="currentColor"
                                                    d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
                                                />
                                            </Icon>
                                            {/* {(index || 0) + 1}. */}
                                            {value}
                                        </Text>
                                        {showAdditionalDetails && (
                                            <Text>
                                                {getVacanciesForAllLessons(
                                                    data.totalModuleCodeLessonTypeMap[
                                                        value
                                                    ]?.map((e) => e.size)
                                                )}{" "}
                                                vacancies / slot (Rd 1)
                                            </Text>
                                        )}
                                    </Box>
                                </Flex>

                                <DeleteIcon
                                    cursor="pointer"
                                    onClick={() => deleteModule(value)}
                                    color={deleteIconColor}
                                />
                            </Flex>
                        </Entry>{" "}
                    </Box>
                )}
            />
        </Stack>
    );
};

export default ModuleSortContainer;
