import { Box, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { BackIcon } from "@components/Icons";

export function BackTo(props: { pathname: string; primary: string; secondary?: string }) {
    const { pathname, primary, secondary } = props;
    const navigate = useNavigate();

    function backToSearch() {
        if (pathname) {
            navigate({ pathname: pathname });
        } else {
            navigate(-1);
        }
    }

    return (
        <Flex
            fontSize="14px"
            textTransform="uppercase"
            letterSpacing="0.6px"
            onClick={backToSearch}
            gap="12px"
            css={{ _hover: { cursor: "pointer" } }}
        >
            <Box onClick={backToSearch} css={{ _hover: { cursor: "pointer" } }}>
                <BackIcon />
            </Box>
            <Box>
                <Box display="inline" fontWeight="700" color="primary_color">
                    {primary}&nbsp;
                </Box>
                <Box whiteSpace="nowrap" display="inline">
                    {secondary}
                </Box>
            </Box>
        </Flex>
    );
}
