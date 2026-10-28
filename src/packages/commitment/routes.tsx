import type { ComponentType } from "react";
import type { RouteObject } from "react-router-dom";
import { CommitmentRoot, ErrorView, Loading, ToReader } from "./components/base";
import type { FacetKind } from "./model/types";

// Each page's code loads with the router's `lazy`, not React's: the router starts loading it as
// soon as the URL is known, while the host draws its own layout (see `HydrateFallback` below).
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
    Component: (await load()).default
});
const index = (kind: FacetKind) => async () => {
    const { default: IndexView } = await import("./views/IndexView");
    return { element: <IndexView kind={kind} /> };
};

/**
 * Settings for the host page, passed as the route's `handle`; the host reads them with
 * `useMatches()` (docs/integration.md, step 6).
 */
export interface CommitmentHostSettings {
    /**
     * Show the host's chatbot button. OS4A's sits at the bottom right; the reader's "Contents"
     * button sits at the bottom left so that the two don't overlap on small screens.
     */
    chatbot: boolean;
}

// ci/build-site.sh writes a page for each of these routes for static hosting: keep it in step.
/** Relative routes; the host mounts them under any path, e.g. `commitment` (not `commitment/*`). */
export const commitmentRoutes: RouteObject[] = [
    {
        element: <CommitmentRoot />,
        handle: { chatbot: true } satisfies CommitmentHostSettings,
        errorElement: <ErrorView />,
        // shown in place of the page while its code loads on the first visit; the routes above
        // (the host's layout) are drawn meanwhile
        HydrateFallback: Loading,
        children: [
            { index: true, lazy: page(() => import("./views/Reader/ReaderView")) },
            { path: "for", lazy: index("role") },
            { path: "for/:id", lazy: page(() => import("./views/PerspectiveView")) },
            { path: "topics", lazy: index("topic") },
            { path: "topics/:id", lazy: page(() => import("./views/TopicView")) },
            { path: "concepts", lazy: index("concept") },
            { path: "deep-dive/:id", lazy: page(() => import("./views/DeepDiveView")) },
            { path: "map", lazy: page(() => import("./views/MapView")) },
            { path: "*", element: <ToReader /> }
        ]
    }
];
