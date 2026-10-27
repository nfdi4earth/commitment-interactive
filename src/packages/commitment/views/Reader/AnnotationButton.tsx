import { CloseButton, Popover, Portal, Tooltip } from "@chakra-ui/react";
import { useIntl } from "open-pioneer:react-hooks";
import { useState, type ReactNode } from "react";
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
        "ref": reader.anchor(id)
    };

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
                openDelay={100}
                closeDelay={250}
                closeOnClick={false}
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
