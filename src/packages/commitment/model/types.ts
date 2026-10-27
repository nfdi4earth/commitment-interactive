// Content model of the interactive Commitment, read from content/ (see docs/content-authoring.md).

export type FacetKind = "role" | "topic" | "concept";
export const FACET_KINDS: FacetKind[] = ["role", "topic", "concept"];
/** Name of the list field for each facet kind, e.g. `statement.roles`. */
export const FACET_FIELD = { role: "roles", topic: "topics", concept: "concepts" } as const;

export type Depth = "note" | "explainer" | "deepdive";
export type Figure = "licence" | "openness" | "fair";

export interface Link {
    label: string;
    url: string;
}

export interface Tags {
    roles: string[];
    topics: string[];
    concepts: string[];
}

export interface Facet {
    id: string;
    kind: FacetKind;
    label: string;
    colour: string;
    icon: string;
    order: number;
}

export interface Role extends Facet {
    kind: "role";
    plural: string;
    /** One-paragraph description of the audience. */
    blurb: string;
    /** Per statement number: the note (Markdown) and one first step. */
    notes: Record<number, { note: string; step: string }>;
}

export interface TopicStep {
    n: number;
    title: string;
    text: string;
}

export interface Topic extends Facet {
    kind: "topic";
    knownFrom: string;
    /** Scrollytelling steps; empty if the topic file has none. */
    steps: TopicStep[];
}

export interface Concept extends Facet {
    kind: "concept";
}

/**
 * Inline Markdown in which every annotated quote is wrapped as a link `[quote](annotation:<id>)`.
 * Render it with `AnnotatedText`; `plainText()` removes the annotation links.
 */
export type AnnotatedMarkdown = string;

export interface Box {
    id: string;
    title: AnnotatedMarkdown;
    from: number;
    to: number;
}

export interface Statement extends Tags {
    n: number;
    box: string;
    text: AnnotatedMarkdown;
    short: string;
}

export interface Annotation extends Tags {
    id: string;
    /** `pre-1`…, `intro`, `boxA`, `boxB`, `c1`…, or `legend`. */
    target: string;
    /** The quoted words (none for `legend`). */
    quote?: string;
    depth: Depth;
    title: string;
    body: string;
    links: Link[];
    figure?: Figure;
    deepdive?: string;
    statements?: number[];
}

export interface DeepDiveSection {
    heading: string;
    text: string;
}

export interface DeepDive {
    id: string;
    title: string;
    concept: string;
    statements: number[];
    anchors: string[];
    links: Link[];
    figure?: Figure;
    placeholder: boolean;
    lead: string;
    sections: DeepDiveSection[];
}

export interface Content {
    preamble: AnnotatedMarkdown[];
    intro: AnnotatedMarkdown;
    boxes: Box[];
    statements: Statement[];
    annotations: Record<string, Annotation>;
    roles: Role[];
    topics: Topic[];
    concepts: Concept[];
    deepdives: Record<string, DeepDive>;
}
