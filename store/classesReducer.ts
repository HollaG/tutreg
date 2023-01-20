import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { canBeBidFor } from "../lib/functions";
import { Data } from "../pages/api/import";
import { TimetableLessonEntry } from "../types/timetable";
import { ModuleCodeLessonType, ClassOverview } from "../types/types";

const loadState = () => {
    try {
        const serializedState = localStorage.getItem("classesInfo");
        if (!serializedState) return undefined;
        else return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};

export interface ClassState extends Data {
    moduleOrder: string[];
    nonBiddable: ModuleCodeLessonType;
    changedClasses: string[];
    disabledClasses: string[];
    unmodifyableClasses: string[];
}
const initialState: ClassState = loadState() || {
    selectedClasses: {},
    totalModuleCodeLessonTypeMap: {},
    moduleOrder: [],
    nonBiddable: {},
    changedClasses: [],
    disabledClasses: [],
    unmodifyableClasses: [],
};

const classesSlice = createSlice({
    name: "classesInfo",
    initialState,
    reducers: {
        setState(state, action: PayloadAction<Data>) {
            // Filter out any classes are that a lecture (have "lec" in the module name)
            const selectedBiddableClasses: ModuleCodeLessonType = {};
            const nonBiddableClasses: ModuleCodeLessonType = {};
            Object.keys(action.payload.selectedClasses).forEach(
                (moduleCodeLessonType) => {
                    if (
                        canBeBidFor(
                            moduleCodeLessonType.split(": ")[0],
                            moduleCodeLessonType.split(": ")[1]
                        )
                    ) {
                        selectedBiddableClasses[moduleCodeLessonType] =
                            action.payload.selectedClasses[
                                moduleCodeLessonType
                            ];
                    } else {
                        nonBiddableClasses[moduleCodeLessonType] =
                            action.payload.selectedClasses[
                                moduleCodeLessonType
                            ];
                    }
                }
            );

            return {
                selectedClasses: selectedBiddableClasses,
                totalModuleCodeLessonTypeMap:
                    action.payload.totalModuleCodeLessonTypeMap,
                moduleOrder: Object.keys(selectedBiddableClasses),
                nonBiddable: nonBiddableClasses,
                changedClasses: [],
                disabledClasses: [],
                unmodifyableClasses: [],
            };

            state.selectedClasses = selectedBiddableClasses;

            state.totalModuleCodeLessonTypeMap =
                action.payload.totalModuleCodeLessonTypeMap;

            // TODO: decouple moduleOrder from Data type
            state.moduleOrder = Object.keys(selectedBiddableClasses);
        },

        changeModuleCodeLessonTypeOrder(
            state,
            action: PayloadAction<string[]>
        ) {
            return {
                ...state,
                moduleOrder: action.payload,
            };
        },
        addModules(state, action: PayloadAction<string[]>) {
            return {
                ...state,
                moduleOrder: [...state.moduleOrder, ...action.payload],
            };
        },

        removeModule(state, action: PayloadAction<string>) {
            // state.moduleOrder = state.moduleOrder.filter(
            //     (moduleCode) => moduleCode !== action.payload
            // );

            const newModuleOrder: string[] = state.moduleOrder.filter(
                (moduleCode) => moduleCode !== action.payload
            );

            // delete the selected classes
            const newSelectedClasses: ModuleCodeLessonType = {
                ...state.selectedClasses,
            };
            delete newSelectedClasses[action.payload];
            // state.selectedClasses = newSelectedClasses;

            // delete the data from the totalModuleCodeLessonTypeMap to prevent memory leaks too
            const newTotalModuleCodeLessonTypeMap: ModuleCodeLessonType = {
                ...state.totalModuleCodeLessonTypeMap,
            };
            delete newTotalModuleCodeLessonTypeMap[action.payload];
            // state.totalModuleCodeLessonTypeMap =
            //     newTotalModuleCodeLessonTypeMap;

            return {
                moduleOrder: newModuleOrder,
                selectedClasses: newSelectedClasses,
                totalModuleCodeLessonTypeMap: newTotalModuleCodeLessonTypeMap,
                nonBiddable: { ...state.nonBiddable },
                changedClasses: [...state.changedClasses],
                disabledClasses: [...state.disabledClasses],
                unmodifyableClasses: [...state.unmodifyableClasses],
            };
        },
        addAvailableClasses(
            state,
            action: PayloadAction<ModuleCodeLessonType>
        ) {
            return {
                ...state,
                totalModuleCodeLessonTypeMap: {
                    ...state.totalModuleCodeLessonTypeMap,
                    ...action.payload,
                },
            };
        },

        addSelectedClass(
            state,
            action: PayloadAction<{
                moduleCodeLessonType: string;
                classNo: string;
            }>
        ) {
            const { moduleCodeLessonType, classNo } = action.payload;

            const copiedAvailableClasses: ModuleCodeLessonType = {
                ...state.totalModuleCodeLessonTypeMap,
            };

            const selectedClass = copiedAvailableClasses[
                moduleCodeLessonType
            ].find((class_) => class_.classNo === classNo);

            if (!selectedClass) return;

            return {
                ...state,
                selectedClasses: {
                    ...state.selectedClasses,
                    [moduleCodeLessonType]: [
                        ...(state.selectedClasses[moduleCodeLessonType] || []),
                        selectedClass,
                    ],
                },
            };
        },

        removeSelectedClass(
            state,
            action: PayloadAction<{
                moduleCodeLessonType: string;
                classNo: string;
            }>
        ) {
            const { moduleCodeLessonType, classNo } = action.payload;
            const remainingClasses: ClassOverview[] = state.selectedClasses[
                moduleCodeLessonType
            ].filter((class_) => class_.classNo !== classNo);

            if (remainingClasses.length) {
                return {
                    ...state,
                    selectedClasses: {
                        ...state.selectedClasses,
                        [moduleCodeLessonType]: remainingClasses,
                    },
                };
            } else {
                const newState: ModuleCodeLessonType = {
                    ...state.selectedClasses,
                };
                delete newState[moduleCodeLessonType];
                return {
                    ...state,
                    selectedClasses: newState,
                };
            }
        },
        changeClassOrder(
            state,
            action: PayloadAction<{
                newOrder: ClassOverview[];
                moduleCodeLessonType: string;
            }>
        ) {
            return {
                ...state,
                selectedClasses: {
                    ...state.selectedClasses,
                    [action.payload.moduleCodeLessonType]:
                        action.payload.newOrder,
                },
            };
        },
        removeAll(state) {
            return {
                moduleOrder: [],
                selectedClasses: {},
                totalModuleCodeLessonTypeMap: {},
                nonBiddable: {},
                changedClasses: [],
                disabledClasses: [],
                unmodifyableClasses: [],
            };
        },
        setChangedClasses(state, action: PayloadAction<string[]>) {
            return {
                ...state,
                changedClasses: action.payload,
            };
        },

        // This method adds or removes classes based on the selected prop.
        updateChangedClasses(
            state,
            action: PayloadAction<{
                class_: TimetableLessonEntry;
                selected: boolean;
            }>
        ) {
            if (action.payload.selected) {
                // add
                return {
                    ...state,
                    changedClasses: [
                        ...state.changedClasses,
                        action.payload.class_.classNo,
                    ],
                };
            } else {
                // remove
                return {
                    ...state,
                    changedClasses: state.changedClasses.filter(
                        (classNo) => classNo !== action.payload.class_.classNo
                    ),
                };
            }
        },

        // This method adds, or removes a class from the list, but with the added
        // restriction that the max size of the array is one.
        changeChangedClass(
            state,
            action: PayloadAction<{
                class_: TimetableLessonEntry;
                selected: boolean;
            }>
        ) {
            const { class_, selected } = action.payload;
            if (selected) {
                return {
                    ...state,
                    changedClasses: [class_.classNo],
                };
            } else {
                return {
                    ...state,
                    changedClasses: [],
                };
            }
        },

        // Remove all classes
        removeChangedClasses(state) {
            return {
                ...state,
                changedClasses: [],
            };
        },
        updateMainList(state, action: PayloadAction<string>) {
            // moduleCodeLessonType
            const moduleCodeLessonType = action.payload;
            const copiedAvailableClasses = {
                ...state.totalModuleCodeLessonTypeMap,
            };

            const copiedChangedClasses = [...state.changedClasses];

            const selectedClassesForCode: ClassOverview[] =
                copiedAvailableClasses[moduleCodeLessonType].filter((class_) =>
                    copiedChangedClasses.includes(class_.classNo)
                );

            console.log({ selectedClassesForCode });

            if (selectedClassesForCode[0]) {
                return {
                    ...state,
                    selectedClasses: {
                        ...state.selectedClasses,
                        [moduleCodeLessonType]: selectedClassesForCode,
                    },
                    changedClasses: [],
                };
            } else {
                const newState = {
                    ...state,
                    selectedClasses: {
                        ...state.selectedClasses,
                    },
                    changedClasses: [],
                };
                delete newState.selectedClasses[moduleCodeLessonType];
                return newState;
            }
        },
    },
});

export const classesActions = classesSlice.actions;
export default classesSlice;
