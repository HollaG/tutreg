import {
    Box,
    ChakraProps,
    ChakraStyledOptions,
    useColorModeValue,
} from "@chakra-ui/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

interface Props extends ChakraProps {
    children: React.ReactNode | React.ReactNode[];

    dragProps: {
        isSelected?: boolean;
        isDragged?: boolean;
        isOutOfBounds?: boolean;
    };
}

const Entry: React.FC<Props> = React.forwardRef((props, ref: any) => {
    // const bgColor = useColorModeValue("gray.100", "gray.600")
    const dragColor = useColorModeValue("gray.100", "gray.700");
    const deleteColor = useColorModeValue("red.300", "red.500");
    return (
        <Box
            // {...props}
            ref={ref}
            // borderWidth={2}
            p={3}
            // borderColor={useColorModeValue("gray.200", "gray.700")}
            bgColor={
                props.dragProps.isSelected || props.dragProps.isDragged
                    ? props.dragProps.isOutOfBounds
                        ? deleteColor
                        : dragColor
                    : undefined
            }
            borderRadius={"md"}
            w="100%"
            position="relative"
            width="100%"
            height="100%"
            boxShadow=" 0 4px 13px -3px rgba(0,0,0,0.0)"
            _before={{
                content: `''`,
                position: "absolute",
                "z-index": "-1",
                width: "100%",
                height: "100%",
                top: "0",
                left: "0",
                opacity: "1",
                // "border-radius": "5px",
                borderRadius: "md",
                boxShadow: " 0 5px 15px rgba(0,0,0,0.03)",
                transition: "opacity 0.15s ease-in-out",

                // always animate from 0 to 1 opacity when first loading in
                animation: "0.15s ease-in fadein",
            }}
            className={`entry`}
        >
            {props.children}
        </Box>
    );
});
Entry.displayName = "Entry";
export default Entry;
