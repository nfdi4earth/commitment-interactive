import { useIntl } from "open-pioneer:react-hooks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    ExternalLink,
    scrollIntoViewThen,
    useAppPath,
    useQueryState,
    useReveal,
    useScrollFrame
} from "../../components/base";
import { Icon } from "../../components/Icon";
import { BackLink, PageContainer } from "../../components/Page";
import { content } from "../../model/content";
import {
    annotationHit,
    annotationsOn,
    colourVars,
    facet,
    lensActive,
    lensColour,
    lensFromQuery,
    statementHit,
    statementOf,
    statementsIn
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
    function Ext(chunks: React.ReactNode[]) {
        return (
            <ExternalLink key={href} href={href}>
                {chunks}
            </ExternalLink>
        );
    };

/** Closes whatever is open. */
const CLOSED = { focus: null, statement: null };

/** A target in the preamble: the preamble, a paragraph of it or an annotation in it. */
const inPreamble = (target: string) =>
    target === "preamble" ||
    target.startsWith("pre-") ||
    !!content.annotations[target]?.target.startsWith("pre-");

const PREAMBLE_ANNOTATIONS = content.preamble.flatMap((_, i) => annotationsOn(`pre-${i + 1}`));

/** The annotated Commitment with lens bar, contents menu and side panel. */
export default function ReaderView() {
    const intl = useIntl();
    const appPath = useAppPath();
    const { query, set: setQuery, quiet } = useQueryState();
    // the lens only changes with its own parameters, not with what is open
    const [role, topic, concept] = [query.get("role"), query.get("topic"), query.get("concept")];
    const lens = useMemo(
        () => lensFromQuery({ get: (k) => ({ role, topic, concept })[k] }),
        [role, topic, concept]
    );
    const on = lensActive(lens);
    // what is open comes from the URL (see components/base.tsx)
    const focus = query.get("focus");
    const statementN = Number(query.get("statement")) || null;
    const target = focus ?? (statementN ? `c${statementN}` : null);

    const [tocOpen, setTocOpen] = useState(false);
    const [current, setCurrent] = useState<number | null>(null);
    const [notFound, setNotFound] = useState<string | null>(null);

    // scroll targets, registered by ref callbacks (no document queries: OneStop4All uses a shadow root);
    // one callback per id, so that React does not re-register them on every render
    const anchors = useRef(new Map<string, HTMLElement>());
    const anchorRefs = useRef(new Map<string, (el: HTMLElement | null) => void>());
    const anchor = useCallback((id: string) => {
        let ref = anchorRefs.current.get(id);
        if (!ref) {
            ref = (el) => {
                if (el) anchors.current.set(id, el);
                else anchors.current.delete(id);
            };
            anchorRefs.current.set(id, ref);
        }
        return ref;
    }, []);

    // a link or a shared URL: scroll to its target and pulse it; what it opens appears when the
    // scroll has ended (`ready`); a target in the preamble keeps the preamble open afterwards
    const ready = useReveal(
        target,
        useCallback(
            (target: string, done: () => void, behavior: ScrollBehavior) => {
                // an unknown phrase id like "c8-foo" falls back to its statement
                const id =
                    anchors.current.has(target) || !/^c\d+-/.test(target)
                        ? target
                        : (target.split("-")[0] ?? target);
                const el = anchors.current.get(id);
                if (!el) {
                    // the rest of the URL (e.g. a statement panel) still opens
                    setNotFound(target);
                    return done();
                }
                // the styles animate annotations and statements
                el.classList.remove("pulse");
                void el.offsetWidth; // restart the animation
                el.classList.add("pulse");
                return scrollIntoViewThen(
                    el,
                    () => {
                        if (inPreamble(target)) setQuery({ preamble: "open" });
                        done();
                    },
                    { behavior }
                );
            },
            [setQuery]
        )
    );

    const shown = ready && focus ? content.annotations[focus] : undefined;
    const openId = shown && shown.depth !== "deepdive" ? shown.id : null;
    const panel: Panel | null =
        shown?.depth === "deepdive"
            ? { kind: "annotation", id: shown.id }
            : ready && statementN
              ? { kind: "statement", n: statementN }
              : null;
    const open = useCallback((id: string) => setQuery({ focus: id, statement: null }), [setQuery]);
    const close = useCallback(() => setQuery(CLOSED), [setQuery]);
    const openStatement = (n: number) => setQuery({ statement: String(n), focus: null });
    const reader: ReaderState = useMemo(
        () => ({ lens, openId, focusId: focus, open, close, anchor }),
        [lens, openId, focus, open, close, anchor]
    );

    // the preamble is open when the URL says so, or while a link points into it (the reveal adds
    // `preamble=open` to the URL, which React Router applies a render later)
    const preambleOpen =
        query.get("preamble") === "open" || (!quiet && target !== null && inPreamble(target));

    function toggle(kind: FacetKind, id: string) {
        setQuery({ [kind]: lens[kind] === id ? null : id, ...CLOSED });
    }
    function clear() {
        setQuery({ role: null, topic: null, concept: null, ...CLOSED });
    }

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

    // current statement for the contents menu and the text: the one at the line where a link puts
    // a statement (its scroll-margin-top, below the header and the lens bar), so that the entry
    // just chosen is the current one at any window height. At the end of the page, where the last
    // statements can't reach that line, it is the chosen one (a link's target, or the statement of
    // an annotation) if in view, else the last one in view
    const chosen =
        target && (statementOf(target) ?? statementOf(content.annotations[target]?.target ?? ""));
    const chosenN = chosen ? chosen.n : null;
    useScrollFrame(
        useCallback(() => {
            const els = content.statements.flatMap((s) => anchors.current.get(`c${s.n}`) ?? []);
            const page = document.scrollingElement;
            if (!els[0] || !page) return;
            const line = parseFloat(getComputedStyle(els[0]).scrollMarginTop) + 2;
            const at = els.map((el) => ({
                n: Number(el.dataset.n),
                top: el.getBoundingClientRect().top
            }));
            const above = at.filter((s) => s.top <= line);
            let n = above.length ? above[above.length - 1]?.n : undefined;
            if (page.scrollTop + page.clientHeight >= page.scrollHeight - 2) {
                const inView = at.filter(
                    (s) => s.n === n || (s.top > line && s.top < page.clientHeight)
                );
                n = (inView.find((s) => s.n === chosenN) ?? inView.pop())?.n;
            }
            setCurrent(n ?? null);
        }, [chosenN]),
        // the line moves with the lens bar's height
        lensH
    );

    // preamble: one count of relevant passages per selected facet
    const preCounts = FACET_KINDS.flatMap((k) => {
        const f = facet(k, lens[k]);
        if (!f) return [];
        const n = PREAMBLE_ANNOTATIONS.filter((a) => a[FACET_FIELD[k]].includes(f.id)).length;
        return [{ kind: k, f, n }];
    });
    // a preamble paragraph or the intro is dimmed unless it holds a passage that lights up
    const passageDim = (target: string) =>
        on && !annotationsOn(target).some((a) => annotationHit(a, lens));

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
                className={`statement${on ? (hit ? " hit" : " dim") : ""}${current === s.n ? " current" : ""}`}
                data-n={s.n}
                ref={anchor(`c${s.n}`)}
            >
                <button
                    type="button"
                    className="num"
                    aria-haspopup="dialog"
                    aria-label={intl.formatMessage({ id: "statement.aria" }, { n: s.n })}
                    onClick={() => openStatement(s.n)}
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
            <PageContainer>
                <BackLink to={COMMITMENT_SITE} label={intl.formatMessage({ id: "reader.back" })} />
                <h1 className="page-title">
                    {intl.formatMessage({ id: "title" })}{" "}
                    <span className="mock-badge">{intl.formatMessage({ id: "mock-badge" })}</span>
                </h1>
                <p className="page-tagline">{intl.formatMessage({ id: "tagline" })}</p>
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
            </PageContainer>

            <LensBar ref={lensBar} lens={lens} onToggle={toggle} onClear={clear} />

            <PageContainer>
                <div className={`reader-root${on ? " lens-on" : ""}`} style={rootStyle}>
                    {notFound && notFound === target && (
                        <p className="focus-missing" role="status">
                            {intl.formatMessage({ id: "focus.not-found" }, { id: notFound })}
                        </p>
                    )}
                    <div className="reader">
                        <aside className={`toc-col${tocOpen ? " open" : ""}`}>
                            <Contents
                                lens={lens}
                                current={current}
                                onNavigate={() => setTocOpen(false)}
                            />
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
                                        onClick={() => openStatement(1)}
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
                                // the reader (or find-in-page) toggled it: keep the URL in step;
                                // the browser also reports React's own changes, which match
                                onToggle={(e) => {
                                    const opened = e.currentTarget.open;
                                    if (opened !== preambleOpen)
                                        setQuery({ preamble: opened ? "open" : null });
                                }}
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
                                        {statementsIn(b).map(statement)}
                                    </div>
                                </div>
                            ))}
                        </article>
                    </div>
                </div>
            </PageContainer>

            <button
                type="button"
                className="btn-solid toc-toggle"
                onClick={() => setTocOpen((o) => !o)}
            >
                <Icon name="text" size={18} />
                <span className="toc-toggle-label">
                    {intl.formatMessage({ id: "contents.toggle" })}
                </span>
            </button>
            <SidePanel panel={panel} onClose={close} />
        </ReaderContext.Provider>
    );
}
