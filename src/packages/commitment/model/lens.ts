// The "lens": selected perspective, topic and concept badges, kept in the URL query.
import { FACET_FIELD, FACET_KINDS, type Facet, type FacetKind, type Tags } from "./types";
import { content } from "./content";

export type Lens = Partial<Record<FacetKind, string>>;

const FACETS: Record<FacetKind, Facet[]> = {
    role: content.roles,
    topic: content.topics,
    concept: content.concepts
};

export function facet(kind: FacetKind, id: string | undefined): Facet | undefined {
    return id === undefined ? undefined : FACETS[kind].find((f) => f.id === id);
}
export const facetsOf = (kind: FacetKind): Facet[] => FACETS[kind];

/** The written (non-placeholder) deep dive of a concept, if any. */
export const deepDiveFor = (concept: string) =>
    Object.values(content.deepdives).find((d) => d.concept === concept && !d.placeholder);

/** Reads the lens from `?role=…&topic=…&concept=…`, ignoring unknown ids. */
export function lensFromQuery(q: URLSearchParams): Lens {
    const lens: Lens = {};
    for (const k of FACET_KINDS) {
        const id = q.get(k) ?? undefined;
        if (facet(k, id)) lens[k] = id;
    }
    return lens;
}
export const lensActive = (lens: Lens) => FACET_KINDS.some((k) => lens[k]);

/** Colour of the first selected facet, used for the highlights. */
export function lensColour(lens: Lens): string | undefined {
    const k = FACET_KINDS.find((k) => lens[k]);
    return k && facet(k, lens[k])?.colour;
}

/** A statement is relevant if it has all selected facets. */
export const statementHit = (tags: Tags, lens: Lens) =>
    FACET_KINDS.every((k) => !lens[k] || tags[FACET_FIELD[k]].includes(lens[k]));

/** An annotation lights up if it has any selected facet. */
export const annotationHit = (tags: Tags, lens: Lens) =>
    FACET_KINDS.some((k) => lens[k] && tags[FACET_FIELD[k]].includes(lens[k]));

/** Text colour (dark or white) with the better contrast on a facet colour. */
export function ink(hex: string): string {
    const [R = 0, G = 0, B = 0] = [1, 3, 5]
        .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    const L = 0.2126 * R + 0.7152 * G + 0.0722 * B;
    return (L + 0.05) / 0.05 > 1.05 / (L + 0.05) ? "#1a202c" : "#ffffff";
}

/** CSS variables for an element drawn in a facet colour. */
export const colourVars = (hex: string) =>
    ({ "--c": hex, "--ink": ink(hex) }) as React.CSSProperties;
