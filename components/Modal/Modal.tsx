import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, ModalProps, useDisclosure } from "@chakra-ui/react"
import React, { memo } from "react"

const BasicModal:React.FC<{
    props: ModalProps
    title: string,
    children: React.ReactNode
}> = ({props, title, children}) => {
 
    return (
      <>
        
  
        <Modal {...props}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                {children}
            </ModalBody>
  
            <ModalFooter>
              <Button colorScheme='blue' mr={3} onClick={props.onClose}>
                Close
              </Button>
              {/* <Button variant='ghost'>Secondary Action</Button> */}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }


export default memo(BasicModal)