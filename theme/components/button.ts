import { defineStyleConfig } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

// Mantine-like: soft tinted background, colored text.
// Works with: <Button variant="subtle" colorScheme="teal" />
export const Button = defineStyleConfig({
  variants: {
    subtle: (props) => {
      const c = props.colorScheme ?? "gray";

      return {
        bg: mode(`${c}.50`, `${c}.900`)(props),
        color: mode(`${c}.700`, `${c}.100`)(props),
        _hover: {
          bg: mode(`${c}.100`, `${c}.800`)(props),
        },
        _active: {
          bg: mode(`${c}.200`, `${c}.700`)(props),
        },
      };
    },
  },
  sizes: {
    xxs: {
      h: "1rem", // 20px
      minW: "1rem",
      fontSize: "0.625rem", // 10px
      px: "0.375rem", // 6px
      borderRadius: "sm",
    },
  },
});
