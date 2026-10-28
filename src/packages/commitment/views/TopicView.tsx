import { useIntl } from "open-pioneer:react-hooks";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
    scrollBehavior,
    scrollIntoViewThen,
    useAppPath,
    useEnterBand,
    useQueryState,
    useReveal
} from "../components/base";
import { OtherFacets } from "../components/FacetBadge";
import { Icon } from "../components/Icon";
import { Markdown } from "../components/Markdown";
import { Page } from "../components/Page";
import { content } from "../model/content";
import { colourVars, statementsWith } from "../model/lens";
import type { TopicStep } from "../model/types";

/** Topic page: steps scroll by on the right, the matching statement lights up on the left. */
export default function TopicView() {
    const intl = useIntl();
    const appPath = useAppPath();
    const { id } = useParams();
    const topic = content.topics.find((t) => t.id === id);
    // the active step is in the URL (`?step=3`), so that a shared link opens at the same step
    const { query, set: setQuery } = useQueryState();

    const tagged = useMemo(() => (topic ? statementsWith("topic", topic.id) : []), [topic]);
    const relevant = useMemo(() => new Set(tagged.map((s) => s.n)), [tagged]);
    const steps: TopicStep[] = useMemo(
        () =>
            !topic
                ? []
                : topic.steps.length
                  ? topic.steps
                  : // no steps written yet: one generated placeholder step per tagged statement
                    tagged.map((s) => ({
                        n: s.n,
                        title: s.short,
                        text: intl.formatMessage(
                            { id: "topic.placeholder-step" },
                            {
                                topic: topic.label.toLowerCase(),
                                n: s.n,
                                short: s.short.toLowerCase()
                            }
                        )
                    })),
        [topic, tagged, intl]
    );

    // the step in the middle of the viewport is the active one
    const stepEls = useRef<(HTMLElement | null)[]>([]);
    const condEls = useRef(new Map<number, HTMLElement>());
    const sticky = useRef<HTMLDivElement>(null);
    // `?step=` is 1-based; without it, the first step is active
    const step = Number(query.get("step")) || 1;
    const active = Math.max(0, Math.min(step, steps.length) - 1);
    // a link with `?step=`: scroll that step to the middle of the view first
    const ready = useReveal(
        active > 0 ? String(active) : null,
        useCallback((i: string, done: () => void, behavior: ScrollBehavior) => {
            const el = stepEls.current[Number(i)];
            return el ? scrollIntoViewThen(el, done, { block: "center", behavior }) : done();
        }, [])
    );
    // while it scrolls, the steps it passes don't count
    const readyRef = useRef(ready);
    useLayoutEffect(() => {
        readyRef.current = ready;
    }, [ready]);
    useEnterBand(
        useCallback(() => stepEls.current.slice(0, steps.length), [steps]),
        "-45% 0px -45% 0px",
        useCallback(
            (el: HTMLElement) => {
                const i = Number(el.dataset.i);
                if (readyRef.current) setQuery({ step: i > 0 ? String(i + 1) : null });
            },
            [setQuery]
        )
    );

    // small screens: the condensed Commitment is a short scroll box; keep the active statement in view
    const activeN = steps[active]?.n;
    useEffect(() => {
        const box = sticky.current;
        const el = activeN === undefined ? undefined : condEls.current.get(activeN);
        if (box && el && box.scrollHeight > box.clientHeight)
            box.scrollTo({ top: el.offsetTop - 40, behavior: scrollBehavior() });
    }, [activeN]);

    if (!topic) return <Navigate to={appPath("/topics")} replace />;

    return (
        <Page back={{ to: "/topics", label: intl.formatMessage({ id: "back-to.topics" }) }}>
            <div className="topic-hero" style={colourVars(topic.colour)}>
                <h1>
                    <Icon name={topic.icon} />
                    {topic.label}{" "}
                    <span className="mock-badge">
                        {intl.formatMessage({ id: "example-badge" })}
                    </span>
                </h1>
                <p>
                    {intl.formatRichMessage(
                        { id: "topic.intro" },
                        {
                            what: topic.knownFrom,
                            n: relevant.size,
                            total: content.statements.length,
                            steps: steps.length
                        }
                    )}
                </p>
            </div>
            <div className="scrolly" style={colourVars(topic.colour)}>
                <div className="scrolly-sticky" ref={sticky} aria-hidden="true">
                    <h4>
                        {intl.formatMessage({ id: "topic.commitment" })}
                        <span className="step-dots">
                            {steps.map((st, i) => (
                                <i key={i} className={i <= active ? "on" : undefined} />
                            ))}
                        </span>
                    </h4>
                    {content.statements.map((s) => (
                        <div
                            key={s.n}
                            ref={(el) => {
                                if (el) condEls.current.set(s.n, el);
                            }}
                            className={`cond ${relevant.has(s.n) ? "rel" : "irrel"}${activeN === s.n ? " active" : ""}`}
                        >
                            <span className="cn">{s.n}</span>
                            <span>
                                <Markdown inline text={s.text} />
                            </span>
                        </div>
                    ))}
                </div>
                <div className="steps">
                    {steps.map((st, i) => (
                        <section
                            key={i}
                            data-i={i}
                            ref={(el) => {
                                stepEls.current[i] = el;
                            }}
                            className={`step${i === active ? " active" : ""}`}
                        >
                            <div className="step-n">
                                {intl.formatMessage(
                                    { id: "topic.step" },
                                    { i: i + 1, total: steps.length, n: st.n }
                                )}
                            </div>
                            <h3>{st.title}</h3>
                            <Markdown text={st.text} />
                            <Link to={appPath(`?topic=${topic.id}&focus=c${st.n}`)}>
                                {intl.formatMessage({ id: "topic.in-context" })}
                            </Link>
                            {i < steps.length - 1 && (
                                <div className="step-next" aria-hidden="true">
                                    {intl.formatMessage(
                                        { id: "topic.next" },
                                        { title: steps[i + 1]?.title }
                                    )}
                                </div>
                            )}
                        </section>
                    ))}
                    <div className="topic-others">
                        <p className="lens-label">{intl.formatMessage({ id: "topic.others" })}</p>
                        <div className="other-roles">
                            <OtherFacets kind="topic" current={topic.id} />
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    );
}
