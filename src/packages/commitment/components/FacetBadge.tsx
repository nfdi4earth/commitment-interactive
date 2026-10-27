import { useIntl } from "open-pioneer:react-hooks";
import { Link } from "react-router-dom";
import { colourVars, facet, facetsOf } from "../model/lens";
import { FACET_FIELD, FACET_KINDS, type Facet, type FacetKind, type Tags } from "../model/types";
import { useAppPath } from "./base";
import { Icon } from "./Icon";

/** Small tag that opens the reader with this facet selected. */
export function FacetTag({ kind, id }: { kind: FacetKind; id: string }) {
    const appPath = useAppPath();
    const intl = useIntl();
    const f = facet(kind, id);
    if (!f) return null;
    return (
        <Link
            className="tag"
            data-kind={kind}
            style={colourVars(f.colour)}
            to={appPath(`?${kind}=${id}`)}
            title={intl.formatMessage({ id: "tags.show-in-text" })}
        >
            <Icon name={f.icon} />
            {f.label}
        </Link>
    );
}

/** All facet tags of an item. */
export function FacetTags({ tags }: { tags: Tags }) {
    return (
        <div className="facet-tags">
            {FACET_KINDS.flatMap((kind) =>
                tags[FACET_FIELD[kind]].map((id) => (
                    <FacetTag key={`${kind}:${id}`} kind={kind} id={id} />
                ))
            )}
        </div>
    );
}

/** Props and content of a chip: a badge whose shape and colour encode the facet. */
export function chip(kind: FacetKind, f: Facet) {
    return {
        "className": "chip",
        "data-kind": kind,
        "style": colourVars(f.colour),
        "children": (
            <>
                <Icon name={f.icon} />
                <span className="chip-text">{f.label}</span>
            </>
        )
    };
}

const PAGE: Partial<Record<FacetKind, string>> = { role: "/for", topic: "/topics" };

/** Chips linking to the pages of the other perspectives or topics. */
export function OtherFacets({ kind, current }: { kind: "role" | "topic"; current: string }) {
    const appPath = useAppPath();
    return facetsOf(kind)
        .filter((f) => f.id !== current)
        .map((f) => <Link key={f.id} to={appPath(`${PAGE[kind]}/${f.id}`)} {...chip(kind, f)} />);
}
