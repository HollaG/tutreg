import { getInitialState } from "@dnd-kit/core/dist/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { canBeBidFor } from "../lib/functions";
import { Data } from "../pages/api/import";
import { TimetableLessonEntry } from "../types/timetable";
import { ModuleCodeLessonType, ClassOverview } from "../types/types";

const AY = process.env.NEXT_PUBLIC_AY || "";
const SEM = process.env.NEXT_PUBLIC_SEM || "";

const loadState = () => {
    try {
        const serializedState = localStorage.getItem("classesInfo");

        if (!serializedState) return undefined;
        else {
            // because we update the site, we need to update the state
            // some people might not have colorMap yet.
            const parsedState = JSON.parse(serializedState);

            if (!("colorMap" in parsedState) || !parsedState.colorMap.length) {
                parsedState.colorMap = parsedState.moduleOrder;
                localStorage.setItem(
                    "classesInfo",
                    JSON.stringify(parsedState)
                );
            }

            return JSON.parse(serializedState);
        }
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

    // for color mapping
    // colorMap: {
    //     [moduleCodeLessonType: string]: string;
    // };

    colorMap: (string | null)[];

    // new Date().getTime().getTime()
    lastUpdated: number;

    AY: string;
    SEM: string;
}

const init: ClassState = {
    selectedClasses: {},
    totalModuleCodeLessonTypeMap: {},
    moduleOrder: [],
    nonBiddable: {},
    changedClasses: [],
    disabledClasses: [],
    unmodifyableClasses: [],
    colorMap: [],
    lastUpdated: new Date().getTime(),

    AY,
    SEM,
};
const initialState: ClassState = { ...init, ...loadState() };

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
                // colorMap: {},
                colorMap: Object.keys(selectedBiddableClasses),
                lastUpdated: new Date().getTime(),

                AY,
                SEM,
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
                lastUpdated: new Date().getTime(),
            };
        },
        addModules(state, action: PayloadAction<string[]>) {
            // for the colormap, the new moduleCodeLessonType must be added to either the end of the
            // array, or the first undefined element
            const newColorMap: (string | null)[] = [...state.colorMap];
            action.payload.forEach((moduleCodeLessonType) => {
                const index = newColorMap.indexOf(null);
                if (index === -1) {
                    newColorMap.push(moduleCodeLessonType);
                } else {
                    newColorMap[index] = moduleCodeLessonType;
                }
            });

            return {
                ...state,
                moduleOrder: [...state.moduleOrder, ...action.payload],
                colorMap: newColorMap,
                lastUpdated: new Date().getTime(),
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

            // todo: set colors
            // set this moduleCodeLessonType to be undefined in the colorMap
            const index = state.colorMap.indexOf(action.payload);
            const newColorMap = [...state.colorMap];
            newColorMap[index] = null;

            return {
                moduleOrder: newModuleOrder,
                selectedClasses: newSelectedClasses,
                totalModuleCodeLessonTypeMap: newTotalModuleCodeLessonTypeMap,
                nonBiddable: { ...state.nonBiddable },
                changedClasses: [...state.changedClasses],
                disabledClasses: [...state.disabledClasses],
                unmodifyableClasses: [...state.unmodifyableClasses],
                // colorMap: { ...state.colorMap },
                colorMap: newColorMap,
                lastUpdated: new Date().getTime(),
                AY,
                SEM,
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
                lastUpdated: new Date().getTime(),
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
                lastUpdated: new Date().getTime(),
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

                // set this moduleCodeLessonType to be undefined in the colorMap
                // const index = state.colorMap.indexOf(moduleCodeLessonType);
                // const newColorMap = [...state.colorMap];
                // newColorMap[index] = null;

                delete newState[moduleCodeLessonType];
                return {
                    ...state,
                    selectedClasses: newState,
                    lastUpdated: new Date().getTime(),
                    // colorMap: newColorMap,
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
                lastUpdated: new Date().getTime(),
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
                colorMap: [],
                lastUpdated: new Date().getTime(),
                AY,
                SEM,
                // colorMap: {},
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
                    lastUpdated: new Date().getTime(),
                };
            } else {
                // remove
                return {
                    ...state,
                    changedClasses: state.changedClasses.filter(
                        (classNo) => classNo !== action.payload.class_.classNo
                    ),
                    lastUpdated: new Date().getTime(),
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
                    lastUpdated: new Date().getTime(),
                };
            } else {
                return {
                    ...state,
                    changedClasses: [],
                    lastUpdated: new Date().getTime(),
                };
            }
        },

        // Remove all classes
        removeChangedClasses(state) {
            return {
                ...state,
                changedClasses: [],
                lastUpdated: new Date().getTime(),
            };
        },
        updateMainList(state, action: PayloadAction<string>) {
            // moduleCodeLessonType
            const moduleCodeLessonType = action.payload;
            const copiedAvailableClasses = {
                ...state.totalModuleCodeLessonTypeMap,
            };

            const copiedChangedClasses = [...state.changedClasses];
          

            // const selectedClassesForCode: ClassOverview[] =
            //     copiedAvailableClasses[moduleCodeLessonType].filter((class_) =>
            //         copiedChangedClasses.includes(class_.classNo)
            //     );

    

            const previousOrder = [...state.selectedClasses[moduleCodeLessonType]]
            const previousClasses = previousOrder.map(class_ => class_.classNo)

            const newClasses = copiedChangedClasses.filter(classNo => !previousClasses.includes(classNo))

            // only keep classes that were not removed
            const newOrderWithRemovedClasses = previousOrder.filter(
                (class_) => copiedChangedClasses.includes(class_.classNo)
            );
    
            // add the new classes at the end
            const newClassesSelected: ClassOverview[] = copiedAvailableClasses[moduleCodeLessonType].filter((class_) => newClasses.includes(class_.classNo));
            const newOrderWithAddedClasses = [
                ...newOrderWithRemovedClasses,
                ...newClassesSelected
            ];

            if (newOrderWithAddedClasses[0]) {
                return {
                    ...state,
                    selectedClasses: {
                        ...state.selectedClasses,
                        [moduleCodeLessonType]: newOrderWithAddedClasses,
                    },
                    changedClasses: [],
                    lastUpdated: new Date().getTime(),
                };
            } else {
                const newState = {
                    ...state,
                    selectedClasses: {
                        ...state.selectedClasses,
                    },
                    changedClasses: [],
                    lastUpdated: new Date().getTime(),
                };
                delete newState.selectedClasses[moduleCodeLessonType];
                return newState;
            }
        },
    },
});

export const classesActions = classesSlice.actions;
export default classesSlice;
