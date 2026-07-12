// deprecated
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  Code,
  Highlight,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";

const Explanation: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Stack spacing={3}>
      <Alert status="warning">
        <AlertIcon />
        Important: ModReg only allows you to select up to 20 tutorial
        slots! Be mindful of this when selecting your slots.
      </Alert>
      {/* <Text>
                This page helps you to rank your tutorials during ModReg (SELECT
                TUTORIALS/LABS) Rounds 1 and 2.
            </Text>

            <Text alignItems="center">
                The ranking algorithm is based on that in the message by Sam
                Chan, which is routinely forwarded during ModReg rounds.
            </Text> */}
      <Center>
        <Button size="xs" onClick={onOpen}>
          {" "}
          View ranking algorithm
        </Button>
      </Center>
      {/* <Box>
                <Text>
                    {" "}
                    First, select or import some courses, then rank the courses
                    and classes based on your preferences.
                </Text>
                <Text>
                    {" "}
                    Click on Computed Ranking to see the final priority ranking.
                </Text>
                <Text>
                    {" "}
                    You can also manually rank your classes and courses if you wish.
                </Text>
            </Box> */}

      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Message by Sam Chan</ModalHeader>
          <ModalCloseButton />
          <ModalBody whiteSpace={"break-spaces"}>
            {`Balloting process 

How to ballot like a senior 
(by sam chan. feel free to share, and please remember to credit 😃)

First, here is how the balloting works:
- you rank up to 20 tutorial slots according to your preference, with the slots you want more ranked higher 
- you do not have to use all 20, and in fact you can just put one tutorial slot per mod
- the system looks at your first choice, checks the tutorial class, and if there are vacancies, you're in! 
- the process then repeats for your second, third choice etc. until you have tutorials for all your mods, or you have no viable options left (i.e. all your preferred tutorials are full)
- it's quite by luck in the sense that if you're the 26th person the system sees for a 25-person class, you don't get it, even if you put it as first choice. hence the term balloting. IT IS NOT FIRST COME FIRST SERVE!

Now that you know how balloting roughly works, here are some pointers!

1. Plan for multiple timetables 
- needless to say we all have that one tutorial slot we want (for free day, with friends, both, etc.), however it would be terribly unwise to not have any backup plans/tutorial slots. having three choices per mod is a safe number, although you can go up to 4 per mod (equal distribution among 5 mods) or any number really (unequal distribution)

2. Know your preferences
- even among your first choice tutorial slots for your modules, it's good to know which are the ones you want the most 
- generally you get your first three choices, while anything after that is more risky, so you need to priorities which are the ones you diedie must get, and hence rank first 

3. Know that certain tutorial slots are more popular 
- generally tutorial slots from 10-4 are the more popular ones
- likewise for those on the same day as the lecture for that mod 
- you might want to rank these slots higher
- this is more for your knowledge, but if you plan to take this tutorial with say >5 friends, some of you might not get it

Keeping these pointers in mind, you ballot! And here's now:
(note: you don't have to follow this method but I find it really helpful. also, it's based on the assumption that one has 5 mods to ballot for)

1) Note down the tutorial slots you want on a piece of paper (virtual or otherwise) according to your modules, while ranking them at the same time. 
- you should have 5 columns of 4 tutorial slots each (assuming equal distribution), already in order of preference

2) Double check the timings and the tutorial number (eg. D3, E5, etc.)

3) Rank all your tutorial slots in a flop-table style (MOST IMPORTANT STEP). This might require some explanation, so bear with me. 

Let's say your 5 mods are called 1, 2, 3, 4, and 5, and it's according to the mod which first-choice tutorial slot you want the most
Each mod has 4 tutorial slots, called A, B, C, and D according to your preference. 

Here's how your ranking would look like then:

1A
2A
3A
4A
5A
5B
4B
3B
2B
1B
1C
2C
3C
4C
5C
5D
4D
3D
2D
1D

Basically you "reflect" your mods. Since you're quite likely to get your choices for 1, 2, and 3, but less so for 4, and 5, your sixth and seventh choices should be the second-choice for mods 4 and 5 to increase your chances of getting what you want. 

4) Finally, don't panic if you don't have any tutorial slots! There is always add/drop and online swaps, and worst case manual registration. It's all part of student life! But if you follow the above, it's less likely to happen (:

1) NUS MODS -
www.nusmods.com
An awesome timetable builder/planner where you can drag and drop all the possible
tutorial and lecture slots to create your ideal timetable.`}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
};

export default React.memo(Explanation);
