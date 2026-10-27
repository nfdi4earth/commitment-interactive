import { Box, HStack, Link, Image, useChakraContext } from "@chakra-ui/react";
import { useService } from "open-pioneer:react-hooks";
import { useIntl } from "open-pioneer:react-hooks";
import { MenuHandler } from "@services/MenuOpener";

export interface MenuButtonProps {
    hideIcon?: boolean;
    header?: boolean;
}

export function MenuButton({ hideIcon = false, header = true }: MenuButtonProps) {
    const intl = useIntl();
    const menuHandler = useService<MenuHandler>("onestop4all.MenuHandler");
    const ctx = useChakraContext();
    const customBreakValue = ctx.token("breakpoints.custombreak");

    return (
        <>
            <HStack onClick={() => menuHandler.open()} css={{ _hover: { cursor: "pointer" } }}>
                {!hideIcon && (
                    <Image
                        color="primary_color"
                        className="bg-icon-05668D"
                        alt="Bg icon 05668D"
                        src={`${import.meta.env.BASE_URL}bg-icon-05668D.png`}
                        width={7}
                    />
                )}
                <Box
                    display={{
                        base: "none",
                        [`@media screen and (min-width: ${customBreakValue})` as any]: "block"
                    }}
                >
                    {header ? (
                        <Link whiteSpace="nowrap">
                            {intl.formatMessage({ id: "header.about-nfdi4earth" })}
                        </Link>
                    ) : (
                        <Link whiteSpace="nowrap" style={{ textDecoration: "underline" }}>
                            {intl.formatMessage({ id: "header.about-nfdi4earth" })}
                        </Link>
                    )}
                </Box>
                <Box
                    display={{
                        base: "block",
                        [`@media screen and (min-width: ${customBreakValue})` as any]: "none"
                    }}
                >
                    {header ? (
                        <Link whiteSpace="nowrap">
                            {intl.formatMessage({ id: "header.about-nfdi4earth-mobile" })}
                        </Link>
                    ) : (
                        <Link whiteSpace="nowrap" style={{ textDecoration: "underline" }}>
                            {intl.formatMessage({ id: "header.about-nfdi4earth" })}
                        </Link>
                    )}
                </Box>
            </HStack>
        </>
    );
}
