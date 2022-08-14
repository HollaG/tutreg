// Function to cut a string to just the first 3 letters, capitalized.
// Input:
//     Sectional Teaching
// Output:

import { ClassDB } from "../types/db";

//     SEC
export const keepAndCapFirstThree = (string: string) => {
    return string.substring(0, 3).toUpperCase();
};

// Function to sort by day of week, with Monday being the first day.
// This function will be the callback function used in .sort().
export const sortByDay = (class_1: ClassDB, class_2: ClassDB) => {
    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];
    const day_1 = days.indexOf(class_1.day);
    const day_2 = days.indexOf(class_2.day);
    return day_1 - day_2;
};

// Function to return an alphabet corresponding to an index
// Input:
//    0
// Output:
//    A
export const getAlphabet = (index: number) => {
    return String.fromCharCode(65 + index);
};

// Function which returns true or false based on if the module can be bid for in tutreg round.
// Input:
//   moduleCode or lessonType: string;, for e.g.: Lecture, RVX1000
// Output:
//   false, false

export const canBeBidFor = (moduleCode: string, lessonType: string) => {
    return !(
        lessonType.toLocaleLowerCase().startsWith("lec") ||
        moduleCode.toUpperCase().startsWith("RV") ||
        moduleCode.toUpperCase().startsWith("UT")
    );
};

// Function which combines an array of numbers, making it easier to read.
// Input:
//   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
// Output:
//   [1,10]
// Input:
//   [1,2,3, 5,6,7, 9]
// Output:
//   [1,3, 5,7, 9,9]
export const combineNumbers = (numbers: string[]) => {
    let combined = [];
    let holder: number[] = [];
    for (let i = 0; i < numbers.length; i++) {
        // if (i === 0) {
        //     combined += numbers[i];
        // } else if (i === numbers.length - 1) {
        //     combined += "-" + numbers[i];
        // } else {
        //     combined += ", " + numbers[i];
        // }
        const number = Number(numbers[i])
        if (!holder[0]) holder[0] = number;

        if (i === numbers.length - 1) {
            holder[1] = number;
        } else if (holder[0]) {
            if (Number(numbers[i + 1]) - number === 1) {
                // the next number is 1 away from the current number, ignore
            } else {
                // the next number if more than 1 away
                holder[1] = number
            }
        }

        if (holder[0] && holder[1]) {
            if (holder[0] === holder[1]) combined.push(holder[0]);
            else combined.push(`${holder[0]}-${holder[1]}`);

            holder = [];
        }
    }

    return combined.join(", ");
};

export const combineArrayNumbers = (array: number[]) => {};
