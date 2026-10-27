import {
    Box,
    Drawer,
    HStack,
    IconButton,
    Link,
    Spacer,
    useDisclosure,
    Portal,
    useChakraContext,
    Separator
} from "@chakra-ui/react";
import { useIntl, useService } from "open-pioneer:react-hooks";
import { ReactNode, useEffect } from "react";

import { UserSupportLink } from "@components/Header/UserSupportLink";
import { MenuCloseIcon } from "@components/Icons";
import { OS4A_URL } from "@os4a/links";
import { MenuHandler } from "@services/MenuOpener";
import { on } from "@conterra/reactivity-events";

export function BaseMenu() {
    const intl = useIntl();
    const { open, onOpen, onClose } = useDisclosure();

    const menuHandler = useService<MenuHandler>("onestop4all.MenuHandler");

    useEffect(() => {
        const openMenuListener = on(menuHandler.emitter, () => onOpen());
        return () => openMenuListener.destroy();
    });

    const ctx = useChakraContext();
    const customBreakValue = ctx.token("breakpoints.custombreak");

    function createBlock(header: string, children: ReactNode): ReactNode {
        return (
            <Box
                className="block"
                padding={{ base: "10px 20px 10px 20px;", custombreak: "20px 20px;" }}
            >
                <Box
                    className="block-header"
                    fontSize={{ base: "24px", custombreak: "26px" }}
                    paddingBottom={{ base: "10px", custombreak: "10px" }}
                >
                    {header}
                </Box>
                <div className="block-content">{children}</div>
            </Box>
        );
    }

    return (
        <Drawer.Root
            open={open}
            preventScroll={false}
            onOpenChange={(e) => {
                if (!e.open) {
                    onClose();
                }
            }}
            size={{ base: "customMenu", custombreak: "xs" }}
        >
            <Portal>
                <Drawer.Backdrop background={"var(--chakra-colors-blackAlpha-200)"} />
                <Drawer.Positioner>
                    <Drawer.Content className="navigation-menu">
                        <HStack padding={{ base: "10px 52px 0px", custombreak: "22px 52px 10px" }}>
                            <Spacer></Spacer>
                            <IconButton
                                aria-label={intl.formatMessage({ id: "basemenu.close" })}
                                variant="ghost"
                                colorPalette="teal"
                                onClick={onClose}
                            >
                                <MenuCloseIcon width={8} height={8} />
                            </IconButton>
                        </HStack>
                        <Box overflow="auto">
                            <Box
                                display={{
                                    base: "block",
                                    [`@media screen and (min-width: ${customBreakValue})` as any]:
                                        "none"
                                }}
                            >
                                <Box
                                    className="initial-block"
                                    padding={{ base: "0 70px 10px", custombreak: "0 70px 40px" }}
                                    //marginTop={{ base: "0px", custombreak: "0px" }}
                                    lineHeight="36px"
                                >
                                    {/*<UserSupportLink></UserSupportLink>
                                    <Login></Login>*/}
                                    {/*<LanguageToggler />*/}
                                </Box>
                            </Box>
                            <Separator borderColor={"primary_border"} />
                            {createBlock(
                                "OneStop4All",
                                <>
                                    <Link href={OS4A_URL} target="_blank" rel="noreferrer">
                                        {intl.formatMessage({ id: "basemenu.os4a-start" })}
                                    </Link>
                                    <Link
                                        href={`${OS4A_URL}/label`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {intl.formatMessage({ id: "basemenu.os4a-label" })}
                                    </Link>
                                </>
                            )}
                            <Separator borderColor={"primary_border"} />
                            {createBlock(
                                intl.formatMessage({
                                    id: "basemenu.get-connected"
                                }),
                                <>
                                    <Link
                                        href="https://www.nfdi4earth.de/about-us"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {intl.formatMessage({
                                            id: "basemenu.about-us"
                                        })}
                                    </Link>
                                    <Link
                                        href="https://www.nfdi4earth.de/about-us/consortium"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {intl.formatMessage({
                                            id: "basemenu.partners"
                                        })}
                                    </Link>
                                    <Link
                                        href="https://www.nfdi4earth.de/2coordinate/coordination-office"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {intl.formatMessage({
                                            id: "basemenu.contact"
                                        })}
                                    </Link>
                                </>
                            )}
                            <Separator borderColor={"primary_border"} />
                            {createBlock(
                                "Support",
                                <>
                                    <UserSupportLink hideIcon={true} header={false} />
                                    <Link href={`${OS4A_URL}/faq`} target="_blank" rel="noreferrer">
                                        FAQ
                                    </Link>
                                </>
                            )}
                            <Separator borderColor={"primary_border"} />
                            {createBlock(
                                intl.formatMessage({
                                    id: "basemenu.legal-information"
                                }),
                                <>
                                    <Link
                                        href="https://www.nfdi4earth.de/legal-notice"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {intl.formatMessage({
                                            id: "basemenu.legal-information"
                                        })}
                                    </Link>
                                    <Link
                                        href="https://www.nfdi4earth.de/privacy-policy"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {intl.formatMessage({
                                            id: "basemenu.privacy"
                                        })}
                                    </Link>
                                </>
                            )}
                            <Separator borderColor={"primary_border"} />
                        </Box>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    );
}
