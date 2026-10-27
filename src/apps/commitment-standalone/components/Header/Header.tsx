import { Box, Separator, HStack, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import { Logo } from "@components/Header/Logo";
import { MenuButton } from "@components/Header/MenuButton";
import { UserSupportLink } from "@components/Header/UserSupportLink";

export const Header = () => {
    const navigate = useNavigate();

    const backToStart = () => {
        if (location.pathname !== "/") {
            sessionStorage.setItem("shouldResetStartPageScroll", "true");
        }
        navigate("/");
        window.scroll(0, 0);
    };

    return (
        <>
            <HStack
                justifyContent="space-between"
                alignItems="center"
                margin="6px 0px"
                padding={{ base: "6px 1px 0px", custombreak: "36px 1px 10px" }}
            >
                <Box css={{ _hover: { cursor: "pointer" } }} onClick={backToStart}>
                    <Logo />
                </Box>
                <Flex gap={{ base: "10px", custombreak: "30px" }}>
                    <UserSupportLink />
                    <MenuButton />
                </Flex>
            </HStack>
            <Separator className="separator" borderColor={"#E2E8F0"} />
        </>
    );
};
