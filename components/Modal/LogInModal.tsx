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
    Image,
    Alert,
    AlertIcon,
    Container,
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
        else onClose();
    }, [misc.needsLogIn, onClose, onOpen]);

    // reset state to false in preparation for next time
    const closeHandler = () => {
        onClose();
        dispatch(miscActions.setNeedsLogIn(false));
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Access denied!</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack spacing={5}>
                        <Center>
                            <Image
                                src="/icons/manifest-icon-192.maskable.png"
                                maxW="128px"
                                maxH="128px"
                            />
                        </Center>
                        <Heading fontSize="2xl" textAlign="center">
                            {" "}
                            TutReg{" "}
                        </Heading>
                        <Container>
                            <Alert status="error">
                                <AlertIcon />
                                This action requires you to be logged in!
                            </Alert>
                        </Container>

                        <Center>
                            <LoginButton />
                        </Center>
                    </Stack>
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
