import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { canBeBidFor } from "../lib/functions";
import { Data } from "../pages/api/import";
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
const initialState: Data = loadState() || {
    selectedClasses: [],
    totalModuleCodeLessonTypeMap: {},
    moduleOrder: [],
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

            state.selectedClasses = selectedBiddableClasses;

            state.totalModuleCodeLessonTypeMap =
                action.payload.totalModuleCodeLessonTypeMap;

            // TODO: decouple moduleOrder from Data type
            state.moduleOrder = Object.keys(selectedBiddableClasses);
            console.log("Set state to");
            console.log(action.payload);
        },

        changeModuleCodeLessonTypeOrder(
            state,
            action: PayloadAction<string[]>
        ) {
            state.moduleOrder = action.payload;
        },
        addModules(state, action: PayloadAction<string[]>) {
            state.moduleOrder = [...state.moduleOrder, ...action.payload];
        },

        removeModule(state, action: PayloadAction<string>) {
            state.moduleOrder = state.moduleOrder.filter(
                (moduleCode) => moduleCode !== action.payload
            );

            // delete the selected classes
            const newSelectedClasses = { ...state.selectedClasses };
            delete newSelectedClasses[action.payload];
            state.selectedClasses = newSelectedClasses;

            // delete the data from the totalModuleCodeLessonTypeMap to prevent memory leaks too
            const newTotalModuleCodeLessonTypeMap = {
                ...state.totalModuleCodeLessonTypeMap,
            };
            delete newTotalModuleCodeLessonTypeMap[action.payload];
            state.totalModuleCodeLessonTypeMap =
                newTotalModuleCodeLessonTypeMap;
        },
        addAvailableClasses(
            state,
            action: PayloadAction<ModuleCodeLessonType>
        ) {
            state.totalModuleCodeLessonTypeMap = {
                ...state.totalModuleCodeLessonTypeMap,
                ...action.payload,
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

            const copiedAvailableClasses = {...state.totalModuleCodeLessonTypeMap}

            const selectedClass = copiedAvailableClasses[
                moduleCodeLessonType
            ].find((class_) => class_.classNo === classNo);

            
            if (!selectedClass) return;

            return {
                ...state,
                selectedClasses: {
                    ...state.selectedClasses,
                    [moduleCodeLessonType]: [...(state.selectedClasses[moduleCodeLessonType] || []), selectedClass],
                }
            }
        },

        removeSelectedClass(
            state,
            action: PayloadAction<{
                moduleCodeLessonType: string;
                classNo: string;
            }>
        ) {
            const { moduleCodeLessonType, classNo } = action.payload;
            state.selectedClasses[moduleCodeLessonType] = state.selectedClasses[
                moduleCodeLessonType
            ].filter((class_) => class_.classNo !== classNo);
        },
        changeClassOrder(
            state,
            action: PayloadAction<{
                newOrder: ClassOverview[];
                moduleCodeLessonType: string;
            }>
        ) {
            state.selectedClasses[action.payload.moduleCodeLessonType] =
                action.payload.newOrder;
        },
        removeAll(state) {
            return {
                moduleOrder: [],
                selectedClasses: {},
                totalModuleCodeLessonTypeMap: {}
            }
        }
    },
});

export const classesActions = classesSlice.actions;
export default classesSlice;
