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
import TimetableContainer from "./TimetableContainer";

// TODO: Use react.memo correctly, because the state changes in this component, it will re-render the whole timetable.

const TimetableModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    selectedModuleCodeLessonType: string;
}> = (props) => {
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
                    size: "6xl",
                    isOpen: props.isOpen,
                    onClose: closeHandler,
                } as ModalProps
            }
            title={props.selectedModuleCodeLessonType}
            closeButton="Save & close"
        >
            <TimetableContainer mclt={mclt} closeHandler={closeHandler} />
        </BasicModal>
    );
};

export default React.memo(TimetableModal);
