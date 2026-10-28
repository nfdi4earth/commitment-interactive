import { CloseButton, Popover, Portal, Tooltip } from "@chakra-ui/react";
import { useIntl } from "open-pioneer:react-hooks";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Link } from "react-router-dom";
import { Scoped, useAppPath } from "../../components/base";
import { CopyLink } from "../../components/CopyLink";
import { FacetTags } from "../../components/FacetBadge";
import { Markdown } from "../../components/Markdown";
import { content } from "../../model/content";
import { LinkList } from "../../components/LinkList";
import { annotationHit, deepDiveFor, statementHit, statementOf } from "../../model/lens";
import type { Annotation } from "../../model/types";
import { useReader } from "./context";

/** How long the pointer rests on a note before it opens (ms). */
const OPEN_DELAY = 100;

/** Deep dive that "Go deeper" leads to: the annotation's own, or one for its concepts. */
export function deeperFor(a: Annotation) {
    if (a.deepdive) return content.deepdives[a.deepdive];
    return a.concepts.map(deepDiveFor).find(Boolean);
}

/**
 * An annotated passage: a note opens as tooltip, an explainer as popover, a deep dive in the side panel.
 */
export function AnnotationButton({ id, children }: { id: string; children: ReactNode }) {
    const intl = useIntl();
    const appPath = useAppPath();
    const reader = useReader();
    // hovering a note shows it without changing the URL
    const [hover, setHover] = useState(false);
    // Chakra's tooltip and popover take time to set up, and the reader has dozens of annotations:
    // each gets its own only when a mouse enters it, it gets the focus, or it opens. Until then it
    // is a plain button; the swap replaces the button element, so it happens before a click can
    // start (flushSync) and gives the focus to the new one.
    const [live, setLive] = useState(false);
    const refocus = useRef(false);
    const el = useRef<HTMLButtonElement | null>(null);
    const stopWatch = useRef<() => void>(undefined);
    useEffect(() => () => stopWatch.current?.(), []);
    const anchor = reader.anchor(id);
    const ref = useCallback(
        (node: HTMLButtonElement | null) => {
            el.current = node;
            anchor(node);
        },
        [anchor]
    );
    // an effect, not a layout effect: the tooltip starts listening in its own effect, which runs first
    useEffect(() => {
        if (live && refocus.current) {
            refocus.current = false;
            el.current?.focus();
        }
    }, [live]);
    const a = content.annotations[id];
    if (!a) return <>{children}</>;

    const statement = statementOf(a.target);
    const hit =
        annotationHit(a, reader.lens) && (!statement || statementHit(statement, reader.lens));
    const open = reader.openId === id;
    const setOpen = (o: boolean) => (o ? reader.open(id) : open && reader.close());
    const label = intl.formatMessage(
        { id: "annotation.aria" },
        { quote: a.quote ?? a.title, depth: a.depth, title: a.title }
    );
    const props = {
        "type": "button" as const,
        "className": `anno d-${a.depth}${hit ? " hit" : ""}`,
        "aria-label": label,
        "ref": ref
    };
    // the first hover of a note: the tooltip's own hover handling only starts with a move over the
    // new button, so this shows the note after its delay if the pointer is still on the button
    const watchHover = () => {
        let over = true;
        const move = (e: PointerEvent) => {
            over = !!el.current && e.composedPath().includes(el.current);
        };
        const timer = setTimeout(() => {
            stop();
            if (over) setHover(true);
        }, OPEN_DELAY);
        const stop = () => {
            clearTimeout(timer);
            window.removeEventListener("pointermove", move);
        };
        window.addEventListener("pointermove", move);
        stopWatch.current = stop;
    };

    // once set up, it stays: swapping back would replace the element again, e.g. in the middle of
    // a click elsewhere that closes the popover
    const isLive = live || reader.focusId === id;
    if (isLive && !live) setLive(true);

    // a tap is left to the plain button's click, which opens the annotation: a swap between
    // touchstart and touchend would lose the tap
    if (a.depth !== "deepdive" && !isLive)
        return (
            <button
                {...props}
                aria-haspopup={a.depth === "explainer" ? "dialog" : undefined}
                aria-expanded={a.depth === "explainer" ? false : undefined}
                onPointerEnter={(e) => {
                    if (e.pointerType === "touch") return;
                    flushSync(() => setLive(true));
                    if (a.depth === "note") watchHover();
                }}
                onFocus={(e) => {
                    // keyboard focus only: a tap also focuses the button, before its click
                    if (!e.currentTarget.matches(":focus-visible")) return;
                    refocus.current = true;
                    // the tooltip opens on keyboard focus, but not on the focus given back below
                    flushSync(() => {
                        setLive(true);
                        if (a.depth === "note") setHover(true);
                    });
                }}
                onClick={(e) => {
                    // a tap or a screen reader may have focused it: the new button keeps the
                    // focus, so that closing the annotation gives it back there
                    if (e.currentTarget.matches(":focus")) {
                        refocus.current = true;
                        flushSync(() => setLive(true));
                    }
                    setOpen(true);
                }}
            >
                {children}
            </button>
        );

    if (a.depth === "deepdive")
        return (
            <button {...props} aria-haspopup="dialog" onClick={() => reader.open(id)}>
                {children}
            </button>
        );

    if (a.depth === "note")
        return (
            <Tooltip.Root
                open={open || hover}
                onOpenChange={(e) => {
                    setHover(e.open);
                    if (!e.open) setOpen(false);
                }}
                interactive
                openDelay={OPEN_DELAY}
                closeDelay={250}
                closeOnClick={false}
                // a note opened by a click or a link (in the URL) stays while the page scrolls
                closeOnScroll={!open}
                positioning={{ placement: "top" }}
                lazyMount
                unmountOnExit
            >
                <Tooltip.Trigger asChild>
                    <button {...props} onClick={() => setOpen(true)}>
                        {children}
                    </button>
                </Tooltip.Trigger>
                <Portal>
                    <Tooltip.Positioner>
                        <Tooltip.Content maxW="320px" fontSize="14px" px="12px" py="8px">
                            <Scoped>
                                <div className="note">
                                    <b>{a.title}</b>
                                    <Markdown text={a.body} />
                                </div>
                            </Scoped>
                        </Tooltip.Content>
                    </Tooltip.Positioner>
                </Portal>
            </Tooltip.Root>
        );

    const deeper = deeperFor(a);
    return (
        <Popover.Root
            open={open}
            onOpenChange={(e) => setOpen(e.open)}
            positioning={{ placement: "bottom-start" }}
            lazyMount
            unmountOnExit
        >
            <Popover.Trigger asChild>
                <button {...props} aria-haspopup="dialog">
                    {children}
                </button>
            </Popover.Trigger>
            <Portal>
                <Popover.Positioner>
                    <Popover.Content width="380px" maxW="calc(100vw - 32px)" borderRadius="0">
                        <Popover.CloseTrigger asChild position="absolute" top="6px" right="6px">
                            <CloseButton
                                size="sm"
                                aria-label={intl.formatMessage({ id: "panel.close" })}
                            />
                        </Popover.CloseTrigger>
                        <Popover.Body padding="18px 20px">
                            <Scoped>
                                <div className="popover">
                                    <Popover.Title asChild>
                                        <h4>{a.title}</h4>
                                    </Popover.Title>
                                    <Markdown text={a.body} />
                                    <LinkList links={a.links} />
                                    <FacetTags tags={a} />
                                    <div className="pop-actions">
                                        <CopyLink
                                            anchor={id}
                                            label={intl.formatMessage({ id: "copy.link" })}
                                        />
                                        {deeper && (
                                            <Link
                                                className="btn-outline"
                                                to={appPath(`/deep-dive/${deeper.id}`)}
                                            >
                                                {intl.formatMessage({ id: "popover.deeper" })}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </Scoped>
                        </Popover.Body>
                    </Popover.Content>
                </Popover.Positioner>
            </Portal>
        </Popover.Root>
    );
}

const renderAnnotation = (id: string, children: ReactNode) => (
    <AnnotationButton id={id}>{children}</AnnotationButton>
);

/** Commitment text with its annotated passages. */
export function AnnotatedText({ text }: { text: string }) {
    return <Markdown inline text={text} annotation={renderAnnotation} />;
}
