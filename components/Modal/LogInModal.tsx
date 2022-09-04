import {
    useDisclosure,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Heading,
    Center,
    Stack,
    Box,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { miscActions } from "../../store/misc";
import { RootState } from "../../types/types";
import LoginButton from "../User/LoginButton";

const LogInModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const dispatch = useDispatch();
    const misc = useSelector((state: RootState) => state.misc);
    useEffect(() => {
        if (misc.needsLogIn) onOpen();
        else onClose()
    }, [misc.needsLogIn, onClose, onOpen]);

    // reset state to false in preparation for next time
    const closeHandler = () => {
        onClose();
        dispatch(miscActions.setNeedsLogIn(false));
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Access denied!</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Center>
                        <Stack spacing={3}>
                            <Heading size="sm" textAlign="center">
                                {" "}
                                You need to sign in before accessing this
                                content!{" "}
                            </Heading>
                            <Box>
                                <LoginButton />
                            </Box>
                        </Stack>
                    </Center>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={closeHandler}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default LogInModal;
