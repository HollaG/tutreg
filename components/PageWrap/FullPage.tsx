import { Box, Container } from "@chakra-ui/react"

export const FullPage: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <Box
    px="6rem"
    pt={6}
    pb="48px"
    height={"calc(100% - 64px)"}
    flexGrow={1}
    overflow="none"
  >
    {children}
  </Box>
}