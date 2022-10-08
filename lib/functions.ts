// Function to cut a string to just the first 3 letters, capitalized.
// Input:
//     Sectional Teaching
// Output:

import { ClassDB } from "../types/db";
import { WeekRange, Weeks } from "../types/modules";
import { ClassOverview, ModuleCodeLessonType } from "../types/types";

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
export const combineNumbers = (numbers: (string|number)[]) => {

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

// Function to generate the NUSMods Timetable Link based on the modules selected
export const generateLink = (classesSelected: ModuleCodeLessonType, priority = 0) => {
    const holder: {
        [moduleCode: string]: ClassOverview[]
    } = {}
    for (const moduleCodeLessonType in classesSelected) { 
        const classes = classesSelected[moduleCodeLessonType];
        const moduleCode = classes[0].moduleCode
        const lessonType = classes[0].lessonType

        if (!holder[moduleCode]) holder[moduleCode] = [];
        holder[moduleCode].push(classes[0]); // only add the first class selected. TODO: Change this to be user selectable
    }

    const holder2: {
        [moduleCode: string]: string
    } = {}

    for (const moduleCode in holder) { 
        holder2[moduleCode] = holder[moduleCode].map(classes => `${keepAndCapFirstThree(classes.lessonType)}:${classes.classNo}`).join(",")
    }

    // let link = "https://nusmods.com/timetable/sem-1/share?CFG1002=&CS1101S=TUT:09F,REC:11B,LEC:1&CS1231S=TUT:08A,LEC:1&IS1108=TUT:03,LEC:1&MA2001=TUT:31,LAB:5,LEC:1&RVX1002=SEC:2"
    let link = `https://nusmods.com/timetable/sem-${process.env.NEXT_PUBLIC_SEM}/share?`

    
    link += new URLSearchParams(holder2).toString()
    return link;
}

// Function to clean the mysql stringified array
export const cleanArrayString = (arrayString: string) => !arrayString ? "" : arrayString.trim().split(",").filter(x => x)


// Function to return an array of weeks based on the `weeks` property.
// Input: 
//     [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
// Output:
//     [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// Input: 
// "weeks": {
//     "start": "2019-01-17",
//     "end": "2019-04-18"
// }
// Output: 
//     TODO 

// Input: 
// "weeks": {
//     "start": "2019-01-17",
//     "end": "2019-02-21",
//     "weeks": [1, 2, 4, 6]
// }
// Output: 
//     [1, 2, 4, 6]

// Input: 
// "weeks": {
//     "start": "2019-01-17",
//     "end": "2019-02-28",
//     "weekInterval": 2
// }
// Output: 
//     ["Every 2 weeks"]

export const formatWeeks = (weeks: Weeks) => {
    if (Array.isArray(weeks)) {
        return weeks;
    } else {
        if (weeks.weeks) {
            return weeks.weeks;
        } else if (weeks.weekInterval) {
            return [`Every ${weeks.weekInterval} weeks`];
        } else {
            return [`Varies, please consult NUSMods.`];
        }
    }
}

// Function to check if there are different week ranges for lessons
// Input: 
//     [1,2,3,4,5,6,7,8,9,10] // all the same
// Output: false
// Input: 
//     2 different arrays
// Output: true

export const checkMultipleDifferentWeeks = (weeks: Weeks[]) => {
    if (weeks.length === 1) {
        return false
    } else {
        const first = weeks[0]
        if (weeks.every(x => x === first)) {
            return false
        } else {
            return true;
        }
    }
}

// Function to check if there are different vacancies for lessons
// Input:
//     [25, 25, 25, 30, 90]
// Output: 
//     "25 - 90"

// Input:
//    [25, 25, 25, 25, 25]
// Output:
//    "25"

export const getVacanciesForAllLessons = (vacancies: number[]) => {
    console.log({vacancies})
    const min = Math.min(...vacancies);
    const max = Math.max(...vacancies);
    if (min === max) return min;
    else return `${min}-${max}`;
}


