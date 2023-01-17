import { configureStore } from "@reduxjs/toolkit";
import { RootState } from "../types/types";
import classesSlice from "./classesReducer";
import miscSlice from "./misc";
import timetableSlice from "./timetableReducer";
import userSlice from "./user";


const saveState = (state: RootState) => {
    try {
        const serializedClassesInfoState = JSON.stringify(state.classesInfo);
        localStorage.setItem("classesInfo", serializedClassesInfoState);

        const serializedUserState = JSON.stringify(state.user);
        localStorage.setItem("user", serializedUserState);
    } catch (err) {
        console.log(err);
    }
};
const store = configureStore({
    reducer: {       
        // dashboard: dashboardSlice.reducer,
        // status: statusSlice.reducer,
        // personnel: personnelSlice.reducer
        classesInfo: classesSlice.reducer,
        user: userSlice.reducer,
        misc: miscSlice.reducer,
        timetable: timetableSlice.reducer
    }
})

store.subscribe(() => saveState(store.getState()))
export default store