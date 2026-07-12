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
  getModuleColorWithShade,
} from "../../../lib/functions";
import { Data } from "../../../pages/api/import";
import { LessonType } from "../../../types/modules";
import BasicModal from "../../Modal/Modal";
import TimetableModal from "../../Timetable/TimetableModal";
import { miscActions } from "../../../store/misc";

const ClassSortContainer: React.FC<{ showAdditionalDetails: boolean }> = ({
  showAdditionalDetails,
}) => {
  const data = useSelector((state: RootState) => state.classesInfo);
  const miscState = useSelector((state: RootState) => state.misc);
  const dualMode = useSelector((state: RootState) => state.misc.dualMode);
  const dispatch = useDispatch();

  const [loadedData, setLoadedData] = useState<Data>();
  const [loadedMisc, setLoadedMisc] = useState<typeof miscState>();

  useEffect(() => {
    if (data) setLoadedData(data);
  }, [data]);

  useEffect(() => {
    if (miscState) setLoadedMisc(miscState);
  }, [miscState]);

  // Handle adding modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedModuleCodeLessonType, setSelectedModuleCodeLessonType] =
    useState<string>("");

  const handleOpen = (moduleCodeLessonType: string) => {
    if (!dualMode) { // if not dual mode, open as per normal
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
    } else {
      const [moduleCode, lessonType] = moduleCodeLessonType.split(": ")
      // set the timetable modifying mode to true
      dispatch(miscActions.setTimetableModifyingMode({
        moduleCode,
        lessonType: lessonType as LessonType
      }));
    }

  };

  let currentlyActiveModifyingMCLT = loadedMisc?.timetableModifyingMode ? `${loadedMisc.timetableModifyingMode.moduleCode}: ${loadedMisc.timetableModifyingMode.lessonType}` : null;
  return (
    <>
      <TimetableModal
        isOpen={isOpen}
        onClose={onClose}
        selectedModuleCodeLessonType={selectedModuleCodeLessonType}
      ></TimetableModal>

      <Stack spacing={6} divider={<Divider />}>
        {loadedData &&
          loadedData.moduleOrder.map(
            (moduleCodeLessonType, index) => (
              // <Card key={index}>
              <Stack spacing={3} key={index} id={`class-sort-container-${moduleCodeLessonType}`}>
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
                        color={getModuleColorWithShade(
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
                    {currentlyActiveModifyingMCLT === moduleCodeLessonType ? <Button size="xs" colorScheme="green" onClick={() => {
                      // setIsModifying(false)
                      // setSelectedClass(null)
                      dispatch(miscActions.setTimetableModifyingMode(null))
                    }}> Finish editing </Button> : <Button
                      colorScheme="blue"
                      onClick={() =>
                        handleOpen(moduleCodeLessonType)
                      }
                      size="xs"
                    >
                      Add classes
                    </Button>}
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
