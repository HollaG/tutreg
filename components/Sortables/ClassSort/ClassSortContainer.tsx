import {
    Box,
    Button,
    Center,
    Flex,
    Heading,
    SimpleGrid,
    Stack,
    Text,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select } from "chakra-react-select";
import { Option, RootState } from "../../../types/types";
import Card from "../../Card/Card";
import Entry from "../Entry";
import { arrayMove, List } from "react-movable";
import { classesActions } from "../../../store/classesReducer";
import ClassList from "./ClassList";
import { keepAndCapFirstThree } from "../../../lib/functions";

const ClassSortContainer: React.FC = () => {
    const data = useSelector((state: RootState) => state.classesInfo);
    const dispatch = useDispatch();

    const generateOptionsForModule = useCallback(
        (moduleCodeLessonType: string) => {
            if (!data.totalModuleCodeLessonTypeMap[moduleCodeLessonType])
                return [];
            const selectedClassesForThisModule = (
                data.selectedClasses[moduleCodeLessonType] || []
            ).map((class_) => class_.classNo);
            const moduleData =
                data.totalModuleCodeLessonTypeMap[moduleCodeLessonType].filter(
                    (class_) =>
                        !selectedClassesForThisModule.includes(class_.classNo)
                ) || [];
            if (!moduleData || !moduleData.length) return [];
            const classes = moduleData.map((classOpt) => {
                const lessonText = classOpt.classes
                    .map(
                        (class_) =>
                            `${class_.day} ${class_.startTime}-${class_.endTime}`
                    )
                    .join("\n");

                return {
                    value: classOpt.classNo,
                    label: `${keepAndCapFirstThree(
                        moduleCodeLessonType.split(": ")[1]
                    )} [${classOpt.classNo}]\n${lessonText}`,
                };
            });
            // return sorted by alphanumerical order
            return classes.sort((a, b) => a.value.localeCompare(b.value));
        },
        [data.selectedClasses, data.totalModuleCodeLessonTypeMap]
    );

    const [selectClassContainer, setSelectClassContainer] = useState<{
        [moduleCodeLessonType: string]: Option[]; // classNo
    }>({});

    const selectClassHandler = (
        opt: Option[],
        moduleCodeLessonType: string
    ) => {
        setSelectClassContainer((prevState) => ({
            ...prevState,
            [moduleCodeLessonType]: opt,
        }));

        console.log(selectClassContainer);
    };

    const addClassHandler = (moduleCodeLessonType: string) => {
        const selectedClasses = selectClassContainer[moduleCodeLessonType];
        if (!selectedClasses) return;

        for (const selectedClass of selectedClasses) {
            if (!selectedClass) continue;
            const classNo = selectedClass.value;
            dispatch(
                classesActions.addSelectedClass({
                    moduleCodeLessonType,
                    classNo,
                })
            );
            
        }
        // reset the selectClassContainer
        setSelectClassContainer((prevState) => {
            const newState = { ...prevState };

            newState[moduleCodeLessonType] = [];
            return newState;
        });
    };

    return (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
            {data.moduleOrder.map((moduleCodeLessonType, index) => (
                <Card key={index}>
                    <Stack spacing={3}>
                        <Box textAlign="center">
                            <Heading size="sm" mb={1}>
                                {index + 1}. {moduleCodeLessonType}
                            </Heading>
                            <Text>
                                {
                                    data.totalModuleCodeLessonTypeMap[
                                        moduleCodeLessonType
                                    ]?.[0].size
                                }{" "}
                                vacancies / slot
                            </Text>
                            <Text>
                                Weeks{" "}
                                {data.totalModuleCodeLessonTypeMap[
                                    moduleCodeLessonType
                                ]?.[0].classes[0].weeks
                                    .toString()
                                    .replace(/\[|\]/g, "")}
                            </Text>
                        </Box>

                        {/* @ts-ignore */}
                        <ClassList
                            moduleCodeLessonType={moduleCodeLessonType}
                        />
                        {!data.selectedClasses[moduleCodeLessonType] && (
                            <Text> No classes selected yet! </Text>
                        )}

                        <Entry>
                            <Flex>
                                <Box flex={1} mr={3}>
                                    <Select
                                    instanceId={moduleCodeLessonType}
                                        isMulti
                                        closeMenuOnSelect={false}
                                        isSearchable={false}
                                        placeholder="Add another slot..."
                                        size="sm"
                                        options={generateOptionsForModule(
                                            moduleCodeLessonType
                                        )}
                                        value={
                                            selectClassContainer[
                                                moduleCodeLessonType
                                            ]
                                        }
                                        onChange={(opt: any) =>
                                            selectClassHandler(
                                                opt,
                                                moduleCodeLessonType
                                            )
                                        }
                                        classNamePrefix="lp-copy-sel"
                                    />
                                </Box>

                                <Button
                                    colorScheme="blue"
                                    size="sm"
                                    onClick={() =>
                                        addClassHandler(moduleCodeLessonType)
                                    }
                                >
                                    Add
                                </Button>
                            </Flex>
                        </Entry>
                    </Stack>
                </Card>
            ))}
        </SimpleGrid>
    );
};

export default ClassSortContainer;
