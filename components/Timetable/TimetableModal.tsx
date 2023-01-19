import {
    ModalProps,
    useFocusEffect,
    useFormErrorStyles,
} from "@chakra-ui/react";
import React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { classesActions } from "../../store/classesReducer";
import { RootState } from "../../types/types";
import BasicModal from "../Modal/Modal";
import Timetable, { TimetableLessonEntry } from "./Timetable";

// TODO: Use react.memo correctly, because the state changes in this component, it will re-render the whole timetable.

const TimetableModal: React.FC<{

    isOpen: boolean;
    onClose: () => void;
    selectedModuleCodeLessonType: string;
}> = (props) => {
    console.log("timetable modal");
    const cleanedProps: any = { ...props };
    const mclt = cleanedProps.selectedModuleCodeLessonType;
    delete cleanedProps.selectedModuleCodeLessonType;

    // Try not to update the redux store too many times.
    const dispatch = useDispatch();
    const handleUpdateStore = () => {
        dispatch(
            classesActions.updateMainList(props.selectedModuleCodeLessonType)
        );
    };

    const closeHandler = () => {
        handleUpdateStore();
        props.onClose();
    };

    return (
        <BasicModal
            props={
                {
                    size: "full",
                    isOpen: props.isOpen,
                    onClose: closeHandler,
                    
                } as ModalProps
            }
            title={props.selectedModuleCodeLessonType}
            closeButton="Save & close"
        >
            <Timetable mclt={mclt} />
        </BasicModal>
    );
};

export default React.memo(TimetableModal);
