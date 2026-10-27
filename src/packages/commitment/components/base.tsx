import { createContext, useCallback, useContext, useEffect, type ReactNode } from "react";
import { Navigate, Outlet, useLocation, useResolvedPath } from "react-router-dom";

// The package works under any mount path (`/commitment` here, a route of OneStop4All later).
// The root route stores its path, so that every page can build links to the others.
// The host mounts the routes under a plain path (`commitment`, not `commitment/*`): in React Router 7,
// "." inside a splat route would resolve against the whole URL.
const BasePath = createContext("");

export function CommitmentRoot() {
    const base = useResolvedPath(".").pathname.replace(/\/$/, "");
    // a new page (not a change of the lens) starts at the top; `?focus=` links scroll themselves
    const { pathname } = useLocation();
    useEffect(() => {
        if (!new URLSearchParams(window.location.search).has("focus")) window.scrollTo({ top: 0 });
    }, [pathname]);
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
    return useCallback(
        (path) => (path.startsWith("?") || path === "" ? (base || "/") + path : base + path),
        [base]
    );
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

/** External link; it opens in a new tab. */
export function ExternalLink({
    href,
    className,
    children
}: {
    href: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <a href={href} className={className} target="_blank" rel="noreferrer">
            {children}
        </a>
    );
}

/** Scroll behaviour that respects `prefers-reduced-motion`. */
export function scrollBehavior(): ScrollBehavior {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

/**
 * Calls `onEnter` for each element that enters the band of the viewport given by `rootMargin`,
 * e.g. to mark the section in the middle of the screen as the current one. `elements` and
 * `onEnter` must be stable (`useCallback`); the observer restarts when they change.
 */
export function useEnterBand(
    elements: () => Iterable<Element | null | undefined>,
    rootMargin: string,
    onEnter: (el: HTMLElement) => void
) {
    useEffect(() => {
        const io = new IntersectionObserver(
            (entries) =>
                entries.forEach((e) => e.isIntersecting && onEnter(e.target as HTMLElement)),
            { rootMargin }
        );
        for (const el of elements()) if (el) io.observe(el);
        return () => io.disconnect();
    }, [elements, rootMargin, onEnter]);
}
