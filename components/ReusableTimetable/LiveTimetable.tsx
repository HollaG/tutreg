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

  return <Timetable
    classesToDraw={selectedBiddableClasses}
    showModuleCode={true}
    showLessonType={true}
    onSelected={() => { }} //no action
    property={(entry) => "selected"}
    minWidth="1500px"
    staticClasses={nonBiddable}

    getOverrideColor={getColor}
    getDisplayMode={getDisplayMode}
    getFillMode={getFillMode}
    getTag={getTag}

  />
}