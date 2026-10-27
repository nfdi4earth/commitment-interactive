import { Box, Container, Flex } from "@chakra-ui/react";
import { useIntl } from "open-pioneer:react-hooks";

import { HELPDESK_MAIL, OS4A_URL } from "@os4a/links";

export const Footer = () => {
    const intl = useIntl();

    return (
        <>
            <Container maxWidth={{ base: "100%", custombreak: "80%" }} paddingBottom="4px">
                <div className="seperator"></div>
            </Container>
            <div className="footer">
                <Container maxWidth={{ base: "100%", custombreak: "80%" }} position="relative">
                    <Box
                        className="footer-navigation"
                        padding={{ base: "50px 0px", custombreak: "84px 0px" }}
                    >
                        <Box
                            className="section"
                            gap={{ base: "column", custombreak: "10px" }}
                            flexDirection={{ base: "column", custombreak: "row" }}
                        >
                            <Box className="section-header">
                                {intl.formatMessage({
                                    id: "footer.get-connected"
                                })}
                                :
                            </Box>
                            <Box display="flex" gap="8px">
                                <span className=".footer-link-section-entry">
                                    <a
                                        href="https://www.nfdi4earth.de/about-us"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <div className="footerLinkLabel">
                                            {intl.formatMessage({
                                                id: "footer.about"
                                            })}
                                        </div>
                                    </a>
                                </span>
                                <span>|</span>
                                <span className=".footer-link-section-entry">
                                    <a
                                        href="https://www.nfdi4earth.de/about-us/consortium"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <div className="footerLinkLabel">
                                            {intl.formatMessage({
                                                id: "footer.partners"
                                            })}
                                        </div>
                                    </a>
                                </span>
                                <span>|</span>
                                <span className=".footer-link-section-entry">
                                    <a
                                        href="https://www.nfdi4earth.de/2coordinate/coordination-office"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <div className="footerLinkLabel">
                                            {intl.formatMessage({
                                                id: "footer.contact"
                                            })}
                                        </div>
                                    </a>
                                </span>
                            </Box>
                        </Box>
                        <Box
                            className="section"
                            gap={{ base: "column", custombreak: "10px" }}
                            flexDirection={{ base: "column", custombreak: "row" }}
                        >
                            <Box className="section-header">Support:</Box>
                            <Box display="flex" gap="8px">
                                <a href={`${OS4A_URL}/faq`} target="_blank" rel="noreferrer">
                                    <div className="footerLinkLabel">FAQ</div>
                                </a>
                                <span>|</span>
                                <a href={HELPDESK_MAIL}>
                                    <div className="footerLinkLabel">
                                        {intl.formatMessage({ id: "header.user-support" })}
                                    </div>
                                </a>
                            </Box>
                        </Box>
                        <Box
                            className="section"
                            gap={{ base: "column", custombreak: "10px" }}
                            flexDirection={{ base: "column", custombreak: "row" }}
                        >
                            <Box className="section-header">
                                {intl.formatMessage({
                                    id: "footer.legal-information"
                                })}
                                :
                            </Box>
                            <Box display="flex" gap="8px">
                                <span className=".footer-link-section-entry">
                                    <a
                                        href="https://www.nfdi4earth.de/legal-notice"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <div className="footerLinkLabel">
                                            {intl.formatMessage({
                                                id: "footer.legal-information"
                                            })}
                                        </div>
                                    </a>
                                </span>
                                <span>|</span>
                                <span className=".footer-link-section-entry">
                                    <a
                                        href="https://www.nfdi4earth.de/privacy-policy"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <div className="footerLinkLabel">
                                            {intl.formatMessage({
                                                id: "footer.privacy"
                                            })}
                                        </div>
                                    </a>
                                </span>
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        className="social-media"
                        display="flex"
                        flexDirection={{ base: "column", custombreak: "row" }}
                        gap={{ base: "20px", custombreak: "52px" }}
                    >
                        <Box className="entry">
                            <a
                                href="https://git.rwth-aachen.de/nfdi4earth"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Flex gap="10px" alignItems="center">
                                    <img src="/gitlab-logo.svg" alt="gitlab logo" />
                                    <div className="footerLinkLabel">GITLAB</div>
                                </Flex>
                            </a>
                        </Box>
                        <Box className="entry">
                            <a
                                href="https://nfdi.social/@nfdi4earth"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Flex gap="10px" alignItems="center">
                                    <img src="/mastodon.svg" alt="mastodon logo" />
                                    <div className="footerLinkLabel">MASTODON</div>
                                </Flex>
                            </a>
                        </Box>
                        <Box className="entry">
                            <a
                                href="https://creativecommons.org/licenses/by/4.0/"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Flex gap="10px" alignItems="center">
                                    <img src="/ccby.png" width={80} alt="ccby logo" />
                                    <div className="footerLinkLabel">CC BY 4.0</div>
                                </Flex>
                            </a>
                        </Box>
                        <Box flex="1 1 50px"></Box>
                        <Box>
                            <img src="/dfg-logo.svg" alt="dfg logo" />
                        </Box>
                    </Box>
                </Container>
            </div>
        </>
    );
};
