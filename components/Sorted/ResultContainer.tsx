import { DragHandleIcon, LockIcon, UnlockIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightElement,
  Stack,
  Text,
  Tooltip,
  useClipboard,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useEffect, useMemo, useState } from "react";
import { arrayMove, List } from "react-movable";
import { useSelector } from "react-redux";
import {
  combineNumbers,
  encodeRank,
  getAlphabet,
  encodeLessonTypeToShorthand,
  getModuleColorWithShade,
} from "../../lib/functions";
import { classesActions } from "../../store/classesReducer";
import { LessonTypeAbbrevMap } from "../../types/modules";
import { ClassOverview, Option, RootState } from "../../types/types";
import Card from "../Card/Card";
import Entry from "../Sortables/Entry";

const options = [
  {
    label: "Rank using selected module order",
    value: "selected",
  },
  {
    label: "Rank using lowest vacancy first",
    value: "vacancy",
  },
];

const ResultContainer: React.FC<{
  showAdditionalDetails: boolean;
  setShareLink: React.Dispatch<React.SetStateAction<string>>;
}> = ({ showAdditionalDetails, setShareLink }) => {
  const { moduleOrder, selectedClasses, colorMap } = useSelector(
    (state: RootState) => state.classesInfo
  );
  const copiedModuleOrder = useMemo(() => [...moduleOrder], [moduleOrder]);
  const [value, setValue] = useState<Option>(options[0]);

  const [decouple, setDecouple] = useState(false);

  const [holderArray, setHolderArray] = useState<ClassOverview[]>([]);

  useEffect(() => {
    if (!copiedModuleOrder || !selectedClasses) return;
    if (decouple) return;
    let tempHolderArray: ClassOverview[] = [];
    if (value.value === "selected") {
      // rank according to selection

      // find the highest number of selected classes in each selected module

      // highest number is the number of rows of the 2d matrix
      const highestNumber = Object.keys(selectedClasses).reduce(
        (prevVal, currentVal) =>
          Number(prevVal) > selectedClasses[currentVal].length
            ? prevVal
            : selectedClasses[currentVal].length,
        0
      );

      const columnNumber = copiedModuleOrder.length;

      for (let i = 0; i < highestNumber; i = i + 2) {
        for (let j = 0; j < columnNumber; j++) {
          const module_ = copiedModuleOrder[j];

          // add each mod's highest ranked class to the holderArray if it exists
          if (selectedClasses[module_] && selectedClasses[module_][i])
            tempHolderArray.push(selectedClasses[module_][i]);
        }

        let reverse = i + 1;
        if (reverse >= highestNumber) break;
        for (let j = columnNumber - 1; j >= 0; j--) {
          const module_ = copiedModuleOrder[j];

          // add each mod's highest ranked class to the holderArray if it exists
          if (
            selectedClasses[module_] &&
            selectedClasses[module_][reverse]
          )
            tempHolderArray.push(selectedClasses[module_][reverse]);
        }
      }
    } else if (value.value === "vacancy") {
      const vacancyModuleOrder = copiedModuleOrder.sort(
        (a, b) =>
          selectedClasses?.[a]?.[0]?.size -
          selectedClasses?.[b]?.[0]?.size
      );

      // highest number is the number of rows of the 2d matrix
      const highestNumber = Object.keys(selectedClasses).reduce(
        (prevVal, currentVal) =>
          Number(prevVal) > selectedClasses[currentVal].length
            ? prevVal
            : selectedClasses[currentVal].length,
        0
      );

      const columnNumber = vacancyModuleOrder.length;

      for (let i = 0; i < highestNumber; i = i + 2) {
        for (let j = 0; j < columnNumber; j++) {
          const module_ = vacancyModuleOrder[j];

          // add each mod's highest ranked class to the holderArray if it exists
          if (selectedClasses[module_] && selectedClasses[module_][i])
            tempHolderArray.push(selectedClasses[module_][i]);
        }

        let reverse = i + 1;
        if (reverse >= highestNumber) break;
        for (let j = columnNumber - 1; j >= 0; j--) {
          const module_ = vacancyModuleOrder[j];

          // add each mod's highest ranked class to the holderArray if it exists
          if (
            selectedClasses[module_] &&
            selectedClasses[module_][reverse]
          )
            tempHolderArray.push(selectedClasses[module_][reverse]);
        }
      }
    }
    setHolderArray(tempHolderArray);
  }, [copiedModuleOrder, selectedClasses, decouple, value]);

  const toggleDecouple = () => setDecouple(!decouple);

  const dragHandler = ({
    oldIndex,
    newIndex,
  }: {
    oldIndex: number;
    newIndex: number;
  }) => {
    if (newIndex === -1) {
      // drag out of bounds, delete
      // dispatch(
      //     classesActions.removeSelectedClass({
      //         moduleCodeLessonType,
      //         classNo:
      //             data.selectedClasses[moduleCodeLessonType][oldIndex]
      //                 .classNo,
      //     })
      // );
    } else {
      // dispatch(
      //     classesActions.changeClassOrder({
      //         newOrder: arrayMove(
      //             data.selectedClasses[moduleCodeLessonType],
      //             oldIndex,
      //             newIndex
      //         ),
      //         moduleCodeLessonType,
      //     })
      // );

      setHolderArray((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  // update the link whenever holderarray changes
  useEffect(() => {
    setShareLink(encodeRank(holderArray, moduleOrder, selectedClasses));
  }, [holderArray]);

  return (
    <Stack spacing={3}>
      <Flex alignItems="center">
        <Box flex={1}>
          <Select
            size="sm"
            options={options}
            value={value}
            onChange={(opt: any) => {
              setValue(opt);
              setDecouple(false);
            }}
          />
        </Box>

        <Box>
          <Tooltip
            hasArrow
            label="When unlocked, you can make changes to your final class priority, if you don't like how the system calculated the ranking. NOTE: new classes added will not be reflected in the ranking when unlocked."
            textAlign="center"
          >
            <Button size="sm" onClick={() => toggleDecouple()}>
              {decouple ? <UnlockIcon /> : <LockIcon />}
            </Button>
          </Tooltip>
        </Box>
      </Flex>
      <List
        values={holderArray}
        onChange={dragHandler}
        renderList={({ children, props, isDragged }) => (
          <Box
            {...props}
            cursor={isDragged ? "grabbing" : "inherit"}
            className={isDragged ? "drag" : "static"}
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
          <Box
            {...props}
            key={index}
            borderRadius="md"
            pointerEvents={decouple ? undefined : "none"}
          >
            <Entry
              key={index}
              dragProps={{
                isSelected,
                isDragged,
                isOutOfBounds,
              }}
            >
              <Flex alignItems="center">
                <Flex
                  alignItems={"center"}
                  flex={1}
                  data-movable-handle
                  cursor={isDragged ? "grabbing" : "grab"}
                >
                  {decouple && (
                    <DragHandleIcon tabIndex={-1} />
                  )}
                  <Box flex={1} mx={3}>
                    <Text
                      fontWeight={"semibold"}
                      display="flex"
                      alignItems={"center"}
                    >
                      <Icon
                        viewBox="0 0 200 200"
                        color={getModuleColorWithShade(
                          colorMap,
                          `${value.moduleCode}: ${value.lessonType}`
                        )}
                        mr={2}
                      >
                        <path
                          fill="currentColor"
                          d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
                        />
                      </Icon>
                      {(index || 0) + 1}.{" "}
                      {value.moduleCode}{" "}
                      {encodeLessonTypeToShorthand(
                        (value.lessonType as keyof LessonTypeAbbrevMap) ||
                        ""
                      )}{" "}
                      [{value.classNo}]
                    </Text>
                    {showAdditionalDetails && (
                      <>
                        <Text>{value.moduleName}</Text>
                        <Text>
                          {value.classes[0].size}{" "}
                          vacancies
                        </Text>
                        <Text mb={2}>
                          {" "}
                          Weeks{" "}
                          {combineNumbers(
                            value.classes[0].weeks
                              .toString()
                              .replace(
                                /\[|\]/g,
                                ""
                              )
                              .split(",")
                          )}
                        </Text>
                        {(value?.classes || []).map(
                          (classSel, index) => (
                            <Box key={index}>
                              <Text>
                                {classSel.day}{" "}
                                {
                                  classSel.startTime
                                }
                                -
                                {
                                  classSel.endTime
                                }{" "}
                                (
                                {classSel.venue}
                                )
                              </Text>
                            </Box>
                          )
                        )}
                      </>
                    )}
                  </Box>
                </Flex>
              </Flex>
            </Entry>{" "}
          </Box>
        )}
      />
      {decouple && <Alert status="warning">
        <AlertIcon />
        Decouple mode active. Displayed timetable will not be accurate.
      </Alert>}
    </Stack>
  );
};

export default ResultContainer;
function dispatch(arg0: any) {
  throw new Error("Function not implemented.");
}
