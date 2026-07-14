// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import executeQuery from "../../lib/db";
import {
  convertDayToAbbrev,
  decodeLessonTypeShorthand,
  formatWeeks,
} from "../../lib/functions";
import { ModuleDB, ModuleWithClassDB } from "../../types/db";
import { LessonTypeAbbrev, Module, RawLesson } from "../../types/modules";
import { ModuleCodeLessonType } from "../../types/types";
import { match } from "assert";

export interface Data {
  selectedClasses: ModuleCodeLessonType;
  totalModuleCodeLessonTypeMap: ModuleCodeLessonType;
  moduleOrder: string[];
}

export type ImportResponseData = {
  success: boolean;
  error?: string;
  data?: Data;
};

let ay = process.env.NEXT_PUBLIC_AY;
let sem = process.env.NEXT_PUBLIC_SEM;
const moduleCache = new Map<string, any>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ImportResponseData>,
) {
  try {
    if (req.method === "POST") {
      let { url } = req.body;

      // validate URL
      if (!url) {
        res.status(400).json({
          success: false,
          error: "URL is required!",
        });
        return;
      }

      if (url.includes("shorten.nusmods.com")) {
        // if URL is a short URL, make a fetch request to get the actual url
        const response = await fetch(url, {
          method: "GET",
          redirect: "manual", // Prevent auto-following redirects
        });

        if (response.status === 302 || response.status === 301) {
          url = response.headers.get("Location"); // Get redirected URL
        } else {
          console.error("No redirection occurred.");
          return res.status(400).json({
            success: false,
            error: "Invalid URL! Please check the URL and try again.",
          });
        }
      }

      if (
        !url.startsWith("https://nusmods.com/timetable/sem-1/share?") &&
        !url.startsWith("https://nusmods.com/timetable/sem-2/share?")
      ) {
        res.status(400).json({
          success: false,
          error: "Invalid URL! Please check the URL and try again.",
        });
        return;
      }

      // get the semester from the link
      const semester = url.includes("sem-1") ? "1" : "2";

      // extract module codes
      const stripped = url
        .replace(/^https:\/\/nusmods\.com\/timetable\/.*\/share\?/gm, "")
        .trim(); // CFG1002=&CS1101S=TUT:07B,REC:11E,LEC:1&CS1231S=TUT:08B,LEC:1&IS1108=TUT:03,LEC:1&MA2001=TUT:1,LAB:2,LEC:1&RVX1000=SEC:1&RVX1002=SEC:2
      // get the url params
      const params = new URLSearchParams(stripped);

      const classesSelected: {
        moduleCode: string;
        timetable: {
          [lessonType: string]: string; //lessonType is TUT / REC / LAB, basically what you see in the URL
        };
      }[] = [];

      // check if there's any hidden modules (by hidden key)
      let hiddenModules: string[] = [];
      if (params.has("hidden")) {
        hiddenModules = params.get("hidden")!.split(",");
        params.delete("hidden");
      }

      // check if there's any TA modules (by ta key)
      let taModules: string[] = [];
      if (params.has("ta")) {
        taModules = params.get("ta")!.split(",");
        params.delete("ta");

        console.log("INFO:: HAS TA");
        console.log(taModules);
      }

      for (const p of params) {
        // p: [moduleCode, selectedLessons]
        const moduleCode = p[0];
        const selectedLessons = p[1];

        // some URLs might have modules with no classes selected, example:
        // https://nusmods.com/timetable/sem-2/share?CP4101=
        // this means the user did not select any classes for CP4101 OR the course has no classes.
        // we need to skip because we never fetched the module data for it. Thus, it was not added to cache
        // however, below, we expected all classesSelected to have module data in the cache.
        // Previously, this if statement was not here.
        if (!selectedLessons || selectedLessons.length === 0) {
          continue;
        }

        // skip over this if the module is hidden
        if (hiddenModules.includes(moduleCode)) {
          continue;
        }

        // skip over this if it's a TA module
        if (taModules.some((taModule) => taModule.includes(moduleCode))) {
          continue;
        }

        const lessons = selectedLessons.split(",");

        const timetable: { [key: string]: string } = {};

        for (const lesson of lessons) {
          if (lesson.includes(":")) {
            const [lessonType, classNo] = lesson.split(":") as [
              LessonTypeAbbrev,
              string,
            ];
            const decodedLessonType = decodeLessonTypeShorthand(lessonType);
            timetable[decodedLessonType] = classNo;
          }
        }

        classesSelected.push({
          moduleCode,
          timetable,
        });
      }

      if (classesSelected.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No classes selected! Please select at least one class.",
        });
      }

      const moduleCodes = classesSelected.map(
        (classselected) => classselected.moduleCode,
      );
      // check if the system has up to date (1 day old or less) data for the semester and module codes for this AY

      for (const { moduleCode } of classesSelected) {
        await updateModuleInDatabase(moduleCode);
      }

      const availableClassList: ModuleWithClassDB[] = await executeQuery({
        query: `SELECT * FROM modulelist LEFT JOIN classlist ON modulelist.moduleCode = classlist.moduleCode WHERE classlist.moduleCode IN (?) AND ay = ? AND semester = ?`,
        values: [moduleCodes, process.env.NEXT_PUBLIC_AY, semester],
      });

      // Manipulate the availableClassList to the format we want
      const totalModuleCodeLessonTypeMap: ModuleCodeLessonType = {};
      availableClassList.forEach((availableClass) => {
        const moduleCodeLessonType = `${availableClass.moduleCode}: ${availableClass.lessonType}`;
        if (!totalModuleCodeLessonTypeMap[moduleCodeLessonType]) {
          totalModuleCodeLessonTypeMap[moduleCodeLessonType] = [
            {
              classNo: availableClass.classNo,
              lessonType: availableClass.lessonType,
              moduleCode: availableClass.moduleCode,
              moduleName: availableClass.moduleName,
              size: availableClass.size,
              classes: [],
              isTA: false,
            },
          ];
        }

        // don't need to filter by lessonType and moduleCode because we are already in that group
        const classes = totalModuleCodeLessonTypeMap[moduleCodeLessonType].find(
          (classItem) => classItem.classNo === availableClass.classNo,
        );
        if (classes) classes.classes.push(availableClass);
        else
          totalModuleCodeLessonTypeMap[moduleCodeLessonType].push({
            classNo: availableClass.classNo,
            lessonType: availableClass.lessonType,
            moduleCode: availableClass.moduleCode,
            moduleName: availableClass.moduleName,
            size: availableClass.size,
            classes: [availableClass],
            isTA: false,
          });
      });

      // Manipulate the classes selected to the correct data format
      const moduleCodeLessonTypeMap: ModuleCodeLessonType = {};

      classesSelected.forEach(({ moduleCode, timetable }) => {
        Object.keys(timetable).forEach((lessonType) => {
          const classNo = timetable[lessonType];
          const classData = availableClassList.filter(
            (classData) =>
              classData.classNo === classNo &&
              classData.lessonType
                .toLowerCase()
                // todo - upodate this part to exact match
                .includes(lessonType.toLowerCase()) &&
              classData.moduleCode === moduleCode,
          ); // use filter bc there might be 2 of the same classNo / lessonType / moduleCode, aka when you have 2 tuts per wk

          if (classData.length) {
            const moduleCodeLessonType = `${moduleCode}: ${classData[0].lessonType}`;

            if (!moduleCodeLessonTypeMap[moduleCodeLessonType]) {
              moduleCodeLessonTypeMap[moduleCodeLessonType] = [
                {
                  moduleCode: moduleCode,
                  lessonType: classData[0].lessonType,
                  classNo: classData[0].classNo,
                  classes: [],
                  moduleName: classData[0].moduleName,
                  size: classData[0].size,
                  isTA: false,
                },
              ];
            }

            const classes = moduleCodeLessonTypeMap[moduleCodeLessonType].find(
              (classItem) => classItem.classNo === classNo,
            );
            if (classes) classes.classes.push(...Array.from(classData));
            else
              moduleCodeLessonTypeMap[moduleCodeLessonType].push({
                moduleCode: moduleCode,
                lessonType: classData[0].lessonType,
                classNo: classData[0].classNo,
                classes: [],
                moduleName: classData[0].moduleName,
                size: classData[0].size,
                isTA: false,
              });
          }
        });
      });

      for (const taModule of taModules) {
        await updateModuleInDatabase(taModule);
      }

      const availableTaClassList = await executeQuery({
        query: `SELECT * FROM modulelist LEFT JOIN classlist ON modulelist.moduleCode = classlist.moduleCode WHERE classlist.moduleCode IN (?) AND ay = ? AND semester = ?`,
        values: [taModules, process.env.NEXT_PUBLIC_AY, semester],
      });

      for (const taModule of taModules) {
        // Split into different lesson types
        if (!params.has(taModule)) {
          return res.status(400).json({
            success: false,
            error:
              "Invalid URL! Please re-genearate URL from NUSMods and try again.",
          });
        }

        // params will definitely contain taModule if url is correct
        // Check with DB whether info in url is correct
        const moduleCodeLessonType = `${taModule}: TA`;
        const taModuleLessonTypes = params.get(taModule)!.split(";");

        for (const lessonType of taModuleLessonTypes) {
          const lessonTypeInfo = lessonType.split(":")[1].slice(1, -1);
          const indivLessonInfoArr = lessonTypeInfo.split(",");

          for (const lesson of indivLessonInfoArr) {
            if (!lesson) continue;
            console.log(
              `Running loop for TA ${taModule} ${lessonType.split(":")[0]}`,
            );
            const [classNo, dayAbbrev, startTime, endTime, venue, weeks] =
              lesson.split("|");

            // Check if lesson exists in db
            const lessonFromUrl = {
              classNo,
              dayAbbrev,
              startTime,
              endTime,
              venue,
              weeks: JSON.stringify(
                weeks.split("_").map((week) => Number(week)),
              ),
            };

            const matchingLesson = availableTaClassList.find(
              (lesson: any) =>
                lesson.classNo === lessonFromUrl.classNo &&
                convertDayToAbbrev(lesson.day).toLowerCase() ===
                  lessonFromUrl.dayAbbrev.toLowerCase() &&
                lesson.startTime === lessonFromUrl.startTime &&
                lesson.endTime === lessonFromUrl.endTime &&
                lesson.venue === lessonFromUrl.venue &&
                lesson.weeks === lessonFromUrl.weeks,
            );

            if (!matchingLesson) {
              return res.status(400).json({
                success: false,
                error:
                  "Invalid URL! Please re-genearate URL from NUSMods and try again.",
              });
            }

            console.log("matching lesson ", matchingLesson);

            if (!moduleCodeLessonTypeMap[moduleCodeLessonType]) {
              moduleCodeLessonTypeMap[moduleCodeLessonType] = [
                {
                  moduleCode: taModule,
                  lessonType: matchingLesson.lessonType,
                  classNo: matchingLesson.classNo,
                  classes: [],
                  moduleName: matchingLesson.moduleName,
                  size: matchingLesson.size,
                  isTA: true,
                },
              ];
            }

            const classes = moduleCodeLessonTypeMap[moduleCodeLessonType].find(
              (classItem) =>
                classItem.classNo === matchingLesson.classNo &&
                classItem.lessonType === matchingLesson.lessonType,
              // and same lesson type
            );
            if (classes) classes.classes.push(matchingLesson);
            else
              moduleCodeLessonTypeMap[moduleCodeLessonType].push({
                moduleCode: taModule,
                lessonType: matchingLesson.lessonType,
                classNo: matchingLesson.classNo,
                classes: [matchingLesson],
                moduleName: matchingLesson.moduleName,
                size: matchingLesson.size,
                isTA: true,
              });
          }
        }
      }

      res.status(200).json({
        success: true,
        data: {
          selectedClasses: moduleCodeLessonTypeMap,
          totalModuleCodeLessonTypeMap: totalModuleCodeLessonTypeMap,
          moduleOrder: Object.keys(moduleCodeLessonTypeMap),
        },
      });
    } else {
      res.status(405).json({
        success: false,
        error: "Method not allowed",
      });
    }
  } catch (e) {
    console.log(e);

    res.status(500).json({
      success: false,
      error:
        "Internal server error, please refresh NUSMods, re-generate URL, and try again. If the error persists, post an issue on Github.",
    });
  }
}

async function updateModuleInDatabase(moduleCode: string) {
  console.log(`Running loop for ${moduleCode}`);
  await executeQuery({
    query: `DELETE FROM modulelist WHERE moduleCode = ?`,
    values: [moduleCode],
  });

  const data: Module = await getModuleData(moduleCode);

  // insert the module data into the database
  await saveModuleAndClasses(moduleCode, data);
}

async function saveModuleAndClasses(moduleCode: string, data: Module) {
  await executeQuery({
    query: `INSERT INTO modulelist SET ?`,
    values: [
      {
        moduleCode,
        moduleName: data.title,
      },
    ],
  });

  // insert the class data into the database
  await executeQuery({
    query: `DELETE FROM classlist WHERE ay = ? AND moduleCode = ?`,
    values: [process.env.NEXT_PUBLIC_AY, moduleCode],
  });

  let classDataSem1: any[] = []; // TODO

  if (data.semesterData?.[0]?.timetable) {
    classDataSem1 =
      data.semesterData[0].timetable.map((classItem) => {
        return [
          moduleCode,
          classItem.lessonType,
          classItem.classNo,
          classItem.day,
          classItem.startTime,
          classItem.endTime,
          classItem.venue || "No venue",
          classItem.size,
          JSON.stringify(formatWeeks(classItem.weeks)),
          process.env.NEXT_PUBLIC_AY,
          data.semesterData[0].semester,
        ];
      }) || [];
  }

  let classDataSem2: any[] = []; // TODO
  if (data.semesterData?.[1]?.timetable) {
    classDataSem2 =
      data.semesterData[1].timetable.map((classItem) => {
        return [
          moduleCode,
          classItem.lessonType,
          classItem.classNo,
          classItem.day,
          classItem.startTime,
          classItem.endTime,
          classItem.venue || "No venue",
          classItem.size,
          JSON.stringify(formatWeeks(classItem.weeks)),
          process.env.NEXT_PUBLIC_AY,
          data.semesterData[1].semester,
        ];
      }) || [];
  }
  const classData = [...classDataSem1, ...classDataSem2];

  if (classData.length) {
    const result = await executeQuery({
      query: `INSERT INTO classlist (moduleCode, lessonType, classNo, day, startTime, endTime, venue, size, weeks, ay, semester) VALUES ?`,
      values: [classData],
    });
  }
}

function getIndicesFromString(classIndicesStr: string): number[] {
  if (classIndicesStr.length <= 2) {
    return [];
  }

  classIndicesStr = classIndicesStr.slice(1, -1);

  return classIndicesStr
    .split(",")
    .map((classIndexString) => Number(classIndexString));
}

function getSemesterTimetable(
  data: Module,
  sem: string | undefined,
): RawLesson[] | undefined {
  const semNum = Number(sem);
  for (let semesterData of data.semesterData) {
    if (semesterData.semester == semNum) {
      return semesterData.timetable;
    }
  }
}

async function getModuleData(moduleCode: string) {
  if (moduleCache.has(moduleCode)) {
    const now = Date.now();
    if (moduleCache.get(moduleCode).expiry > now) {
      console.log(`${moduleCode} data obtained from cache`);
      return moduleCache.get(moduleCode).data;
    }
    moduleCache.delete(moduleCode);
  }

  const result = await fetch(
    `https://api.nusmods.com/v2/${ay}/modules/${moduleCode}.json`,
  );

  const data = await result.json();

  console.log(`${moduleCode} data fetched from NUSMods API`);
  console.log(data);
  moduleCache.set(moduleCode, {
    data: data,
    expiry: Date.now() + 15 * 60 * 1000,
  });
  console.log(
    `Added ${moduleCode} data to cache with expiry ${new Date(
      moduleCache.get(moduleCode).expiry,
    ).toString()}`,
  );

  return data;
}
