import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import React, { memo } from "react";

const BasicModal: React.FC<{
  props: ModalProps;
  title: string;
  closeButton?: string;
  children: React.ReactNode;
}> = ({ props, title, children, closeButton = "Close" }) => {
  const bgColor = useColorModeValue("gray.50", "gray.700");
  return (
    <>
      {/* https://github.com/chakra-ui/chakra-ui/issues/844#issuecomment-643733445 */}
      <Modal {...props}
        blockScrollOnMount={false}
        autoFocus={false}
        returnFocusOnClose={false}
      >
        <ModalOverlay />
        <ModalContent bgColor={bgColor}>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{children}</ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={props.onClose}
            >
              {closeButton}
            </Button>
            {/* <Button variant='ghost'>Secondary Action</Button> */}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default memo(BasicModal);
