import {
    Box,
    Button,
    Center,
    Divider,
    Flex,
    Heading,
    Icon,
    Modal,
    SimpleGrid,
    Stack,
    Text,
    useColorModeValue,
    useDisclosure,
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
    encodeLessonTypeToShorthand,
    getModuleColor,
} from "../../../lib/functions";
import { Data } from "../../../pages/api/import";
import { LessonType } from "../../../types/modules";
import BasicModal from "../../Modal/Modal";
import TimetableModal from "../../Timetable/TimetableModal";

const ClassSortContainer: React.FC<{ showAdditionalDetails: boolean }> = ({
    showAdditionalDetails,
}) => {
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
                    label: `${encodeLessonTypeToShorthand(
                        moduleCodeLessonType.split(": ")[1] as LessonType
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

    // Handle adding modal
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedModuleCodeLessonType, setSelectedModuleCodeLessonType] =
        useState<string>("");

    const handleOpen = (moduleCodeLessonType: string) => {
        setSelectedModuleCodeLessonType(moduleCodeLessonType);

        // when opening the modal, set the changed classes to the currently selected classes, or none if there's none
        if (data.selectedClasses[moduleCodeLessonType]) {
            dispatch(
                classesActions.setChangedClasses(
                    data.selectedClasses[moduleCodeLessonType].map(
                        (class_) => class_.classNo
                    ) || []
                )
            );
        }
        onOpen();
    };
    return (
        <>
            <TimetableModal
                isOpen={isOpen}
                onClose={onClose}
                selectedModuleCodeLessonType={selectedModuleCodeLessonType}
            ></TimetableModal>
            {/* <SimpleGrid
                columns={{
                    base: 1,
                    // md: loadedData?.moduleOrder.length === 1 ? 1 : 2,
                    md: 2,
                }}
                spacing={5}
                w="100%"
            > */}
            <Stack spacing={6} divider={<Divider />}>
                {loadedData &&
                    loadedData.moduleOrder.map(
                        (moduleCodeLessonType, index) => (
                            // <Card key={index}>
                            <Stack spacing={3} key={index}>
                                <Box textAlign="left">
                                    <Flex
                                        key={index}
                                        justifyContent="space-between"
                                        alignItems="center"
                                        mb={1}
                                    >
                                        <Text
                                            size="sm"
                                            fontWeight="semibold"
                                            display="flex"
                                            alignItems={"center"}
                                        >
                                            <Icon
                                                viewBox="0 0 200 200"
                                                color={getModuleColor(
                                                    data.colorMap,
                                                    moduleCodeLessonType
                                                )}
                                                mr={2}
                                            >
                                                <path
                                                    fill="currentColor"
                                                    d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
                                                />
                                            </Icon>
                                            {index + 1}. {moduleCodeLessonType}
                                        </Text>
                                        <Button
                                            colorScheme="blue"
                                            onClick={() =>
                                                handleOpen(moduleCodeLessonType)
                                            }
                                            size="xs"
                                        >
                                            Add classes
                                        </Button>
                                    </Flex>

                                    {showAdditionalDetails && (
                                        <>
                                            <Text>
                                                {getVacanciesForAllLessons(
                                                    loadedData.totalModuleCodeLessonTypeMap[
                                                        moduleCodeLessonType
                                                    ]?.map((e) => e.size)
                                                )}{" "}
                                                vacancies / slot (Rd 1)
                                            </Text>
                                            <Text>
                                                Weeks{" "}
                                                {/* If there are multiple different weeks for different classes in the module, show that the weeks vary by class */}
                                                {checkMultipleDifferentWeeks(
                                                    loadedData.totalModuleCodeLessonTypeMap[
                                                        moduleCodeLessonType
                                                    ]?.map(
                                                        (e) =>
                                                            e.classes[0].weeks
                                                    )
                                                )
                                                    ? "vary by class"
                                                    : combineNumbers(
                                                          loadedData.totalModuleCodeLessonTypeMap[
                                                              moduleCodeLessonType
                                                          ]?.[0].classes[0].weeks
                                                              .toString()
                                                              .replace(
                                                                  /\[|\]/g,
                                                                  ""
                                                              )
                                                              .split(",")
                                                      )}
                                            </Text>{" "}
                                        </>
                                    )}
                                </Box>

                                <ClassList
                                    moduleCodeLessonType={moduleCodeLessonType}
                                    showAdd={true}
                                />
                                {!loadedData.selectedClasses[
                                    moduleCodeLessonType
                                ] && <Text> No classes selected yet! </Text>}

                                {/* <Entry>
                                        <Flex>
                                            <Box flex={1} mr={3}>
                                                <Select
                                                    instanceId={
                                                        moduleCodeLessonType
                                                    }
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
                                    </Entry> */}
                            </Stack>

                            // </Card>
                        )
                    )}
                {/* </SimpleGrid> */}
            </Stack>
        </>
    );
};

export default ClassSortContainer;
