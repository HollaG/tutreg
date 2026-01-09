// This component renders the LiveTimetable in the Order Page for better information for the user.

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import Timetable from "./Timetable"
import { ClassOverview, Option, RootState } from "../../types/types"
import { classesActions, ClassState } from "../../store/classesReducer"
import { TimetableLessonEntry } from "../../types/timetable"
import { getModuleColor } from "../../lib/functions"
import { Alert, AlertIcon, Button, ModalProps, Stack, Tag, Text, Tooltip, useDisclosure } from "@chakra-ui/react"
import ModuleSelect from "../Select/ModuleSelect"
import BasicModal from "../Modal/Modal";
import TimetableContainer from "../Timetable/TimetableContainer"
import { GetClassesResponse } from "../../pages/api/swap/getClasses"
import { LessonType } from "../../types/modules"
import { sendPOST } from "../../lib/fetcher"
import { convertToTimetableList, FullInfo } from "../../pages/swap/create"
export const LiveTimetable: React.FC = () => {
  const _classesInfo = useSelector((state: RootState) => state.classesInfo)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [classesInfo, setClassesInfo] = useState<ClassState | null>(null)

  useEffect(() => {
    setClassesInfo(_classesInfo)
  }, [_classesInfo])


  // states for selecting a new class to add as reference
  const [currentClassInfo, setCurrentClassInfo] = useState<FullInfo>({
    moduleCode: "",
    lessonType: "Lecture",
    classNo: "",
  });
  const [possibleClassesOfModule, setPossibleClassesOfModule] = useState<
    ClassOverview[]
  >([]);

  const dispatch = useDispatch()

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


  const onSelectModule = async (options: Option[]) => {
    const moduleCodeLessonType = options[0].value;

    const moduleCode = moduleCodeLessonType.split(": ")[0];
    const lessonType = moduleCodeLessonType.split(": ")[1] as LessonType;

    // todo change to fetch
    const response: GetClassesResponse = await sendPOST(
      "/api/swap/getClasses",
      {
        moduleCode,
        lessonType,
      }
    );

    if (response.success && response.data) {
      // on success, reset the list of possible classes

      setCurrentClassInfo({
        moduleCode,
        lessonType,
        classNo: "",
      });

      const lst: ClassOverview[] = convertToTimetableList(response.data);
      setPossibleClassesOfModule(lst);
    }



    // setMclt(moduleCodeLessonType);
    // const moduleCode = moduleCodeLessonType.split(": ")[0];
    // const lessonType = moduleCodeLessonType.split(": ")[1] as LessonType;
  }


  const closeHandler = () => {
    if (currentClassInfo.classNo !== "") {
      // if we have selected a class, then we need to find the ClassOverview of this class, 
      // so we know what to display
      const classToAdd = possibleClassesOfModule.filter((c) => c.classNo === currentClassInfo.classNo);
      if (classToAdd) {
        // dispatch to add this class as non-biddable 
        const mclt = `${currentClassInfo.moduleCode}: ${currentClassInfo.lessonType}`;
        dispatch(classesActions.addNonBiddableClass({
          [mclt]: classToAdd
        }));

      }
    }

    // close the handler
    onClose();

    // reset the internal states
    setCurrentClassInfo({
      moduleCode: "",
      lessonType: "Lecture",
      classNo: "",
    });
    setPossibleClassesOfModule([]);
  }


  const selectCurrentClassHandler = (
    class_: TimetableLessonEntry,
    selected: boolean
  ) => {
    if (selected) {
      setCurrentClassInfo((prevState) => ({
        ...prevState,
        classNo: class_.classNo,
      }));
    } else {
      setCurrentClassInfo((prevState) => ({
        ...prevState,
        classNo: "",
      }));
    }
  };

  const getPropertyForAdding: (class_: TimetableLessonEntry) => "readonly" | "selected" | "static" | undefined = (class_: TimetableLessonEntry) => {
    if (currentClassInfo.classNo === class_.classNo) return "selected";
    else return undefined;
  };


  const onSelect = (class_: TimetableLessonEntry) => {
    console.log("Selected class: ", class_);

    // if the class is from non-biddable, remove it
    const isInNonBiddable = nonBiddable.find(c => c.classNo === class_.classNo && c.moduleCode === class_.moduleCode && c.lessonType === class_.lessonType)
    if (isInNonBiddable) {
      const mclt = `${class_.moduleCode}: ${class_.lessonType}`;
      dispatch(classesActions.removeNonBiddableClass({
        classNo: class_.classNo, lessonType: class_.lessonType, moduleCode: class_.moduleCode
      }));
      return;
    }
    // else, do nothing


  }


  return <Stack>

    <Timetable
      classesToDraw={[selectedBiddableClasses, nonBiddable].flat()}
      showModuleCode={true}
      showLessonType={true}
      onSelected={onSelect} //no action
      property={getProperty}
      minWidth="1600px"
      // staticClasses={nonBiddable}

      getOverrideColor={getColor}
      getDisplayMode={getDisplayMode}
      getFillMode={getFillMode}
      getTag={getTag}
      canDownload



    >
      <Tooltip label="Add a class (e.g. a Lecture) for your reference. This will not affect your tutorial ranking, and you can remove the class simply by clicking on it. Reference classes have a diagonal stripe pattern background.">
        <Button size="sm" onClick={() => onOpen()}> Add reference classes </Button>

      </Tooltip>
    </Timetable>


    <BasicModal
      props={
        {
          size: "6xl",
          isOpen: isOpen,

          onClose: closeHandler,
        } as ModalProps
      }
      title={"Add a class (for reference only - will not appear in Ranking)"}
      closeButton="Save & close"
    >
      <Alert status="info" mb={3}>
        <AlertIcon />
        Add a class (e.g. a Lecture) for your reference. This will not affect your tutorial ranking, and you can remove the class simply by clicking on it. Reference classes have a diagonal stripe pattern background.
      </Alert>
      <ModuleSelect
        isMulti={false}
        onSelect={onSelectModule}
        hideNonBiddable={false}
      />
      <Timetable
        classesToDraw={possibleClassesOfModule}
        onSelected={selectCurrentClassHandler}
        property={getPropertyForAdding}
        selectedColor="blue"


      />

    </BasicModal>
  </Stack>
}