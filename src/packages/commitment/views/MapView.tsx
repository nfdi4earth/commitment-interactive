import { useBreakpointValue } from "@chakra-ui/react";
import { useIntl } from "open-pioneer:react-hooks";
import { lazy, Suspense, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAppPath } from "../components/base";
import { Page } from "../components/Page";

// lazy, so that @xyflow/react only loads where the map is shown
const MapCanvas = lazy(() => import("./MapCanvas"));

/**
 * The overview map. It is made for large screens: below OneStop4All's breakpoint (`custombreak`)
 * the page leads to the index pages instead.
 */
export default function MapView() {
    const intl = useIntl();
    const appPath = useAppPath();
    // ssr: false, so that a wide screen does not show the notice first
    const wide = useBreakpointValue({ base: false, custombreak: true }, { ssr: false });
    const link = (path: string) =>
        function MapLink(chunks: ReactNode[]) {
            return (
                <Link key={path} to={appPath(path)}>
                    {chunks}
                </Link>
            );
        };

    return (
        <Page
            back={{ to: "", label: intl.formatMessage({ id: "back-to.commitment" }) }}
            title={intl.formatMessage({ id: "map.title" })}
            badge={intl.formatMessage({ id: "mock-short" })}
        >
            {wide ? (
                <>
                    <p className="map-help">{intl.formatMessage({ id: "map.help" })}</p>
                    <Suspense fallback={<div className="map-wrap" />}>
                        <MapCanvas />
                    </Suspense>
                </>
            ) : (
                <p className="map-small">
                    {intl.formatRichMessage(
                        { id: "map.small" },
                        { for: link("/for"), topics: link("/topics"), concepts: link("/concepts") }
                    )}
                </p>
            )}
        </Page>
    );
}
