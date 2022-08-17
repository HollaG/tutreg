import { DragHandleIcon, LockIcon, UnlockIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Center,
    Container,
    Flex,
    Heading,
    Stack,
    Text,
    Tooltip,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useEffect, useMemo, useState } from "react";
import { arrayMove, List } from "react-movable";
import { useSelector } from "react-redux";
import { combineNumbers, getAlphabet, keepAndCapFirstThree } from "../../lib/functions";
import { ClassOverview, Option, RootState } from "../../types/types";
import Card from "../Card/Card";
import Entry from "../Sortables/Entry";

const options = [
    {
        label: "Rank on selected module order",
        value: "selected",
    },
    {
        label: "Rank on lowest vacancy first",
        value: "vacancy",
    },
];

const ResultContainer: React.FC<{ showAdd: boolean }> = ({ showAdd }) => {
    const { moduleOrder, selectedClasses } = useSelector(
        (state: RootState) => state.classesInfo
    );
    const copiedModuleOrder = useMemo(() => [...moduleOrder], [moduleOrder]);
    const [value, setValue] = useState<Option>(options[0]);

    const [decouple, setDecouple] = useState(false);

    const [holderArray, setHolderArray] = useState<ClassOverview[]>([]);

    useEffect(() => {
        if (!copiedModuleOrder || !selectedClasses) return;
        if (decouple) return;

        if (value.value === "selected") {
            // rank according to selection

            let tempHolderArray: ClassOverview[] = [];
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

            setHolderArray(tempHolderArray);
        } else if (value.value === "vacancy") {
            let tempHolderArray: ClassOverview[] = [];
           
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

            setHolderArray(tempHolderArray);
        }
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

   
    

    return (
        <Stack spacing={3}>
            <Flex alignItems="center">
                {/* <Heading size="md" flex={1}>
                    Priority (using Sam Chan&apos;s algorithm)
                </Heading> */}
                {/* <Select  size="sm" flex={1} placeholder="Select option">
                    <option value="option1">Sam Chan</option>
                    <option value="option2">Lowest Vacancy First</option>
                    <option value="option3">Unlocked</option>
                </Select> */}
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
                        label="When unlocked, you can make changes to your final class priority."
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
                    <Box {...props} cursor={isDragged ? "grabbing" : "inherit"}>
                        {children}
                    </Box>
                )}
                renderItem={({ value, index, props, isDragged }) => (
                    <Entry
                        key={index}
                        {...props}
                        pointerEvents={decouple ? undefined : "none"}
                    >
                        <Flex alignItems="center">
                            {decouple && (
                                <DragHandleIcon
                                    data-movable-handle
                                    cursor={isDragged ? "grabbing" : "grab"}
                                    tabIndex={-1}
                                />
                            )}
                            <Box flex={1} mx={3}>
                                <Text fontWeight={"semibold"}>
                                    {(index || 0) + 1}. {value.moduleCode}{" "}
                                    {keepAndCapFirstThree(
                                        value.lessonType || ""
                                    )}{" "}
                                    [{value.classNo}]
                                </Text>
                                {showAdd && (
                                    <>
                                        <Text>{value.moduleName}</Text>
                                        <Text>
                                            {value.classes[0].size} vacancies / slot
                                        </Text>
                                        <Text mb={2}>
                                            {" "}
                                            Weeks{" "}
                                            {combineNumbers((value.classes[0].weeks)
                                                .toString()
                                                .replace(/\[|\]/g, "").split(","))}
                                        </Text>
                                        {(value?.classes || []).map(
                                            (classSel, index) => (
                                                <Box key={index}>
                                                    <Text>
                                                        {classSel.day}{" "}
                                                        {classSel.startTime}-
                                                        {classSel.endTime} (
                                                        {classSel.venue})
                                                    </Text>
                                                </Box>
                                            )
                                        )}
                                    </>
                                )}
                            </Box>
                        </Flex>
                    </Entry>
                )}
            />
        </Stack>
    );
};

export default ResultContainer;
