import { Link } from "react-router-dom";
import { colourVars, facet } from "../model/lens";
import type { FacetKind } from "../model/types";
import { useAppPath } from "./base";
import { Icon } from "./Icon";
import { useIntl } from "open-pioneer:react-hooks";

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
export function FacetTags({
    roles,
    topics,
    concepts
}: {
    roles: string[];
    topics: string[];
    concepts: string[];
}) {
    return (
        <div className="facet-tags">
            {roles.map((id) => (
                <FacetTag key={"r" + id} kind="role" id={id} />
            ))}
            {topics.map((id) => (
                <FacetTag key={"t" + id} kind="topic" id={id} />
            ))}
            {concepts.map((id) => (
                <FacetTag key={"c" + id} kind="concept" id={id} />
            ))}
        </div>
    );
}
