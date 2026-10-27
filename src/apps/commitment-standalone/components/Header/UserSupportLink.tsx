import { Box, HStack, Icon, Link, useChakraContext } from "@chakra-ui/react";
import { useIntl } from "open-pioneer:react-hooks";

import { UserSupportIcon } from "@components/Icons";
import { HELPDESK_MAIL } from "@os4a/links";

export interface UserSupportLinkProps {
    hideIcon?: boolean;
    header?: boolean;
}

// OneStop4All opens its support form here; the standalone host links to the helpdesk e-mail instead.
export function UserSupportLink({ hideIcon = false, header = true }: UserSupportLinkProps) {
    const intl = useIntl();
    const ctx = useChakraContext();
    const customBreakValue = ctx.token("breakpoints.custombreak");

    return (
        <Link
            href={HELPDESK_MAIL}
            whiteSpace="nowrap"
            textDecoration={header ? undefined : "underline"}
            title={intl.formatMessage({ id: "header.user-support-title" })}
        >
            <HStack>
                {!hideIcon && (
                    <Icon css={{ size: "6" }} color={"primary_color"}>
                        <UserSupportIcon />
                    </Icon>
                )}
                {/*default*/}
                <Box
                    display={{
                        base: "none",
                        [`@media screen and (min-width: ${customBreakValue})` as any]: "block"
                    }}
                >
                    {intl.formatMessage({ id: "header.user-support" })}
                </Box>
                {/*small screen*/}
                <Box
                    display={{
                        base: "block",
                        [`@media screen and (min-width: ${customBreakValue})` as any]: "none"
                    }}
                >
                    {intl.formatMessage({
                        id: header ? "header.user-support-mobile" : "header.user-support"
                    })}
                </Box>
            </HStack>
        </Link>
    );
}
