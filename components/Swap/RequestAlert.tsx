import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  Input,
  InputGroup,
  InputLeftAddon,
  FormHelperText,
  FormControl,
  Text,
} from "@chakra-ui/react";
import swap from "../../pages/swap";
import { FullInfo } from "../../pages/swap/create";
import { ClassSwapRequest } from "../../types/types";
import { useState } from "react";

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
  onConfirm: (comments: string) => void;
}) => {
  const [comments, setComments] = useState<string>("");
  return (
    <FormControl>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        blockScrollOnMount
        size={'xl'}
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
              <Text color={'red'}><b>Make sure you have clicked the right slot!</b></Text> You cannot un-request after requesting.
              <br />
              <br />
              By clicking Request, your Telegram username will be sent
              to {swap?.first_name} so that they can contact you.
              <br />
              <br />
              <InputGroup>
                <InputLeftAddon>Comments (opt.)</InputLeftAddon>
                <Input
                  maxLength={1024}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </InputGroup>
              <FormHelperText>Optional comments to include with your request.</FormHelperText>

            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={() => onConfirm(comments)} ml={3}>
                Request
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </FormControl>

  );
};

export default RequestAlert;
