import { Container } from "@chakra-ui/react"

export const ContainedPage: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <Container
    maxW="container.lg"
    pt={6}
    pb="48px"
    height={"calc(100% - 64px)"}
    flexGrow={1}
    overflow="none"
  >
    {children}
  </Container>
}