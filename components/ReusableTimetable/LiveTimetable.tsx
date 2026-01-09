// This component renders the LiveTimetable in the Order Page for better information for the user.

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import Timetable from "./Timetable"
import { ClassOverview, RootState } from "../../types/types"
import { ClassState } from "../../store/classesReducer"
import { TimetableLessonEntry } from "../../types/timetable"
import { getModuleColor } from "../../lib/functions"
import { Tag, Text } from "@chakra-ui/react"

export const LiveTimetable: React.FC = () => {
  const _classesInfo = useSelector((state: RootState) => state.classesInfo)

  const [classesInfo, setClassesInfo] = useState<ClassState | null>(null)

  useEffect(() => {
    setClassesInfo(_classesInfo)
  }, [_classesInfo])

  if (!classesInfo) {
    return null
  }

  const nonBiddable: ClassOverview[] = []

  Object.values(classesInfo.nonBiddable).forEach((classList) => {
    nonBiddable.push(...classList)
  })

  const selectedBiddableClasses: ClassOverview[] = []
  const firstChoices: ClassOverview[] = [];
  // first choices are those who are array index 0 

  Object.values(classesInfo.selectedClasses).forEach((classList) => {
    selectedBiddableClasses.push(...classList)
    firstChoices.push(classList[0])
  })


  const classList = [...nonBiddable, ...selectedBiddableClasses]

  const colorMap = classesInfo.colorMap

  const getColor = (cls: TimetableLessonEntry): string => {
    const moduleCodeLessonType = `${cls.moduleCode}: ${cls.lessonType}`
    console.log({ moduleCodeLessonType })

    return getModuleColor(colorMap, moduleCodeLessonType)
  }

  const getDisplayMode = (cls: TimetableLessonEntry): "detailed" | "compact" | "hidden" => {
    // if in first choices, detailed
    const isFirstChoice = firstChoices.find(c => c.classNo === cls.classNo && c.moduleCode === cls.moduleCode)
    if (isFirstChoice) {
      return "detailed"
    }

    return "detailed"
  }

  const getFillMode = (cls: TimetableLessonEntry): "solid" | "outline" => {
    // if is first choice, solid, if not, empty

    const isFirstChoice = firstChoices.find(c => c.classNo === cls.classNo && c.moduleCode === cls.moduleCode)
    if (isFirstChoice) {
      return "solid"
    }
    return "outline"
  }

  const getTag = (cls: TimetableLessonEntry): React.ReactNode | string | undefined => {
    // find what choice this is
    const moduleCodeLessonType = `${cls.moduleCode}: ${cls.lessonType}`

    const classListForModule = classesInfo.selectedClasses[moduleCodeLessonType]
    if (!classListForModule) {
      return undefined
    }
    const index = classListForModule.findIndex(c => c.classNo === cls.classNo)
    if (index === -1) {
      return undefined
    }
    return <Tag size='sm' colorScheme={getColor(cls)} style={{
      position: "absolute",
      bottom: "4px",
      right: "3px",
    }}>{`#${index + 1}`}</Tag>
  }

  const getProperty = (cls: TimetableLessonEntry): "selected" | "static" => {
    const moduleCodeLessonType = `${cls.moduleCode}: ${cls.lessonType}`
    const classListForModule = classesInfo.selectedClasses[moduleCodeLessonType]
    if (classListForModule) {
      return "selected"
    }
    return "static"
  }

  // const handleClick = (cls: TimetableLessonEntry) => {
  //   const moduleCodeLessonType = `${cls.moduleCode}: ${cls.lessonType}`

  //   // 1. shift all existing classesToDraw to staticClasses (multiple imppls here)

  //   // // when opening the modal, set the changed classes to the currently selected classes, or none if there's none
  //   // if (data.selectedClasses[moduleCodeLessonType]) {
  //   //   dispatch(
  //   //     classesActions.setChangedClasses(
  //   //       data.selectedClasses[moduleCodeLessonType].map(
  //   //         (class_) => class_.classNo
  //   //       ) || []
  //   //     )
  //   //   );
  //   // }
  //   // onOpen();
  // };

  return <Timetable
    classesToDraw={[selectedBiddableClasses, nonBiddable].flat()}
    showModuleCode={true}
    showLessonType={true}
    onSelected={() => { }} //no action
    property={getProperty}
    minWidth="1600px"
    // staticClasses={nonBiddable}

    getOverrideColor={getColor}
    getDisplayMode={getDisplayMode}
    getFillMode={getFillMode}
    getTag={getTag}
    canDownload



  />
}