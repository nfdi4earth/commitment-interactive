import { Box, Container, Flex } from "@chakra-ui/react";

import { useMeasure } from "react-use";
import { Outlet } from "react-router-dom";

import { BaseMenu } from "@components/BaseMenu/BaseMenu";
import { Footer } from "@components/Footer/Footer";
import { Header } from "@components/Header/Header";
import { SearchBar } from "@components/SearchBar";

function Layout() {
    const [headerRef, { height }] = useMeasure<HTMLElement>();
    return (
        <>
            <BaseMenu></BaseMenu>

            <Flex direction="column" minHeight="100vh">
                <Flex
                    as="header"
                    position="fixed"
                    width="100%"
                    background="white"
                    zIndex="1001"
                    ref={(el) => {
                        if (el) headerRef(el);
                    }}
                >
                    <Container maxWidth={{ base: "100%", custombreak: "80%" }}>
                        <Header></Header>
                    </Container>
                </Flex>

                <Box
                    as="main"
                    width="100%"
                    paddingTop={height + 15}
                    flex="1"
                    // sticky bars of the commitment package stay below the fixed header
                    style={{ "--commitment-sticky-top": `${height}px` } as React.CSSProperties}
                >
                    {/* small header image and search bar, as on the OneStop4All /label page */}
                    <Box className="search-view" w={"100%"}>
                        <Box position="relative">
                            <Box className="header-image" />
                        </Box>
                        <Box
                            position="absolute"
                            width="100%"
                            marginTop={{ base: "-40px", custombreak: "-50px" }}
                        >
                            <Container maxW={{ base: "100%", custombreak: "80%" }}>
                                <SearchBar />
                            </Container>
                        </Box>
                        <Box height={{ base: "100px", custombreak: "80px" }}></Box>
                        <Outlet />
                    </Box>
                </Box>

                <Box as="footer" width="100%">
                    <Footer></Footer>
                </Box>
            </Flex>
        </>
    );
}

export default Layout;
