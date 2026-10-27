import { Container } from "@chakra-ui/react";
import { useIntl } from "open-pioneer:react-hooks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAppPath } from "../../components/base";
import { Icon } from "../../components/Icon";
import { content } from "../../model/content";
import {
    annotationHit,
    colourVars,
    facet,
    lensActive,
    lensColour,
    lensFromQuery,
    statementHit
} from "../../model/lens";
import { FACET_FIELD, FACET_KINDS, type FacetKind, type Statement } from "../../model/types";
import { AnnotatedText, AnnotationButton } from "./AnnotationButton";
import { Contents } from "./Contents";
import { ReaderContext, type Panel, type ReaderState } from "./context";
import { LensBar } from "./LensBar";
import { SidePanel } from "./Panels";

const COMMITMENT_SITE = "https://nfdi4earth.de/commitment";
const SIGN_URL = "https://nfdi4earth.de/commit";
const DOI_URL = "https://doi.org/10.5281/zenodo.10123880";

const ext = (href: string) =>
    function ExternalLink(chunks: React.ReactNode[]) {
        return (
            <a key={href} href={href} target="_blank" rel="noreferrer">
                {chunks}
            </a>
        );
    };

function reducedMotion() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/** The annotated Commitment with lens bar, contents menu and side panel. */
export default function ReaderView() {
    const intl = useIntl();
    const appPath = useAppPath();
    const [query, setQuery] = useSearchParams();
    const lens = useMemo(() => lensFromQuery(query), [query]);
    const focus = query.get("focus");
    const on = lensActive(lens);

    const [openId, setOpenId] = useState<string | null>(null);
    const [panel, setPanel] = useState<Panel | null>(null);
    const [preambleOpen, setPreambleOpen] = useState(false);
    const [tocOpen, setTocOpen] = useState(false);
    const [current, setCurrent] = useState<number | null>(null);
    const [notFound, setNotFound] = useState<string | null>(null);

    // scroll targets, registered by ref callbacks (no document queries: OneStop4All uses a shadow root)
    const anchors = useRef(new Map<string, HTMLElement>());
    const anchor = useCallback(
        (id: string) => (el: HTMLElement | null) => {
            if (el) anchors.current.set(id, el);
            else anchors.current.delete(id);
        },
        []
    );

    const openPanel = useCallback((p: Panel) => {
        setOpenId(null);
        setPanel(p);
    }, []);
    const reader: ReaderState = useMemo(
        () => ({ lens, openId, setOpenId, openPanel, anchor }),
        [lens, openId, openPanel, anchor]
    );

    function scrollTo(id: string, pulse: boolean) {
        const el = anchors.current.get(id);
        if (!el) return false;
        el.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
        if (pulse) {
            el.classList.remove("pulse");
            void el.offsetWidth; // restart the animation
            el.classList.add("pulse");
        }
        return true;
    }
    function jump(id: string, pulse: boolean) {
        setTocOpen(false);
        if (id === "preamble") setPreambleOpen(true);
        // after the preamble has opened
        setTimeout(() => scrollTo(id, pulse), 0);
    }

    // links in the panels and popovers change the query: close them
    const search = query.toString();
    useEffect(() => {
        setPanel(null);
        setOpenId(null);
    }, [search]);

    // ?focus=<anchor>: scroll there, pulse, and open the annotation
    useEffect(() => {
        setNotFound(null);
        if (!focus) return;
        const a = content.annotations[focus];
        if (focus.startsWith("pre-") || focus === "preamble" || a?.target.startsWith("pre-"))
            setPreambleOpen(true);
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(
            setTimeout(() => {
                // an unknown phrase id like "c8-foo" falls back to its statement
                const id =
                    anchors.current.has(focus) || !/^c\d+-/.test(focus)
                        ? focus
                        : (focus.split("-")[0] ?? focus);
                if (!scrollTo(id, true)) return setNotFound(focus);
                if (a)
                    timers.push(
                        setTimeout(
                            () =>
                                a.depth === "deepdive"
                                    ? openPanel({ kind: "annotation", id: focus })
                                    : setOpenId(focus),
                            600
                        )
                    );
            }, 150)
        );
        return () => timers.forEach(clearTimeout);
    }, [focus, openPanel]);

    function toggle(kind: FacetKind, id: string) {
        const next = new URLSearchParams(query);
        if (lens[kind] === id) next.delete(kind);
        else next.set(kind, id);
        next.delete("focus");
        setQuery(next, { replace: true });
    }
    function clear() {
        const next = new URLSearchParams(query);
        FACET_KINDS.forEach((k) => next.delete(k));
        next.delete("focus");
        setQuery(next, { replace: true });
    }

    // current statement for the contents menu
    useEffect(() => {
        const io = new IntersectionObserver(
            (entries) =>
                entries.forEach(
                    (e) =>
                        e.isIntersecting && setCurrent(Number((e.target as HTMLElement).dataset.n))
                ),
            { rootMargin: "-40% 0px -55% 0px" }
        );
        content.statements.forEach((s) => {
            const el = anchors.current.get(`c${s.n}`);
            if (el) io.observe(el);
        });
        return () => io.disconnect();
    }, []);

    // the lens bar's height positions the contents menu and the scroll targets below it
    const lensBar = useRef<HTMLDivElement>(null);
    const [lensH, setLensH] = useState(90);
    useEffect(() => {
        const el = lensBar.current;
        if (!el) return;
        const ro = new ResizeObserver(() => setLensH(el.offsetHeight));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // preamble: one count of relevant passages per selected facet
    const preambleAnnotations = Object.values(content.annotations).filter((a) =>
        a.target.startsWith("pre-")
    );
    const preCounts = FACET_KINDS.flatMap((k) => {
        const f = facet(k, lens[k]);
        if (!f) return [];
        const n = preambleAnnotations.filter((a) => a[FACET_FIELD[k]].includes(f.id)).length;
        return [{ kind: k, f, n }];
    });
    // a preamble paragraph or the intro is dimmed unless it holds a passage that lights up
    const passageDim = (target: string) =>
        on &&
        !Object.values(content.annotations).some(
            (a) => a.target === target && annotationHit(a, lens)
        );

    const rootStyle = {
        "--lens": lensColour(lens) ?? "var(--primary)",
        "--lens-h": `${lensH}px`
    } as React.CSSProperties;

    const tiles: [string, string, string, string][] = [
        ["/for", "user", "tiles.explore-by", "tiles.perspective"],
        ["/topics", "pen", "tiles.explore-by", "tiles.topics"],
        ["/concepts", "bulb", "tiles.explore-by", "tiles.concepts"],
        ["/map", "map", "tiles.explore-the", "tiles.map"]
    ];

    const statement = (s: Statement) => {
        const hit = statementHit(s, lens);
        return (
            <div
                key={s.n}
                className={`statement${on ? (hit ? " hit" : " dim") : ""}`}
                data-n={s.n}
                ref={anchor(`c${s.n}`)}
            >
                <button
                    type="button"
                    className="num"
                    aria-haspopup="dialog"
                    aria-label={intl.formatMessage({ id: "statement.aria" }, { n: s.n })}
                    onClick={() => openPanel({ kind: "statement", n: s.n })}
                >
                    {s.n}
                </button>
                <p className="stext">
                    <AnnotatedText text={s.text} />
                </p>
                <div className="rail" aria-hidden="true">
                    {s.roles.map((r) => {
                        const f = facet("role", r);
                        return f && <span key={r} style={colourVars(f.colour)} title={f.label} />;
                    })}
                </div>
            </div>
        );
    };

    return (
        <ReaderContext.Provider value={reader}>
            <Container maxW={{ base: "100%", custombreak: "80%" }}>
                <a className="backto" href={COMMITMENT_SITE} target="_blank" rel="noreferrer">
                    <svg width="12" height="18" viewBox="0 0 16 24" fill="none" aria-hidden="true">
                        <path
                            d="M14.4541 22.5L2.99955 12L14.4541 1.5"
                            stroke="#05668D"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                    <span>
                        <b>{intl.formatMessage({ id: "back" })}</b>{" "}
                        {intl.formatMessage({ id: "reader.back" })}
                    </span>
                </a>
                <h1 className="page-title">
                    {intl.formatMessage({ id: "title" })}{" "}
                    <span className="mock-badge">{intl.formatMessage({ id: "mock-badge" })}</span>
                </h1>
                <p className="page-sub">
                    {intl.formatRichMessage(
                        { id: "reader.sub" },
                        { doi: ext(DOI_URL), sign: ext(SIGN_URL) }
                    )}
                </p>
                <div className="tiles">
                    {tiles.map(([path, icon, type, title]) => (
                        <Link key={path} className="tile" to={appPath(path)}>
                            <div className="tile-icon">
                                <Icon name={icon} />
                            </div>
                            <div className="tile-type">{intl.formatMessage({ id: type })}</div>
                            <div className="tile-title">{intl.formatMessage({ id: title })}</div>
                        </Link>
                    ))}
                </div>
            </Container>

            <LensBar ref={lensBar} lens={lens} onToggle={toggle} onClear={clear} />

            <Container maxW={{ base: "100%", custombreak: "80%" }}>
                <div className={`reader-root${on ? " lens-on" : ""}`} style={rootStyle}>
                    {notFound && (
                        <p className="focus-missing" role="status">
                            {intl.formatMessage({ id: "focus.not-found" }, { id: notFound })}
                        </p>
                    )}
                    <div className="reader">
                        <aside className={`toc-col${tocOpen ? " open" : ""}`}>
                            <Contents lens={lens} current={current} onJump={jump} />
                        </aside>
                        <article className="reader-text">
                            <div className="legend">
                                <span>
                                    <AnnotationButton id="legend-note">
                                        {intl.formatMessage({ id: "legend.note" })}
                                    </AnnotationButton>{" "}
                                    {intl.formatMessage({ id: "legend.hover" })}
                                </span>
                                <span>
                                    <AnnotationButton id="legend-explainer">
                                        {intl.formatMessage({ id: "legend.explainer" })}
                                    </AnnotationButton>{" "}
                                    {intl.formatMessage({ id: "legend.click" })}
                                </span>
                                <span>
                                    <AnnotationButton id="legend-deepdive">
                                        {intl.formatMessage({ id: "legend.deepdive" })}
                                    </AnnotationButton>{" "}
                                    {intl.formatMessage({ id: "legend.click" })}
                                </span>
                                <span>
                                    <button
                                        type="button"
                                        className="num-sample"
                                        aria-label={intl.formatMessage({
                                            id: "legend.statement-aria"
                                        })}
                                        onClick={() => openPanel({ kind: "statement", n: 1 })}
                                    >
                                        1
                                    </button>{" "}
                                    {intl.formatMessage({ id: "legend.statement" })}
                                </span>
                            </div>

                            <details
                                className="preamble"
                                ref={anchor("preamble")}
                                open={preambleOpen}
                                onToggle={(e) => setPreambleOpen(e.currentTarget.open)}
                            >
                                <summary>
                                    {intl.formatMessage({ id: "reader.preamble" })}
                                    {preCounts.length > 0 && (
                                        <span className="pre-count">
                                            {preCounts.map(({ kind, f, n }) => (
                                                <span
                                                    key={kind}
                                                    className={`pre-count-item${n ? "" : " zero"}`}
                                                    data-kind={kind}
                                                    style={colourVars(f.colour)}
                                                    title={f.label}
                                                >
                                                    <Icon name={f.icon} />
                                                    {intl.formatMessage(
                                                        { id: "lens.passages" },
                                                        { n }
                                                    )}
                                                </span>
                                            ))}
                                        </span>
                                    )}
                                </summary>
                                {content.preamble.map((p, i) => (
                                    <p
                                        key={i}
                                        ref={anchor(`pre-${i + 1}`)}
                                        className={passageDim(`pre-${i + 1}`) ? "dim" : undefined}
                                    >
                                        <AnnotatedText text={p} />
                                    </p>
                                ))}
                                <p>
                                    {intl.formatRichMessage(
                                        { id: "reader.sign" },
                                        { a: ext(SIGN_URL) }
                                    )}
                                </p>
                            </details>

                            <h2 className="page-title reader-heading">
                                {intl.formatMessage({ id: "reader.heading" })}
                            </h2>
                            <p
                                className={`intro${passageDim("intro") ? " dim" : ""}`}
                                ref={anchor("intro")}
                            >
                                <AnnotatedText text={content.intro} />
                            </p>
                            <p className="intro">
                                <b>{intl.formatMessage({ id: "reader.as-signatories" })}</b>
                            </p>
                            {content.boxes.map((b) => (
                                <div key={b.id}>
                                    <div className="box-banner" ref={anchor(b.id)}>
                                        <AnnotatedText text={b.title} />
                                    </div>
                                    <div className="statements">
                                        {content.statements
                                            .filter((s) => s.n >= b.from && s.n <= b.to)
                                            .map(statement)}
                                    </div>
                                </div>
                            ))}
                        </article>
                    </div>
                </div>
            </Container>

            <button
                type="button"
                className="btn-solid toc-toggle"
                onClick={() => setTocOpen((o) => !o)}
            >
                <Icon name="text" size={18} /> {intl.formatMessage({ id: "contents.toggle" })}
            </button>
            <SidePanel panel={panel} onClose={() => setPanel(null)} />
        </ReaderContext.Provider>
    );
}
