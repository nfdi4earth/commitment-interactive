import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Link } from "react-router-dom";
import { ANNOTATION_SCHEME } from "../model/parse";
import { useAppPath } from "./base";

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

export function Markdown({ text, inline, annotation }: Props) {
    const appPath = useAppPath();
    const components: Components = {
        a: ({ href = "", children }) => {
            if (href.startsWith(ANNOTATION_SCHEME))
                return annotation
                    ? annotation(href.slice(ANNOTATION_SCHEME.length), children)
                    : children;
            if (href.startsWith("#/")) return <Link to={appPath(href.slice(1))}>{children}</Link>;
            return (
                <a href={href} target="_blank" rel="noreferrer">
                    {children}
                </a>
            );
        }
    };
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
}
