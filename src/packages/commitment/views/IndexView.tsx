import { useIntl } from "open-pioneer:react-hooks";
import { Link } from "react-router-dom";
import { useAppPath } from "../components/base";
import { Icon } from "../components/Icon";
import { Page } from "../components/Page";
import { content } from "../model/content";
import { deepDiveFor, facetsOf } from "../model/lens";
import { FACET_FIELD, type Facet, type FacetKind, type Role, type Topic } from "../model/types";

const PATH: Record<FacetKind, (f: Facet) => string> = {
    role: (f) => `/for/${f.id}`,
    topic: (f) => `/topics/${f.id}`,
    concept: (f) => {
        const dd = deepDiveFor(f.id);
        return dd ? `/deep-dive/${dd.id}` : `?concept=${f.id}`;
    }
};

/** "Explore by perspective / topic / concept": one tile per facet. */
export default function IndexView({ kind }: { kind: FacetKind }) {
    const intl = useIntl();
    const appPath = useAppPath();
    const extra = (f: Facet) => {
        if (kind === "role") return (f as Role).blurb;
        if (kind === "topic")
            return intl.formatMessage({ id: "index.known-from" }, { what: (f as Topic).knownFrom });
        return intl.formatMessage({ id: deepDiveFor(f.id) ? "index.deepdive" : "index.highlight" });
    };
    return (
        <Page
            back={{ to: "", label: intl.formatMessage({ id: "back-to.commitment" }) }}
            title={intl.formatMessage({ id: `index.${kind}.title` })}
            badge={intl.formatMessage({ id: "mock-short" })}
        >
            <p className="page-sub">{intl.formatMessage({ id: `index.${kind}.sub` })}</p>
            <div className="tiles">
                {facetsOf(kind).map((f) => {
                    const n = content.statements.filter((s) =>
                        s[FACET_FIELD[kind]].includes(f.id)
                    ).length;
                    return (
                        <Link key={f.id} className="tile" to={appPath(PATH[kind](f))}>
                            <div className="tile-icon" style={{ color: f.colour }}>
                                <Icon name={f.icon} />
                            </div>
                            <div className="tile-type">
                                {intl.formatMessage({ id: "index.statements" }, { n })}
                            </div>
                            <div className="tile-title">{f.label}</div>
                            <p className="tile-text">{extra(f)}</p>
                        </Link>
                    );
                })}
            </div>
        </Page>
    );
}
