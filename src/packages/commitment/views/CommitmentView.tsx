import { Container, Stack, Text, VStack } from "@chakra-ui/react";
import { useIntl } from "open-pioneer:react-hooks";

// Placeholder until the reader view exists; layout follows the OneStop4All /label page.
export default function CommitmentView() {
    const intl = useIntl();
    return (
        <Container className="commitment-view" maxW={{ base: "100%", custombreak: "80%" }}>
            <Stack p="10px">
                <Text as="h1" fontSize="2xl" color="#05668D" fontWeight="bold">
                    {intl.formatMessage({ id: "title" })}
                </Text>
            </Stack>
            <VStack m="10px" padding={10} gap={10} alignItems="flex-start" bg="#F7FAFC">
                <Text>{intl.formatMessage({ id: "placeholder" })}</Text>
            </VStack>
        </Container>
    );
}
