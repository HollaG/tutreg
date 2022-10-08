import {
    Box,
    Button,
    Center,
    Flex,
    FormControl,
    FormErrorMessage,
    FormHelperText,
    Heading,
    HStack,
    Input,
    InputGroup,
    InputRightAddon,
    Link,
    SimpleGrid,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    useBoolean,
    useColorModeValue,
    useMediaQuery,
    Text,
    Collapse,
    Divider,
    Tooltip,
    useToast,
    InputLeftAddon,
    InputRightElement,
    useClipboard,
} from "@chakra-ui/react";
import { AnyARecord } from "dns";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactSelect, { InputActionMeta, MultiValue } from "react-select";
import { AsyncSelect, Select } from "chakra-react-select";
import ModuleSortContainer from "../components/Sortables/ModuleSort/ModuleSortContainer";
import ClassSortContainer from "../components/Sortables/ClassSort/ClassSortContainer";
import { sendPOST } from "../lib/fetcher";
import { ModuleCondensed } from "../types/modules";
import { RootState } from "../types/types";
import { ModulesResponseData } from "./api/modules";
import { classesActions } from "../store/classesReducer";

import { Option } from "../types/types";
import ResultContainer from "../components/Sorted/ResultContainer";
import NextLink from "next/link";
import { useRouter } from "next/router";
import Explanation from "../components/Description/Explanation";
import { ImportResponseData } from "./api/import";
import { generateLink } from "../lib/functions";

const ay = process.env.NEXT_PUBLIC_AY;
const Order: NextPage = () => {
    const toast = useToast();
    const [link, setLink] = useState("");
    const isError =
        !link.startsWith("https://nusmods.com/timetable/sem") && link !== "";

    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async () => {        
        setIsSubmitting(true);
        
        const result: ImportResponseData = await sendPOST("/api/import", {
            url: link,
        });

        const data = result.data;

        if (!data)
            return toast({
                title: "Error importing classes!",
                description: result.error,
                status: "error",
                duration: 5000,
                isClosable: true,
            });

        toast({
            title: "Classes imported",
            status: "success",
            duration: 5000,
            isClosable: true,
        });
        dispatch(classesActions.setState(data));
        setIsSubmitting(false);
    };

    const [value, setValue] = useState("");
    const [selectedModules, setSelectedModules] = useState<Option[]>([]);

    const handleInputChange = (
        newValue: string,
        { action }: InputActionMeta
    ) => {
        setValue(newValue);
        return newValue;
    };

    const handleSelectChange = (newValue: Option[]) => {
        setSelectedModules(newValue);
        setTimeout(() => {});
        setValue(value);
    };

    const data = useSelector((state: RootState) => state.classesInfo);

    // Workaround: Chakra Collapse does not show when showCollapse is initially true.
    // Ref: https://github.com/chakra-ui/chakra-ui/issues/2534
    const [showCollapse, setShowCollapse] = useState(false);
    useEffect(
        () => setShowCollapse(!!data.moduleOrder.length),
        [data.moduleOrder.length]
    );

    // fetch the list of modules from nusmods
    const [moduleList, setModuleList] = useState<ModuleCondensed[]>();

    useEffect(() => {
        if (!ay) console.log("ERROR: no ay");
        fetch(`https://api.nusmods.com/v2/${ay || "2022-2023"}/moduleList.json`)
            .then((res) => res.json())
            .then((data) => {
                setModuleList(data);
            });
    }, []);

    const loadOptions = (inputValue: string) =>
        new Promise<any[]>((resolve) => {
            if (!moduleList) return resolve([]);

            const sanitizedValue = inputValue.trim().toUpperCase();
            if (inputValue.length < 3 || inputValue.length > 8) {
                resolve([]);
                return;
            }

            const matchedModules = moduleList.filter((module) =>
                module.moduleCode.includes(sanitizedValue)
            );

            if (!matchedModules.length) return resolve([]);

            // Request from internal database
            sendPOST(`/api/modules`, {
                modules: matchedModules,
            }).then((result: ModulesResponseData) => {
                if (!result.success || !result.data)
                    return console.log("error");

                const options = Object.keys(result.data).map((key) => ({
                    value: key,
                    label: key,
                }));

                // filter the options to remove a) already selected b) already in classesSelected
                const filteredOptions = options.filter(
                    (option) =>
                        !(
                            selectedModules
                                .map((sel) => sel.value)
                                .includes(option.value) ||
                            data.moduleOrder.includes(option.value)
                        )
                );

                // Group the options by module code
                const groupedOptions: {
                    label: string;
                    options: Option[];
                }[] = [];

                filteredOptions.forEach((option) => {
                    if (
                        !groupedOptions.find(
                            (opt) => opt.label === option.label.split(":")[0]
                        )
                    ) {
                        groupedOptions.push({
                            label: option.label.split(":")[0],
                            options: [option],
                        });
                    } else {
                        groupedOptions
                            .find(
                                (opt) =>
                                    opt.label === option.label.split(":")[0]
                            )
                            ?.options.push(option);
                    }
                });

                resolve(groupedOptions);
            });
        });

    const dispatch = useDispatch();
    const addModules = async () => {
        if (!selectedModules.length) return;
        const modules = selectedModules.map((module) => module.value);

        dispatch(classesActions.addModules(modules));

        // when user adds modules, send request to retrieve the classInfo for that
        const response: ModulesResponseData = await sendPOST("/api/modules", {
            modules: modules.map((module) => ({
                moduleCode: module.split(":")[0],
            })),
        });

        if (!response.success || !response.data)
            return alert("Unexpected error");
        dispatch(classesActions.addAvailableClasses(response.data));

        setSelectedModules([]);
    };

    const removeAll = () => {
        dispatch(classesActions.removeAll());
    };

    const [showAdd, setShowAdd] = useBoolean();

    const [isLargerThan500] = useMediaQuery(["min-width: 500px"]);

    // Update the displayed link whenever the modules changes
    const [timetableLink, setTimetableLink] = useState("");
    useEffect(() => {
        setTimetableLink(
            generateLink({ ...data.selectedClasses, ...data.nonBiddable })
        );
    }, [data]);

    const { hasCopied, onCopy } = useClipboard(timetableLink);

    return (
        <Stack spacing={5}>
            <Heading size="lg" textAlign="center">
                {" "}
                To get started, import your NUSMods Timetable.{" "}
            </Heading>
            <Flex>
                <Box flex={1} mr={3}>
                    <FormControl isInvalid={isError}>
                        <Input
                            placeholder="https://nusmods.com/timetable/sem-1/share?..."
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                        />

                        {isError && (
                            <FormErrorMessage>
                                Invalid share link!
                            </FormErrorMessage>
                        )}
                    </FormControl>
                </Box>
                <Tooltip
                    hasArrow
                    label="Importing a new timetable will clear your previously selected modules, if any!"
                    textAlign="center"
                >
                    <Button
                        type="submit"
                        colorScheme="blue"
                        onClick={() => handleSubmit()}
                        disabled={isSubmitting || !link}
                    >
                        {" "}
                        {isSubmitting ? "Importing..." : "Import"}{" "}
                    </Button>
                </Tooltip>
            </Flex>

            <Text textAlign="center">or, add modules manually</Text>
            <Flex>
                <Box flex={1} mr={3}>
                    <FormControl>
                        <AsyncSelect
                            instanceId={`${ay}-select`}
                            closeMenuOnSelect={false}
                            placeholder="Search..."
                            value={selectedModules}
                            isMulti
                            // cacheOptions
                            loadOptions={loadOptions}
                            // inputValue={value}
                            onInputChange={handleInputChange}
                            onChange={(newValue: any) =>
                                handleSelectChange(newValue)
                            }
                        />
                        <FormHelperText>
                            Search for a module (min. 3 chars)
                        </FormHelperText>
                        <FormHelperText>
                            Modules unavailable for bidding in tutorial rounds
                            are not shown.
                        </FormHelperText>
                    </FormControl>
                </Box>
                <Button onClick={() => addModules()} colorScheme="blue">
                    {" "}
                    Add{" "}
                </Button>
            </Flex>
            <Collapse in={showCollapse}>
                <Stack spacing={5}>
                    <Center>
                        <HStack>
                            <Button
                                size="sm"
                                colorScheme="red"
                                onClick={() => removeAll()}
                            >
                                {" "}
                                Remove all mods{" "}
                            </Button>
                            <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={setShowAdd.toggle}
                            >
                                {" "}
                                {showAdd ? `Hide` : `Show`} details{" "}
                            </Button>
                        </HStack>
                    </Center>

                    <Tabs
                        variant="enclosed"
                        colorScheme="blue"
                        align="center"
                        isFitted
                    >
                        <TabList>
                            <Tab>Rank Modules</Tab>
                            <Tab>Rank Classes</Tab>
                            <Tab>Computed Ranking</Tab>
                        </TabList>

                        <TabPanels
                            textAlign="left"
                            borderLeft={"1px solid"}
                            borderRight={"1px solid"}
                            borderBottom={"1px solid"}
                            borderColor={useColorModeValue(
                                "gray.200",
                                "gray.700"
                            )}
                        >
                            <TabPanel>
                                <ModuleSortContainer showAdd={showAdd} />
                            </TabPanel>
                            <TabPanel>
                                <ClassSortContainer showAdd={showAdd} />
                            </TabPanel>
                            <TabPanel>
                                <ResultContainer showAdd={showAdd} />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>

                    <Box>
                        <InputGroup>
                            <InputLeftAddon>1st choice</InputLeftAddon>
                            <Input readOnly value={timetableLink} />
                            <InputRightElement width="4.5rem">
                                <Button h="1.75rem" size="sm" onClick={onCopy}>
                                    {hasCopied ? "Copied!" : "Copy"}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                        <Center mt={2}>
                            <Link isExternal href={timetableLink}>
                                {" "}
                                Open in new tab{" "}
                            </Link>
                        </Center>
                    </Box>
                    {/* <Box id="divContainer">
                        <Box id="frameContainer">
                            <iframe src={timetableLink} width="100%" height="1000px" frameBorder="0" allowFullScreen></iframe>
                        </Box>
                    </Box> */}
                </Stack>
            </Collapse>
            <Divider />

            <Explanation />
        </Stack>
    );
};

export default Order;
