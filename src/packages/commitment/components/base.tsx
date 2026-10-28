import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode
} from "react";
import { useIntl } from "open-pioneer:react-hooks";
import {
    Navigate,
    Outlet,
    useLocation,
    UNSAFE_DataRouterContext,
    useNavigate,
    useNavigationType,
    useResolvedPath
} from "react-router-dom";

// The package works under any mount path (`/commitment` here, a route of OneStop4All later).
// The root route stores its path, so that every page can build links to the others.
// The host mounts the routes under a plain path (`commitment`, not `commitment/*`): in React Router 7,
// "." inside a splat route would resolve against the whole URL.
const BasePath = createContext("");
// The location key of a URL opened from outside (a shared link, a reload): its target is jumped
// to, not scrolled to smoothly, because a long smooth scroll would only delay the start
const EntryKey = createContext<string | null>(null);

export function CommitmentRoot() {
    const base = useResolvedPath(".").pathname.replace(/\/$/, "");
    // a new page starts at the top; a layout effect, so that it runs before the pages' effects,
    // which may scroll on to a target (useReveal)
    const { pathname, key } = useLocation();
    const navigationType = useNavigationType();
    const [entryKey] = useState(() => (navigationType === "POP" ? key : null));
    useLayoutEffect(() => {
        window.scrollTo({ top: 0 });
    }, [pathname]);
    return (
        <BasePath.Provider value={base}>
            <EntryKey.Provider value={entryKey}>
                <div className="commitment-view">
                    <Outlet />
                </div>
            </EntryKey.Provider>
        </BasePath.Provider>
    );
}

// Page state lives in the URL, so that a shared link shows the same view. Only hovering is not kept.
//   reader: role, topic, concept (lens); focus (open annotation, or a passage to scroll to);
//           statement (statement panel); preamble=open
//   topic page: step; perspective page: done (ticked first steps)
// Changes made by the page itself replace the URL quietly; every other navigation (a link, a
// shared URL) reveals its target first, see useReveal.
const QUIET = { quiet: true };

/** `query` with the given parameters set, or removed where the value is null. */
export function withQuery(query: URLSearchParams, change: Record<string, string | null>) {
    const next = new URLSearchParams(query);
    for (const [k, v] of Object.entries(change))
        if (v === null) next.delete(k);
        else next.set(k, v);
    return next;
}

/**
 * The query and a stable setter for page state, which replaces the URL quietly (no scrolling).
 * `key` changes with every navigation; `quiet` tells whether the page made it itself.
 */
export function useQueryState() {
    const location = useLocation();
    const navigate = useNavigate();
    const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
    // the latest URL; only a change of the URL updates it (a render may still see an older one)
    const search = useRef(location.search);
    useLayoutEffect(() => {
        search.current = location.search;
    }, [location.search]);
    // A link to another page waits for that page's code (the routes' `lazy`); a change of the page
    // state meanwhile, e.g. a popover that closes on the same click, would cancel it. The router
    // knows at once that it is leaving; `useNavigation()` would only tell with the next render.
    const router = useContext(UNSAFE_DataRouterContext)?.router;
    const set = useCallback(
        (change: Record<string, string | null>) => {
            const to = router?.state.navigation.location;
            if (to && to.pathname !== router?.state.location.pathname) return;
            // commas stay readable (`?done=1,8`)
            const next = `?${withQuery(new URLSearchParams(search.current), change)}`.replace(
                /%2C/gi,
                ","
            );
            if (next === (search.current || "?")) return;
            search.current = next; // for a second change before the next render
            navigate({ search: next }, { replace: true, state: QUIET });
        },
        [navigate, router]
    );
    // the flag stays in the browser history: Back, Forward and reload (POP) always reveal again
    const quiet =
        useNavigationType() !== "POP" && (location.state as typeof QUIET | null)?.quiet === true;
    return { query, set, key: location.key, quiet };
}

/**
 * Reveals what a link or a shared URL points to. On a navigation the page did not make itself,
 * `reveal(target, done, behavior)` scrolls to the target (e.g. with scrollIntoViewThen) and calls
 * `done` when the scroll has ended. `behavior` is "auto" (a jump) on a URL opened from outside.
 * Returns whether the target may be shown open now. `reveal` must be stable (`useCallback`).
 */
export function useReveal(
    target: string | null,
    reveal: (target: string, done: () => void, behavior: ScrollBehavior) => (() => void) | void
): boolean {
    const { key, quiet } = useQueryState();
    const entryKey = useContext(EntryKey);
    const [revealed, setRevealed] = useState<string | null>(null);
    useEffect(() => {
        if (quiet || !target) return;
        const behavior = key === entryKey ? "auto" : scrollBehavior();
        return reveal(target, () => setRevealed(key), behavior);
    }, [key, quiet, target, reveal, entryKey]);
    return quiet || !target || revealed === key;
}

/**
 * Scrolls an element into view (by default to the top) and calls `done` when the page has stopped
 * scrolling. If the reader scrolls themselves meanwhile, `done` comes at once. Returns a cleanup
 * function.
 */
export function scrollIntoViewThen(
    el: HTMLElement,
    done: () => void,
    { block = "start", behavior }: { block?: "start" | "center"; behavior: ScrollBehavior }
): () => void {
    let idle: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    let start = 0;
    const finish = () => {
        cleanup();
        done();
    };
    // the scroll has ended when no scroll event came for a while; this also covers "nothing to
    // scroll" and browsers without `scrollend` (Safari)
    const wait = () => {
        clearTimeout(idle);
        idle = setTimeout(finish, 200);
    };
    // `scrollend` is quicker, but a scroll that was replaced by another one also ends: only
    // count it if the page then stays still
    const onEnd = () => {
        const y = window.scrollY;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => window.scrollY === y && finish());
    };
    const USER = ["wheel", "touchstart", "keydown"] as const;
    const cleanup = () => {
        window.removeEventListener("scroll", wait);
        window.removeEventListener("scrollend", onEnd);
        USER.forEach((t) => window.removeEventListener(t, finish));
        clearTimeout(idle);
        cancelAnimationFrame(frame);
        cancelAnimationFrame(start);
    };
    // start in the next frame: React runs effects twice in development (StrictMode), and a second
    // scroll would replace the first; the cleanup in between cancels the frame
    start = requestAnimationFrame(() => {
        window.addEventListener("scroll", wait);
        window.addEventListener("scrollend", onEnd);
        USER.forEach((t) => window.addEventListener(t, finish, { passive: true }));
        el.scrollIntoView({ behavior, block });
        wait();
    });
    return cleanup;
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

/** Shown instead of a page that failed, so that the rest of the host page keeps working. */
export function ErrorView() {
    const intl = useIntl();
    return (
        <div className="commitment-view">
            <div className="error-view" role="alert">
                <h1 className="page-title">{intl.formatMessage({ id: "error.title" })}</h1>
                <p>{intl.formatMessage({ id: "error.text" })}</p>
                <button
                    type="button"
                    className="btn-solid"
                    onClick={() => window.location.reload()}
                >
                    {intl.formatMessage({ id: "error.reload" })}
                </button>
            </div>
        </div>
    );
}

/** Space for a page whose code is still loading, so that the host's footer stays at the bottom. */
export function Loading() {
    return <div className="commitment-view page-loading" aria-busy="true" />;
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
