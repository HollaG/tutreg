import {
    DragHandleIcon,
    DeleteIcon,
    LockIcon,
    UnlockIcon,
} from "@chakra-ui/icons";
import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Stack,
    Text,
    Tooltip,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { arrayMove, List } from "react-movable";
import { useSelector } from "react-redux";
import { getAlphabet, keepAndCapFirstThree } from "../../lib/functions";
import { ClassOverview, RootState } from "../../types/types";
import Card from "../Card/Card";
import Entry from "../Sortables/Entry";

const ResultContainer: React.FC = () => {
    const { moduleOrder, selectedClasses } = useSelector(
        (state: RootState) => state.classesInfo
    );
    const [decouple, setDecouple] = useState(false);

    const [holderArray, setHolderArray] = useState<ClassOverview[]>([]);

    useEffect(() => {
        if (!moduleOrder || !selectedClasses) return;
        if (decouple) return;
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

        const columnNumber = moduleOrder.length;

        for (let i = 0; i < highestNumber; i = i + 2) {
            for (let j = 0; j < columnNumber; j++) {
                const module_ = moduleOrder[j];

                // add each mod's highest ranked class to the holderArray if it exists
                if (selectedClasses[module_] && selectedClasses[module_][i])
                    tempHolderArray.push(selectedClasses[module_][i]);
            }

            let reverse = i + 1;
            if (reverse >= highestNumber) break;
            for (let j = columnNumber - 1; j >= 0; j--) {
                const module_ = moduleOrder[j];

                // add each mod's highest ranked class to the holderArray if it exists
                if (
                    selectedClasses[module_] &&
                    selectedClasses[module_][reverse]
                )
                    tempHolderArray.push(selectedClasses[module_][reverse]);
            }
        }

        setHolderArray(tempHolderArray);
    }, [moduleOrder, selectedClasses, decouple]);

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
        <Container maxW="xl">
            <Card>
                <Stack>
                    <Flex>
                        <Heading size="md" flex={1}>
                            {" "}
                            Final priority ranking{" "}
                        </Heading>
                        <Box alignItems="center">
                            <Tooltip hasArrow label="When unlocked, you can manually change your final class priority. This will not affect your main priority rankings." textAlign='center'>
                                <Button
                                    size="sm"
                                    onClick={() => toggleDecouple()}
                                >
                                    {decouple ? <UnlockIcon /> : <LockIcon /> }
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
                            >
                                {children}
                            </Box>
                        )}
                        renderItem={({ value, index, props, isDragged }) => (
                            <Entry key={index} {...props}>
                                <Flex alignItems="center">
                                    {decouple && (
                                        <DragHandleIcon
                                            data-movable-handle
                                            cursor={
                                                isDragged ? "grabbing" : "grab"
                                            }
                                            tabIndex={-1}
                                        />
                                    )}
                                    <Box flex={1} mx={3}>
                                        <Text fontWeight={"semibold"}>
                                            {(index || 0) + 1}.{" "}
                                            {value.moduleCode}{" "}
                                            {keepAndCapFirstThree(
                                                value.lessonType || ""
                                            )}{" "}
                                            [{value.classNo}]
                                        </Text>
                                        <Text>{value.moduleName}</Text>
                                        <Text mb={2}>
                                            {" "}
                                            Weeks{" "}
                                            {value.classes[0].weeks
                                                .toString()
                                                .replace(/\[|\]/g, "")}
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
                                    </Box>
                                </Flex>
                            </Entry>
                        )}
                    />
                </Stack>
            </Card>
        </Container>
    );
};

export default ResultContainer;
