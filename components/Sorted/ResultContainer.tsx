import { DragHandleIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, Container, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAlphabet, keepAndCapFirstThree } from "../../lib/functions";
import { ClassOverview, RootState } from "../../types/types";
import Entry from "../Sortables/Entry";

const ResultContainer: React.FC = () => {
    const { moduleOrder, selectedClasses } = useSelector(
        (state: RootState) => state.classesInfo
    );

    const [holderArray, setHolderArray] = useState<ClassOverview[]>([]);

    useEffect(() => {
        if (!moduleOrder || !selectedClasses) return;

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

        console.log({ columnNumber, highestNumber });
        for (let i = 0; i < highestNumber; i = i + 2) {
            console.log(`${i} value of i`);
            for (let j = 0; j < columnNumber; j++) {
                console.log(`${j} start`);
                const module = moduleOrder[j];

                // add each mod's highest ranked class to the holderArray if it exists
                if (selectedClasses[module] && selectedClasses[module][i])
                    tempHolderArray.push(selectedClasses[module][i]);
            }

            let reverse = i + 1;
            if (reverse >= highestNumber) break;
            for (let j = columnNumber - 1; j >= 0; j--) {
                console.log(`${j} reverse`);

                const module = moduleOrder[j];

                // add each mod's highest ranked class to the holderArray if it exists
                if (selectedClasses[module] && selectedClasses[module][reverse])
                    tempHolderArray.push(selectedClasses[module][reverse]);
            }
        }

        console.log({ tempHolderArray });
        setHolderArray(tempHolderArray);
    }, [moduleOrder, selectedClasses]);

    return (
        <Container maxW="xl">
            <Stack>
                <Heading size="md" textAlign="center"> Final priority ranking </Heading>
                {holderArray.map((classOverview, index) => (
                    <Entry key={index}>
                        <Flex alignItems="center">
                            <Box flex={1} mx={3}>
                                <Text fontWeight={"semibold"}>
                                    {index + 1}. {classOverview.moduleCode}{" "}
                                    {keepAndCapFirstThree(
                                        classOverview.lessonType || ""
                                    )}{" "}
                                    [{classOverview.classNo}]
                                </Text>
                                <Text>{classOverview.moduleName}</Text>
                                <Text mb={2}> Weeks {classOverview.classes[0].weeks.toString().replace(/\[|\]/g, "")}</Text>
                                {(classOverview?.classes || []).map(
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
                ))}
            </Stack>
        </Container>
    );
};

export default ResultContainer;
