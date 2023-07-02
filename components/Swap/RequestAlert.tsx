import {
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    Button,
} from "@chakra-ui/react";
import swap from "../../pages/swap";
import { FullInfo } from "../../pages/swap/create";
import { ClassSwapRequest } from "../../types/types";

const RequestAlert = ({
    userRequest,
    swap,
    onClose,
    isOpen,
    cancelRef,
    onConfirm,
}: {
    userRequest: FullInfo | null;
    swap: ClassSwapRequest | null;
    onClose: () => void;
    isOpen: boolean;
    cancelRef: React.RefObject<HTMLButtonElement>;
    onConfirm: () => void;
}) => {
    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
            blockScrollOnMount
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Request swap
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Are you sure you want to request to swap your <br />
                        <br />
                        <span style={{ fontWeight: "bold" }}>
                            {userRequest?.moduleCode} {userRequest?.lessonType}{" "}
                            {userRequest?.classNo}
                        </span>{" "}
                        <br />
                        for {swap?.first_name}&apos;s
                        <br />
                        <span style={{ fontWeight: "bold" }}>
                            {swap?.moduleCode} {swap?.lessonType}{" "}
                            {swap?.classNo}
                        </span>
                        ?
                        <br />
                        <br />
                        Make sure you have clicked the right slot! You will not
                        be able to request this swap again.
                        <br />
                        By clicking Request, your Telegram username will be sent
                        to {swap?.first_name} so that they can contact you.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={onConfirm} ml={3}>
                            Request
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
};

export default RequestAlert;
