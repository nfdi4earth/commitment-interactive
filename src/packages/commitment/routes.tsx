import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { CommitmentRoot, ErrorView, ToReader } from "./components/base";

const ReaderView = lazy(() => import("./views/Reader/ReaderView"));
const IndexView = lazy(() => import("./views/IndexView"));
const PerspectiveView = lazy(() => import("./views/PerspectiveView"));
const TopicView = lazy(() => import("./views/TopicView"));
const DeepDiveView = lazy(() => import("./views/DeepDiveView"));
// lazy, so that @xyflow/react only loads with the map
const MapView = lazy(() => import("./views/MapView"));

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
        children: [
            { index: true, element: <ReaderView /> },
            { path: "for", element: <IndexView kind="role" /> },
            { path: "for/:id", element: <PerspectiveView /> },
            { path: "topics", element: <IndexView kind="topic" /> },
            { path: "topics/:id", element: <TopicView /> },
            { path: "concepts", element: <IndexView kind="concept" /> },
            { path: "deep-dive/:id", element: <DeepDiveView /> },
            { path: "map", element: <MapView /> },
            { path: "*", element: <ToReader /> }
        ]
    }
];
