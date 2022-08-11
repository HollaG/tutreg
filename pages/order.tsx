import {
    Box,
    Button,
    Center,
    Flex,
    HStack,
    Input,
    InputGroup,
    Link,
    SimpleGrid,
    Stack,
} from "@chakra-ui/react";
import { AnyARecord } from "dns";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactSelect, { InputActionMeta, MultiValue } from "react-select";
import { AsyncSelect } from "chakra-react-select";
import ModuleSortContainer from "../components/Sortables/ModuleSort/ModuleSortContainer";
import ClassSortContainer from "../components/Sortables/ClassSort/ClassSortContainer";
import { sendPOST } from "../lib/fetcher";
import { ModuleCondensed } from "../types/modules";
import { RootState } from "../types/types";
import { ResponseData } from "./api/modules";
import { classesActions } from "../store/classesReducer";

import { Option } from "../types/types";
import ResultContainer from "../components/Sorted/ResultContainer";
import NextLink from "next/link";
import { useRouter } from "next/router";

const ay = process.env.NEXT_PUBLIC_AY;
const Order: NextPage = () => {
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

    // fetch the list of modules from nusmods
    const [moduleList, setModuleList] = useState<ModuleCondensed[]>();

    useEffect(() => {
        if (!ay) console.log("ERROR: no ay");
        fetch(`https://api.nusmods.com/v2/${ay}/moduleList.json`)
            .then((res) => res.json())
            .then((data) => {
                console.log("this is the data");
                console.log(data);
                setModuleList(data);
            });
    }, [ay]);

    const loadOptions = (inputValue: string) =>
        new Promise<any[]>((resolve) => {
            if (!moduleList) return resolve([]);

            const sanitizedValue = inputValue.trim().toUpperCase();
            if (inputValue.length < 4 || inputValue.length > 8) return;

            const matchedModules = moduleList.filter((module) =>
                module.moduleCode.includes(sanitizedValue)
            );

            if (!matchedModules.length) return resolve([]);

            // Request from internal database
            sendPOST(`/api/modules`, {
                modules: matchedModules,
            }).then((result: ResponseData) => {
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
        const response: ResponseData = await sendPOST("/api/modules", {
            modules: modules.map((module) => ({
                moduleCode: module.split(":")[0],
            })),
        });

        console.log({ response });
        if (!response.success || !response.data)
            return alert("Unexpected error");
        dispatch(classesActions.addAvailableClasses(response.data));

        setSelectedModules([]);
    };

    const removeAll = () => {
        dispatch(classesActions.removeAll());
    }

    return (
        <Stack spacing={5}>
            <Flex>
                <Box flex={1} mr={3}>
                    <AsyncSelect
                        instanceId={`${ay}-select`}
                        closeMenuOnSelect={false}
                        placeholder="Search for a module..."
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
                </Box>
                <Button onClick={() => addModules()}> Add </Button>
            </Flex>
            <Center>
                <Button size="sm" colorScheme="red" onClick={() => removeAll()}>
                    {" "}
                    Remove all mods{" "}
                </Button>
            </Center>

            <ModuleSortContainer />
            <ClassSortContainer />
            <Center>
                <ResultContainer />
            </Center>
        </Stack>
    );
};

export default Order;
