import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TelegramUser } from "telegram-login-button";
import { canBeBidFor } from "../lib/functions";
import { Data } from "../pages/api/import";
import { ModuleCodeLessonType, ClassOverview } from "../types/types";
import { FullInfo, HalfInfo } from "../pages/swap/create";

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
  timetableModifyingMode: (HalfInfo & { classNo?: string }) | null; // true when user clicks "Add class" in dual mode

  currentlyHoveredClassInMain: FullInfo | null;
  currentlyHoveredClassInTimetable: FullInfo | null;

  dualMode: boolean;
  offset: number;
}
let loadedState = loadState();

// Migration script
(() => {
  // if no notifications key, add it
  if (loadedState && !("notifications" in loadedState)) {
    loadedState = {
      ...loadedState,
      notifications: {
        changedTo2023S1: false,
      },
    };
  }

  if (loadedState && !("timetableModifyingMode" in loadedState)) {
    loadedState = {
      ...loadedState,
      timetableModifyingMode: null,
    };
  }

  if (loadedState && !("currentlyHoveredClassInMain" in loadedState)) {
    loadedState = {
      ...loadedState,
      currentlyHoveredClassInMain: null,
    };
  }

  if (loadedState && !("currentlyHoveredClassInTimetable" in loadedState)) {
    loadedState = {
      ...loadedState,
      currentlyHoveredClassInTimetable: null,
    };
  }

  if (loadedState && !("dualMode" in loadedState)) {
    loadedState = {
      ...loadedState,
      dualMode: true,
    };
  }

  if (loadedState && !("offset" in loadedState)) {
    loadedState = {
      ...loadedState,
      offset: 0.0,
    };
  }
})();

const initialState: MiscState = loadedState || {
  needsLogIn: false,
  notify: false,
  highlightedClassNos: [],
  notifications: {
    changedTo2023S1: false,
  },
  timetableModifyingMode: null,
  dualMode: true,
  offset: 0.0,
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
      state.notifications.changedTo2023S1 = true;
    },
    setTimetableModifyingMode: (
      state,
      action: PayloadAction<(HalfInfo & { classNo?: string }) | null>
    ) => {
      state.timetableModifyingMode = action.payload;
    },

    setCurrentlyHoveredClassInMain: (
      state,
      action: PayloadAction<FullInfo | null>
    ) => {
      state.currentlyHoveredClassInMain = action.payload;
    },
    setCurrentlyHoveredClassInTimetable: (
      state,
      action: PayloadAction<FullInfo | null>
    ) => {
      state.currentlyHoveredClassInTimetable = action.payload;
    },
    setDualMode: (state, action: PayloadAction<boolean>) => {
      state.dualMode = action.payload;
    },
    setOffset: (state, action: PayloadAction<number>) => {
      state.offset = action.payload;
    },
  },
});

export const miscActions = miscSlice.actions;
export default miscSlice;
