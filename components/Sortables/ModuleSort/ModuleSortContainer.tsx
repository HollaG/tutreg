import { DeleteIcon, DragHandleIcon } from "@chakra-ui/icons";
import {
    Box,
    Center,
    Container,
    Flex,
    Heading,
    SimpleGrid,
    Stack,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import { arrayMove, List } from "react-movable";
import { useDispatch, useSelector } from "react-redux";
import { ReactSortable } from "react-sortablejs";
import { classesActions } from "../../../store/classesReducer";
import { RootState } from "../../../types/types";
import Card from "../../Card/Card";
import Entry from "../Entry";

const ModuleSortContainer: React.FC = () => {
    const data = useSelector((state: RootState) => state.classesInfo);

    const dispatch = useDispatch();

    // const [modulesState, setModulesState] = useState<any[]>()

    const [modulesList, setModulesList] = useState<{
        id: number;
        name: string;
    }[]>([]);

    useEffect(() => {
        if (!data.moduleOrder?.length) return setModulesList([])
        const modulesList = (data.moduleOrder || []).map((selClass, index) => ({
            id: index,
            name: selClass,
        }));
        setModulesList(modulesList)
    }, [data.moduleOrder])

   

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

    const dragColor = useColorModeValue("gray.50", "gray.400");
    const deleteColor = useColorModeValue("red.300", "red.500");
    return (
        <Stack spacing={3}>
            <Center>
                <Container maxW="xl">
                    <Card>
                        <Stack>
                            <Heading size="lg" textAlign="center">
                                Modules
                            </Heading>

                            <List
                                removableByMove
                                values={modulesList.map(
                                    (module) => module.name
                                )}
                                onChange={dragHandler}
                                renderList={({
                                    children,
                                    props,
                                    isDragged,
                                }) => (
                                    <Box
                                        {...props}
                                        cursor={
                                            isDragged ? "grabbing" : "inherit"
                                        }
                                    >
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
                                    <Entry
                                        bgColor={
                                            isSelected || isDragged
                                                ? isOutOfBounds
                                                    ? deleteColor
                                                    : dragColor
                                                : ""
                                        }
                                        key={value}
                                        {...props}
                                    >
                                        <Flex alignItems="center">
                                            <DragHandleIcon
                                                data-movable-handle
                                                cursor={
                                                    isDragged
                                                        ? "grabbing"
                                                        : "grab"
                                                }
                                                tabIndex={-1}
                                            />
                                            <Box flex={1} mx={3}>
                                                <Text fontWeight="semibold">
                                                    {(index || 0) + 1}. {value}
                                                </Text>
                                                <Text>
                                                    {
                                                        data
                                                            .totalModuleCodeLessonTypeMap[
                                                            value
                                                        ]?.[0]?.classes[0]?.size
                                                    }{" "}
                                                    vacancies / slot (Rd 1)
                                                </Text>
                                            </Box>
                                            <DeleteIcon
                                                cursor="pointer"
                                                onClick={() =>
                                                    deleteModule(value)
                                                }
                                            />
                                        </Flex>
                                    </Entry>
                                )}
                            />
                        </Stack>
                    </Card>
                </Container>
            </Center>
        </Stack>
    );
};

export default ModuleSortContainer;
