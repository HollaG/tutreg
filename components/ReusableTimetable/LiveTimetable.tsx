// This component renders the LiveTimetable in the Order Page for better information for the user.

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import Timetable from "./Timetable"
import { ClassOverview, Option, RootState } from "../../types/types"
import { classesActions, ClassState } from "../../store/classesReducer"
import { TimetableLessonEntry } from "../../types/timetable"
import { getModuleColor } from "../../lib/functions"
import { Alert, AlertIcon, Button, Flex, ModalProps, Stack, Tag, Text, Tooltip, useDisclosure } from "@chakra-ui/react"
import ModuleSelect from "../Select/ModuleSelect"
import BasicModal from "../Modal/Modal";
import TimetableContainer from "../Timetable/TimetableContainer"
import { GetClassesResponse } from "../../pages/api/swap/getClasses"
import { LessonType } from "../../types/modules"
import { sendPOST } from "../../lib/fetcher"
import { convertToTimetableList, FullInfo, HalfInfo } from "../../pages/swap/create"
import { AddIcon, EditIcon, InfoIcon, QuestionIcon } from "@chakra-ui/icons"
import { miscActions } from "../../store/misc"
export const LiveTimetable: React.FC = () => {
  const _classesInfo = useSelector((state: RootState) => state.classesInfo)
  const _modifyingInfo = useSelector((state: RootState) => state.misc.timetableModifyingMode)
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const [classForDeletion, setClassForDeletion] = useState<TimetableLessonEntry | null>(null);

  const [classesInfo, setClassesInfo] = useState<ClassState | null>(null)
  const [modifyingInfo, setModifyingInfo] = useState<(HalfInfo & { classNo?: string }) | null>(null)

  useEffect(() => {
    setClassesInfo(_classesInfo)
  }, [_classesInfo])

  useEffect(() => {
    setModifyingInfo(_modifyingInfo)
  }, [_modifyingInfo])

  const isModifying = modifyingInfo !== null
  const selectedClass = modifyingInfo


  // states for selecting a new class to add as reference (MODAL POPUP)
  const [referenceClassToAdd, setReferenceClassToAdd] = useState<FullInfo>({
    moduleCode: "",
    lessonType: "Lecture",
    classNo: "",
  });
  const [possibleClassesOfModule, setPossibleClassesOfModule] = useState<
    ClassOverview[]
  >([]);


  // states for selecting / deselecting from the possible classes for this (MAIN VIEW)
  // When in dual mode, it is possible to enter modifying mode by clicking "Add class" on the left panel.
  // const [isModifying, setIsModifying] = useState<boolean>(false);

  // const [selectedClass, setSelectedClass] = useState<HalfInfo & {
  //   classNo?: string; // CAN BE OPTIONAL - this occurs when entering modifying mode from "Add class" button
  // } | null>(null);




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

  const getFillMode = (cls: TimetableLessonEntry): "solid" | "outline" | "subtle" => {
    // if is first choice, solid, if not, empty
    if (isModifying) {
      return "solid"
    }

    const isFirstChoice = firstChoices.find(c => c.classNo === cls.classNo && c.moduleCode === cls.moduleCode)
    if (isFirstChoice) {
      return "solid"
    }
    return "subtle"
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

  const getProperty = (cls: TimetableLessonEntry): "selected" | "static" | undefined => {
    const moduleCodeLessonType = `${cls.moduleCode}: ${cls.lessonType}`
    if (isModifying) {
      const selectedClasses = classesInfo.selectedClasses
      if (selectedClasses) {
        const classListForModule = selectedClasses[moduleCodeLessonType]
        const thisClassNo = cls.classNo
        if (classListForModule) {
          const isSelected = !!classListForModule.find(c => c.classNo === thisClassNo)
          if (isSelected) {
            return "selected"
          }
        }
        return;
      }
    } else {

      const classListForModule = classesInfo.selectedClasses[moduleCodeLessonType]
      if (classListForModule) {
        return "selected"
      }
      return "static"
    }

  }


  // ----------- FOR ADDING REFERENCE CLASSES ------------
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

      setReferenceClassToAdd({
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
    if (referenceClassToAdd.classNo !== "") {
      // if we have selected a class, then we need to find the ClassOverview of this class, 
      // so we know what to display
      const classToAdd = possibleClassesOfModule.filter((c) => c.classNo === referenceClassToAdd.classNo);
      if (classToAdd) {
        // dispatch to add this class as non-biddable 
        const mclt = `${referenceClassToAdd.moduleCode}: ${referenceClassToAdd.lessonType}`;
        dispatch(classesActions.addNonBiddableClass({
          [mclt]: classToAdd
        }));

      }
    }

    // close the handler
    onAddClose();

    // reset the internal states
    setReferenceClassToAdd({
      moduleCode: "",
      lessonType: "Lecture",
      classNo: "",
    });
    setPossibleClassesOfModule([]);
  }

  const selectReferenceClassToAddHandler = (
    class_: TimetableLessonEntry,
    selected: boolean
  ) => {
    if (selected) {
      setReferenceClassToAdd((prevState) => ({
        ...prevState,
        classNo: class_.classNo,
      }));
    } else {
      setReferenceClassToAdd((prevState) => ({
        ...prevState,
        classNo: "",
      }));
    }
  };

  const getPropertyForAdding: (class_: TimetableLessonEntry) => "readonly" | "selected" | "static" | undefined = (class_: TimetableLessonEntry) => {
    if (referenceClassToAdd.classNo === class_.classNo) return "selected";
    else return undefined;
  };

  const deleteHandler = () => {
    if (classForDeletion) {
      dispatch(classesActions.removeNonBiddableClass({
        classNo: classForDeletion.classNo,
        lessonType: classForDeletion.lessonType,
        moduleCode: classForDeletion.moduleCode
      }));
      setClassForDeletion(null);
      onDeleteClose();
    }
  }

  // ----------- END FOR ADDING REFERENCE CLASSES ------------

  // ----------- MAIN TIMETABLE SELECTION HANDLER ------------
  const onSelect = (class_: TimetableLessonEntry) => {
    console.log("Selected class: ", class_);

    // if the class is from non-biddable, remove it
    const isInNonBiddable = nonBiddable.find(c => c.classNo === class_.classNo && c.moduleCode === class_.moduleCode && c.lessonType === class_.lessonType)
    if (isInNonBiddable) {
      // dispatch(classesActions.removeNonBiddableClass({
      //   classNo: class_.classNo, lessonType: class_.lessonType, moduleCode: class_.moduleCode
      // }));
      setClassForDeletion(class_);
      onDeleteOpen();
      return;
    }

    // setSelectedClass(class_)

    // if the class is from biddable, then:


    // a) if is already modifying, then
    //   if the MCLT is DIFFERENT, set modifying to false, return
    //   if is in selected, remove it
    //   else, add it
    //     AND
    //   set modifying to false
    // b) if is not modifying, then
    //   set modifying to true
    //   temporarily set all colours to grey 

    if (isModifying) {
      // if in selected, remove
      const moduleCodeLessonType = `${class_.moduleCode}: ${class_.lessonType}`

      // if not the same MCLT, just exit modifying mode
      if (selectedClass && moduleCodeLessonType !== `${selectedClass.moduleCode}: ${selectedClass.lessonType}`) {
        // setIsModifying(false);
        // setSelectedClass(null);
        dispatch(miscActions.setTimetableModifyingMode(null))
        return;
      }

      const selectedClasses = classesInfo.selectedClasses

      const classListForModule = selectedClasses[moduleCodeLessonType]
      const thisClassNo = class_.classNo
      if (classListForModule) {
        const isSelected = !!classListForModule.find(c => c.classNo === thisClassNo)
        if (isSelected) {
          dispatch(classesActions.removeSelectedClass({
            classNo: class_.classNo,
            moduleCodeLessonType: `${class_.moduleCode}: ${class_.lessonType}`,
          }))
          // setIsModifying(false); // TODO: decide if we want to disable modifying mode after each action

          return;
        } else {
          dispatch(classesActions.addSelectedClass({
            classNo: class_.classNo,
            moduleCodeLessonType: `${class_.moduleCode}: ${class_.lessonType}`,
          }))
          // setIsModifying(false); // TODO: decide if we want to disable modifying mode after each action
        }
      } else {
        // we have never selected anything from this module before,
        // we have to add it
        dispatch(classesActions.addSelectedClass({
          classNo: class_.classNo,
          moduleCodeLessonType: `${class_.moduleCode}: ${class_.lessonType}`,
        }))
        // setIsModifying(false); // TODO: decide if we want to disable modifying mode after each action

      }






    } else {
      // setIsModifying(true); // by setting the selected class in the store, the timetable will automatically be set to modify mode

      dispatch(miscActions.setTimetableModifyingMode(class_))

    }

  }

  let defaultClasses = [selectedBiddableClasses, nonBiddable].flat()

  let staticClasses: ClassOverview[] = []
  if (isModifying && selectedClass) {
    staticClasses = defaultClasses.filter(c => !(c.moduleCode === selectedClass?.moduleCode && c.lessonType === selectedClass?.lessonType))
  }


  let classesToDraw = defaultClasses
  if (isModifying && selectedClass) {
    const mclt = `${selectedClass.moduleCode}: ${selectedClass.lessonType}`
    classesToDraw = classesInfo.totalModuleCodeLessonTypeMap[mclt] || [] // will be the list of classes from the totalModuleCodeLessonTypeMap 
    // how to figure out which classes have been selected? we can check the classesInfo.selectedClasses. Then, the getProperty function can be modified to return "selected" only for the selected classes.
  }





  return <Stack>

    <Timetable

      // When modifying a class, we want to change ALL CLASSES to be static, EXCEPT the MCLT being modified
      classesToDraw={classesToDraw}
      staticClasses={staticClasses}
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
      <Tooltip label='Click on a biddable class to add / remove class options, then click "Finish editing" when you are done.     Click on a reference class to remove it.'>

        <Button size="sm" leftIcon={<QuestionIcon />}> Usage tips </Button>
      </Tooltip>
      <Flex flex={1}></Flex>
      {isModifying ?
        <Button size="sm" colorScheme="green" onClick={() => {
          // setIsModifying(false)
          // setSelectedClass(null)
          dispatch(miscActions.setTimetableModifyingMode(null))
        }}> Finish editing </Button>

        : <></>}
      <Tooltip label="Add a class (e.g. a Lecture) for your reference. This will not affect your tutorial ranking, and you can remove the class simply by clicking on it. Reference classes have a diagonal stripe pattern background.">
        {<Button leftIcon={<AddIcon />} size="sm" variant="subtle" colorScheme="blue" onClick={() => onAddOpen()}> Add reference class </Button>}

      </Tooltip>


    </Timetable>


    <BasicModal
      props={
        {
          size: "6xl",
          isOpen: isAddOpen,

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
        onSelected={selectReferenceClassToAddHandler}
        property={getPropertyForAdding}
        selectedColor="blue"


      />

    </BasicModal>
    <BasicModal props={{
      isOpen: isDeleteOpen,
      onClose: onDeleteClose,
      size: "xl"
    } as ModalProps}
      title={`Remove reference class ${classForDeletion?.moduleCode} ${classForDeletion?.lessonType} ${classForDeletion?.classNo} from timetable?`}
      closeButton="Cancel"

    >
      <Alert status="info" mb={3}>
        <AlertIcon />
        You reached this screen because you clicked on a reference class (angled striped background) in your timetable.
      </Alert>
      <Text>Are you sure you want to remove this reference class {selectedClass?.moduleCode} {selectedClass?.lessonType} {selectedClass?.classNo} from your timetable?</Text>
      <Button width={"100%"} mt={4} colorScheme="red" onClick={deleteHandler}> Yes, remove class </Button>
    </BasicModal>
  </Stack>
}