import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TelegramUser } from "telegram-login-button";
import { canBeBidFor } from "../lib/functions";
import { Data } from "../pages/api/import";
import { ModuleCodeLessonType, ClassOverview } from "../types/types";

const loadState = () => {
    try {
        const serializedState = localStorage.getItem("misc");
        if (!serializedState) return undefined;
        else return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};

export interface MiscState {
    needsLogIn: boolean;
    notify: boolean;
    highlightedClassNos: string[];
    notifications: {
        changedTo2023S1: boolean;
    };
}

const initialState: MiscState = {
    needsLogIn: false,
    notify: false,
    highlightedClassNos: [],
    notifications: {
        changedTo2023S1: false,
    },
};

const miscSlice = createSlice({
    name: "misc",
    initialState,
    reducers: {
        setNeedsLogIn: (state, action: PayloadAction<boolean>) => {
            state.needsLogIn = action.payload;
        },
        updateNotificationStatus: (state, action: PayloadAction<boolean>) => {
            state.notify = action.payload;
        },
        setHighlightedClassNos: (state, action: PayloadAction<string[]>) => {
            state.highlightedClassNos = action.payload;
        },
        setAcadYearNotificationDismissed: (state) => {
            state.notifications.changedTo2023S1 = false;
        },
    },
});

export const miscActions = miscSlice.actions;
export default miscSlice;
