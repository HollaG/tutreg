import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Center,
    Heading,
    Image,
    Stack,
    Text,
} from "@chakra-ui/react";
import { NextPage } from "next";

const Extension: NextPage = () => {
    return (
        <Stack>
            <Center>
                <Image
                    alt={"Logo of extension"}
                    fit={"cover"}
                    align={"center"}
                    w={"256px"}
                    h={"256px"}
                    src={"icons/icon.png"}
                />
            </Center>
            <Heading fontSize="3xl" textAlign={"center"} fontWeight="semibold">
                {" "}
                Tutreg Companion Extension{" "}
            </Heading>
            <Center>
                <Button
                    leftIcon={
                        <ExternalLinkIcon h={4} w={4} color={"gray.300"} />
                    }
                >
                    {" "}
                    Download from the Chrome Extension store
                </Button>
            </Center>
        </Stack>
    );
};

// Step 1: Select and rank your modules on tutreg.com/order.
// Step 2: Copy the URL given by the website.
// Step 3: Open the "Select Tutorials / Labs popup on Edurec"
// Step 4: Open the extension, paste in the URL and click on 'Auto-select'. The extension will automatically select the modules for you.
// Step 5: Close the "Select Tutorials / Labs popup" and open the 'Rank Tutorials/Labs' popup.
// Step 6: Open the extension, paste in the URL again and click on 'Auto-rank'. The extension will automatically rank the modules for you.

export default Extension;
