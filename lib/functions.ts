// Function to cut a string to just the first 3 letters, capitalized.
// Input: 
//     Sectional Teaching
// Output: 

import { ClassDB } from "../types/db";

//     SEC
export const keepAndCapFirstThree = (string: string) => {
    return string.substring(0, 3).toUpperCase();
}

// Function to sort by day of week, with Monday being the first day.
// This function will be the callback function used in .sort().
export const sortByDay = (class_1: ClassDB, class_2: ClassDB) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const day_1 = days.indexOf(class_1.day) 
    const day_2 = days.indexOf(class_2.day)
    return day_1 - day_2;
}

// Function to return an alphabet corresponding to an index
// Input: 
//    0
// Output:
//    A
export const getAlphabet = (index: number) => {
    return String.fromCharCode(65 + index);
}

// Function which returns true or false based on if the module can be bid for in tutreg round.
// Input:
//   moduleCode or lessonType: string;, for e.g.: Lecture, RVX1000
// Output:
//   false, false

export const canBeBidFor = (moduleCode: string, lessonType: string) => {

    return !(lessonType.toLocaleLowerCase().startsWith("lec") || moduleCode.toUpperCase().startsWith("RV") || moduleCode.toUpperCase().startsWith("UT"))  

}