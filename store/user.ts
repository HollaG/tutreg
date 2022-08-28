import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TelegramUser } from "telegram-login-button";
import { canBeBidFor } from "../lib/functions";
import { Data } from "../pages/api/import";
import { ModuleCodeLessonType, ClassOverview } from "../types/types";

const loadState = () => {
    try {
        const serializedState = localStorage.getItem("user");
        if (!serializedState) return undefined;
        else return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};

const initialState: TelegramUser | null = loadState() || null;

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<TelegramUser>) => {
            return action.payload;
        },
        logout: (state) => {
            return null;
        },
    },
});

export const userActions = userSlice.actions;
export default userSlice;
