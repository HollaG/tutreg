import { FormControl, FormHelperText, useToast } from "@chakra-ui/react";
import { AsyncSelect, InputActionMeta } from "chakra-react-select";
import React from "react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { sendPOST } from "../../lib/fetcher";
import { ERROR_TOAST_OPTIONS } from "../../lib/toasts.utils";
import { ModulesResponseData } from "../../pages/api/modules";
import { ModuleCondensed } from "../../types/modules";

import { RootState, Option } from "../../types/types";
const ay = process.env.NEXT_PUBLIC_AY;

const ModuleSelect: React.FC<{
    onSelect?: (option: Option[]) => void;
    isMulti?: boolean;

    setModuleCodeLessonTypeValue?: Dispatch<SetStateAction<string>>;
    moduleCodeLessonTypeValue?: string;
    defaultValue?: Option;
    hideNonBiddable?: boolean; // hides modules that are not biddable
    additionalFilter?: (option: Option) => boolean;
}> = ({
    onSelect,
    isMulti = true,
    defaultValue,
    hideNonBiddable = true,
    additionalFilter,
}) => {
    // fetch the list of modules from nusmods
    const [moduleList, setModuleList] = useState<ModuleCondensed[]>();
    const data = useSelector((state: RootState) => state.classesInfo);
    const [moduleCodeLessonTypeValue, setModuleCodeLessonTypeValue] =
        useState("");
    useEffect(() => {
        fetch(`https://api.nusmods.com/v2/${ay || "2022-2023"}/moduleList.json`)
            .then((res) => res.json())
            .then((data) => {
                setModuleList(data);
            });
    }, []);
    const [selectedModules, setSelectedModules] = useState<Option[]>([]);

    const handleInputChange = (
        newValue: string,
        { action }: InputActionMeta
    ) => {
        setModuleCodeLessonTypeValue(newValue);
        return newValue;
    };

    const handleSelectChange = (newValue: Option[]) => {
        setSelectedModules(newValue);
        setTimeout(() => {});
        setModuleCodeLessonTypeValue(moduleCodeLessonTypeValue);
        if (onSelect) {
            onSelect(Array.isArray(newValue) ? newValue : [newValue]);
        }
    };

    const toast = useToast();
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
                hideNonBiddable,
            }).then((result: ModulesResponseData) => {
                if (!result.success || !result.data)
                    return toast({
                        title: "Error",
                        description: result?.error?.toString(),
                        ...ERROR_TOAST_OPTIONS,
                    });

                let options = Object.keys(result.data).map((key) => ({
                    value: key,
                    label: key,
                }));

                if (additionalFilter) {
                    options = options.filter(additionalFilter);
                }
                // filter the options to remove a) already selected b) already in classesSelected
                // TODO: Filter the options or not?
                // const filteredOptions = options.filter(
                //     (option) =>
                //         !(
                //             selectedModules
                //                 .map((sel) => sel.value)
                //                 .includes(option.value) ||
                //             data.moduleOrder.includes(option.value)
                //         )
                // );

                // Group the options by module code
                const groupedOptions: {
                    label: string;
                    options: Option[];
                }[] = [];

                options.forEach((option) => {
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

    return (
        <FormControl>
            <AsyncSelect
                instanceId={`${ay}-select`}
                placeholder="Search..."
                value={selectedModules}
                isMulti={isMulti}
                // cacheOptions
                loadOptions={loadOptions}
                onInputChange={handleInputChange}
                onChange={(newValue: any) => handleSelectChange(newValue)}
                defaultValue={defaultValue}
                closeMenuOnSelect={!isMulti}
            />
            <FormHelperText>Search for a course (min. 3 chars)</FormHelperText>
            {!hideNonBiddable && (
                <FormHelperText>
                    Courses unavailable for bidding in tutorial rounds are not
                    shown.
                </FormHelperText>
            )}
        </FormControl>
    );
};

export default React.memo(ModuleSelect);
