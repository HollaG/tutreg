import { configureStore } from "@reduxjs/toolkit";
import { RootState } from "../types/types";
import classesSlice from "./classesReducer";


// const saveState = (state: RootState) => {
//     try {
//         const serializedState = JSON.stringify(state.classesInfo);
//         localStorage.setItem("classesInfo", serializedState);
//     } catch (err) {
//         console.log(err);
//     }
// };
const store = configureStore({
    reducer: {       
        // dashboard: dashboardSlice.reducer,
        // status: statusSlice.reducer,
        // personnel: personnelSlice.reducer
        classesInfo: classesSlice.reducer
    }
})

// store.subscribe(() => saveState(store.getState()))
export default store