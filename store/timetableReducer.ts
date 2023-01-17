import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { canBeBidFor } from "../lib/functions";
import { Data } from "../pages/api/import";
import { ModuleCodeLessonType, ClassOverview } from "../types/types";

const loadState = () => {
    try {
        const serializedState = localStorage.getItem("timetable");
        if (!serializedState) return undefined;
        else return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};


const initialState = loadState() || {}

const timetableSlice = createSlice({
    name: "timetable",
    initialState,
    reducers: {
        setState(state, action: PayloadAction<Data>) {

        },

    
    },
});

export const timetableActions = timetableSlice.actions;
export default timetableSlice;
