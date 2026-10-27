import { memo, useMemo, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Link } from "react-router-dom";
import { ANNOTATION_SCHEME } from "../model/parse";
import { ExternalLink, useAppPath } from "./base";

// Content texts use a small Markdown subset (docs/content-authoring.md); everything else is dropped.
const BLOCK = ["p", "strong", "em", "ul", "ol", "li", "a"];
const INLINE = ["strong", "em", "a"];
const SAFE_URL = /^(https?:\/\/|mailto:|#\/|annotation:)/;

interface Props {
    text: string;
    /** Inline text without paragraphs, e.g. a statement. */
    inline?: boolean;
    /** Renders the `[quote](annotation:id)` links of the Commitment text. */
    annotation?: (id: string, children: ReactNode) => ReactNode;
}

// Memoised: parsing is the expensive part, and the reader re-renders on scroll and hover.
export const Markdown = memo(function Markdown({ text, inline, annotation }: Props) {
    const appPath = useAppPath();
    const components: Components = useMemo(
        () => ({
            a: ({ href = "", children }) => {
                // urlTransform empties disallowed URLs: show the text without a link
                if (!href) return children;
                if (href.startsWith(ANNOTATION_SCHEME))
                    return annotation
                        ? annotation(href.slice(ANNOTATION_SCHEME.length), children)
                        : children;
                if (href.startsWith("#/"))
                    return <Link to={appPath(href.slice(1))}>{children}</Link>;
                return <ExternalLink href={href}>{children}</ExternalLink>;
            }
        }),
        [appPath, annotation]
    );
    return (
        <ReactMarkdown
            skipHtml
            allowedElements={inline ? INLINE : BLOCK}
            unwrapDisallowed
            urlTransform={(url) => (SAFE_URL.test(url) ? url : "")}
            components={components}
        >
            {text}
        </ReactMarkdown>
    );
});
