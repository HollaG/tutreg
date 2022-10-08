import {
    Box,
    Button,
    Center,
    Flex,
    Heading,
    SimpleGrid,
    Stack,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select } from "chakra-react-select";
import { Option, RootState } from "../../../types/types";
import Card from "../../Card/Card";
import Entry from "../Entry";
import { arrayMove, List } from "react-movable";
import { classesActions } from "../../../store/classesReducer";
import ClassList from "./ClassList";
import {
    checkMultipleDifferentWeeks,
    combineNumbers,
    getVacanciesForAllLessons,
    keepAndCapFirstThree,
} from "../../../lib/functions";
import { Data } from "../../../pages/api/import";

const ClassSortContainer: React.FC<{ showAdd: boolean }> = ({ showAdd }) => {
    const data = useSelector((state: RootState) => state.classesInfo);
    const dispatch = useDispatch();

    const [loadedData, setLoadedData] = useState<Data>();

    useEffect(() => {
        if (data) setLoadedData(data);
    }, [data]);

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

    const selectClassHandler = useCallback(
        (opt: Option[], moduleCodeLessonType: string) => {
            setSelectClassContainer((prevState) => ({
                ...prevState,
                [moduleCodeLessonType]: opt,
            }));
        },
        []
    );

    const addClassHandler = useCallback(
        (moduleCodeLessonType: string) => {
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
        },
        [dispatch, selectClassContainer]
    );

    return (
        <SimpleGrid
            columns={{
                base: 1,
                md: loadedData?.moduleOrder.length === 1 ? 1 : 2,
            }}
            spacing={5}
        >
            {loadedData &&
                loadedData.moduleOrder.map((moduleCodeLessonType, index) => (
                    <Card key={index}>
                        <Stack spacing={3}>
                            <Box textAlign="center">
                                <Heading size="sm" mb={1}>
                                    {index + 1}. {moduleCodeLessonType}
                                </Heading>
                                {showAdd && (
                                    <>
                                        <Text>                                            
                                            {getVacanciesForAllLessons(
                                                loadedData.totalModuleCodeLessonTypeMap[moduleCodeLessonType]?.map(e => e.size)
                                            )}{" "}
                                            vacancies / slot (Rd 1)
                                        </Text>
                                        <Text>
                                            Weeks{" "}
                                            {/* If there are multiple different weeks for different classes in the module, show that the weeks vary by class */}
                                            {checkMultipleDifferentWeeks(
                                                loadedData.totalModuleCodeLessonTypeMap[
                                                    moduleCodeLessonType
                                                ]?.map(e => e.classes[0].weeks)
                                            )
                                                ? "vary by class"
                                                : combineNumbers(
                                                      loadedData.totalModuleCodeLessonTypeMap[
                                                          moduleCodeLessonType
                                                      ]?.[0].classes[0].weeks
                                                          .toString()
                                                          .replace(/\[|\]/g, "")
                                                          .split(",")
                                                  )}
                                        </Text>{" "}
                                    </>
                                )}
                            </Box>

                            <ClassList
                                moduleCodeLessonType={moduleCodeLessonType}
                                showAdd={showAdd}
                            />
                            {!loadedData.selectedClasses[
                                moduleCodeLessonType
                            ] && <Text> No classes selected yet! </Text>}

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
                                            addClassHandler(
                                                moduleCodeLessonType
                                            )
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
