import { useIntl } from "open-pioneer:react-hooks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
    scrollBehavior,
    scrollIntoViewThen,
    useAppPath,
    useQueryState,
    useReveal,
    useScrollFrame,
    withQuery
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
    const { query, set: setQuery, key } = useQueryState();
    const navigate = useNavigate();

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
    // the steps about each statement
    const stepsOf = useMemo(() => {
        const of = new Map<number, number[]>();
        steps.forEach((st, i) => of.set(st.n, [...(of.get(st.n) ?? []), i]));
        return of;
    }, [steps]);

    const stepEls = useRef<(HTMLElement | null)[]>([]);
    const condEls = useRef(new Map<number, HTMLElement>());
    const sticky = useRef<HTMLDivElement>(null);
    // `?step=` is 1-based; without it, the first step is active
    const step = Number(query.get("step")) || 1;
    const active = Math.max(0, Math.min(step, steps.length) - 1);
    // a link with `?step=` (also a click on a statement): scroll that step to the middle first
    const ready = useReveal(
        query.has("step") ? String(active) : null,
        useCallback((i: string, done: () => void, behavior: ScrollBehavior) => {
            const el = stepEls.current[Number(i)];
            return el ? scrollIntoViewThen(el, done, { block: "center", behavior }) : done();
        }, [])
    );
    // The active step is the last one whose top has reached the middle of the window; at the top
    // and the end of the page, which a tall window can't scroll every step to, it is the first or
    // the last one. Only scrolling counts: not the scroll of a link to its step, and not a page that
    // stays where a link left it (a link to step 2 in a window too tall to scroll).
    const scrolledFrom = useRef<number | null>(null);
    useScrollFrame(
        useCallback(() => {
            const page = document.scrollingElement;
            const from = scrolledFrom.current;
            scrolledFrom.current = ready && page ? page.scrollTop : null;
            if (!page || from === null || from === page.scrollTop) return;
            const middle = page.clientHeight / 2;
            const above = stepEls.current
                .slice(0, steps.length)
                .filter((el) => el && el.getBoundingClientRect().top <= middle).length;
            const i =
                page.scrollTop <= 0
                    ? 0
                    : page.scrollTop + page.clientHeight >= page.scrollHeight - 2
                      ? steps.length - 1
                      : Math.max(0, above - 1);
            if (i !== active) setQuery({ step: i > 0 ? String(i + 1) : null });
        }, [ready, steps, active, setQuery])
    );

    // The mouse and the keyboard link a step and its statement: pointing at either one, or moving
    // the focus into a step, lights up both, until another pair is pointed at or the URL changes
    // (scrolling makes another step active). Only a mouse that moves counts, not the events a
    // browser sends when the page scrolls under a resting cursor.
    const [pointed, setPointed] = useState<{ steps: number[]; key: string } | null>(null);
    const lit = pointed?.key === key ? pointed.steps : [active];
    const light = (to: number[]) => {
        if (to.length && String(to) !== String(lit)) setPointed({ steps: to, key });
    };
    const pointer = useRef("");
    const point = (e: PointerEvent, to: number[]) => {
        const at = `${e.clientX},${e.clientY}`;
        if (e.pointerType === "touch" || at === pointer.current) return;
        pointer.current = at;
        light(to);
    };
    // all lit steps are about one statement
    const litN = steps[lit[0] ?? active]?.n;

    // the condensed Commitment is a scroll box (most windows are too short for it); keep the lit
    // statement in view. Only when it is out of view: a statement the mouse points at is in view,
    // and the list must not move under the mouse.
    useEffect(() => {
        const box = sticky.current;
        const el = litN === undefined ? undefined : condEls.current.get(litN);
        if (!box || !el) return;
        const top = el.offsetTop - box.scrollTop;
        if (top < 0 || top + el.offsetHeight > box.clientHeight)
            box.scrollTo({ top: el.offsetTop - 40, behavior: scrollBehavior() });
    }, [litN]);

    if (!topic) return <Navigate to={appPath("/topics")} replace />;

    return (
        <Page
            back={{ to: "/topics", label: intl.formatMessage({ id: "back-to.topics" }) }}
            name={topic.label}
        >
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
                <div className="scrolly-sticky" ref={sticky} aria-hidden="true" tabIndex={-1}>
                    <h4>
                        {intl.formatMessage({ id: "topic.commitment" })}
                        <span className="step-dots">
                            {steps.map((st, i) => (
                                <i key={i} className={i <= active ? "on" : undefined} />
                            ))}
                        </span>
                    </h4>
                    {content.statements.map((s) => {
                        const its = stepsOf.get(s.n) ?? [];
                        const first = its[0];
                        const props = {
                            ref: (el: HTMLElement | null) => {
                                if (el) condEls.current.set(s.n, el);
                            },
                            className: `cond ${relevant.has(s.n) ? "rel" : "irrel"}${litN === s.n ? " active" : ""}`,
                            children: (
                                <>
                                    <span className="cn">{s.n}</span>
                                    <span>
                                        <Markdown inline plain text={s.text} />
                                    </span>
                                </>
                            )
                        };
                        // A statement with a step leads to its (first) step, like a link with
                        // `?step=`. The steps are the way in for the keyboard and screen readers,
                        // so this box stays hidden from them, and a click leaves the focus alone.
                        return first !== undefined ? (
                            <button
                                key={s.n}
                                type="button"
                                tabIndex={-1}
                                {...props}
                                onPointerMove={(e) => point(e, its)}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() =>
                                    navigate(
                                        {
                                            search: `?${withQuery(query, { step: String(first + 1) })}`
                                        },
                                        { replace: true }
                                    )
                                }
                            />
                        ) : (
                            <div key={s.n} {...props} />
                        );
                    })}
                </div>
                <div className="steps">
                    {steps.map((st, i) => (
                        <section
                            key={i}
                            ref={(el) => {
                                stepEls.current[i] = el;
                            }}
                            className={`step${lit.includes(i) ? " active" : ""}`}
                            onPointerMove={(e) => point(e, [i])}
                            onFocus={() => light([i])}
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
