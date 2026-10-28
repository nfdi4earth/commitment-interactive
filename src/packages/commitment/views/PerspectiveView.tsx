import { useIntl } from "open-pioneer:react-hooks";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAppPath, useQueryState } from "../components/base";
import { OtherFacets } from "../components/FacetBadge";
import { Icon } from "../components/Icon";
import { Markdown } from "../components/Markdown";
import { Page } from "../components/Page";
import { content } from "../model/content";
import { colourVars } from "../model/lens";

/** "The Commitment for students": one card per relevant statement with a first step. */
export default function PerspectiveView() {
    const intl = useIntl();
    const appPath = useAppPath();
    const { id } = useParams();
    const role = content.roles.find((r) => r.id === id);
    // ticked first steps, in the URL (`?done=1,8`), so that they survive a reload or a shared link
    const { query, set: setQuery } = useQueryState();
    const done = new Set((query.get("done") ?? "").split(",").filter(Boolean).map(Number));
    if (!role) return <Navigate to={appPath("/for")} replace />;

    const numbers = Object.keys(role.notes).map(Number);
    const toggle = (n: number) => {
        const next = new Set(done);
        if (!next.delete(n)) next.add(n);
        setQuery({ done: next.size ? [...next].sort((x, y) => x - y).join(",") : null });
    };
    const count = numbers.filter((n) => done.has(n)).length;
    const progress = intl.formatMessage({ id: "perspective.progress" });
    const steps = intl.formatMessage(
        { id: "perspective.steps" },
        { done: count, total: numbers.length }
    );

    return (
        <Page back={{ to: "/for", label: intl.formatMessage({ id: "back-to.perspectives" }) }}>
            <div className="role-hero" style={colourVars(role.colour)}>
                <div className="role-icon">
                    <Icon name={role.icon} />
                </div>
                <div>
                    <h1>
                        {intl.formatMessage({ id: "perspective.title" }, { plural: role.plural })}{" "}
                        <span className="mock-badge">
                            {intl.formatMessage({ id: "example-badge" })}
                        </span>
                    </h1>
                    <p>{role.blurb}</p>
                </div>
            </div>
            <p>
                <b>{progress}</b>{" "}
                <span className="progress-label" aria-live="polite">
                    {steps}
                </span>
            </p>
            <div
                className="progress"
                style={colourVars(role.colour)}
                role="progressbar"
                aria-label={progress}
                aria-valuetext={steps}
                aria-valuemin={0}
                aria-valuemax={numbers.length}
                aria-valuenow={count}
            >
                <div style={{ width: `${(100 * count) / (numbers.length || 1)}%` }} />
            </div>
            <div className="cards">
                {numbers.map((n) => {
                    const s = content.statements[n - 1];
                    const note = role.notes[n];
                    if (!s || !note) return null;
                    return (
                        <div key={n} className="card" style={colourVars(role.colour)}>
                            <div className="card-n">
                                {intl.formatMessage({ id: "statement.n" }, { n })}
                            </div>
                            <h3>{s.short}</h3>
                            <div className="md">
                                <Markdown text={note.note} />
                            </div>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={done.has(n)}
                                    onChange={() => toggle(n)}
                                />{" "}
                                {note.step}
                            </label>
                            <div className="card-foot">
                                <Link to={appPath(`?role=${role.id}&focus=c${n}`)}>
                                    {intl.formatMessage({ id: "show-in-text" })}
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="other-roles">
                <span className="lens-label">
                    {intl.formatMessage({ id: "perspective.others" })}
                </span>
                <OtherFacets kind="role" current={role.id} />
            </div>
            <p className="page-cta">
                <Link className="btn-solid" to={appPath(`?role=${role.id}`)}>
                    {intl.formatMessage(
                        { id: "perspective.read-as" },
                        { label: role.label.toLowerCase() }
                    )}
                </Link>
            </p>
        </Page>
    );
}
