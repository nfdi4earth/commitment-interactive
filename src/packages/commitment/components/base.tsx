import { createContext, useContext, type ReactNode } from "react";
import { Navigate, Outlet, useLocation, useParams, useResolvedPath } from "react-router-dom";

// The package works under any mount path (`/commitment` here, a route of OneStop4All later).
// The root route stores its path, so that every page can build links to the others.
// The host mounts the routes under a splat route (`commitment/*`); in React Router 7, "." inside a
// splat route resolves against the whole URL, so the base is the URL without the splat part.
const BasePath = createContext("");

export function CommitmentRoot() {
    const splat = useParams()["*"];
    const { pathname } = useLocation();
    const resolved = useResolvedPath(".").pathname;
    const base = (
        splat === undefined ? resolved : pathname.slice(0, pathname.length - splat.length)
    ).replace(/\/$/, "");
    return (
        <BasePath.Provider value={base}>
            <div className="commitment-view">
                <Outlet />
            </div>
        </BasePath.Provider>
    );
}

/** Turns a path inside the app ("", "/for/student", "?focus=c8") into a router path. */
export function useAppPath(): (path: string) => string {
    const base = useContext(BasePath);
    return (path) => (path.startsWith("?") || path === "" ? (base || "/") + path : base + path);
}

/** Overlays (tooltips, popovers, drawers) render in a portal outside the page; this re-applies the styles. */
export function Scoped({ children }: { children: ReactNode }) {
    return <div className="commitment-view">{children}</div>;
}

/** Unknown paths inside the app lead back to the reader. */
export function ToReader() {
    const appPath = useAppPath();
    return <Navigate to={appPath("")} replace />;
}
