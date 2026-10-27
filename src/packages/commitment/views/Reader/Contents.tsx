import { useIntl } from "open-pioneer:react-hooks";
import { Link } from "react-router-dom";
import { useAppPath, useQueryState, withQuery } from "../../components/base";
import { content } from "../../model/content";
import { boxTitle, lensActive, statementHit, statementsIn, type Lens } from "../../model/lens";

interface Props {
    lens: Lens;
    current: number | null;
    /** Called when an entry is chosen (closes the menu on small screens). */
    onNavigate(): void;
}

/** Contents menu, synced with the scroll position (current) and the lens (hit/dim). */
export function Contents({ lens, current, onNavigate }: Props) {
    const intl = useIntl();
    const appPath = useAppPath();
    const on = lensActive(lens);
    const { query } = useQueryState();
    // keeps the lens; replaces what is open with the passage to scroll to (a link, so it scrolls)
    const to = (anchor: string) =>
        appPath(`?${withQuery(query, { focus: anchor, statement: null })}`);
    return (
        <nav className="toc" aria-label={intl.formatMessage({ id: "contents.title" })}>
            <div className="toc-head">{intl.formatMessage({ id: "contents.title" })}</div>
            <ul>
                <li>
                    <Link className="toc-top" to={to("preamble")} replace onClick={onNavigate}>
                        {intl.formatMessage({ id: "contents.preamble" })}
                    </Link>
                </li>
                {content.boxes.map((b) => (
                    <li key={b.id}>
                        <Link className="toc-box" to={to(b.id)} replace onClick={onNavigate}>
                            {boxTitle(b)}
                        </Link>
                        <ul>
                            {statementsIn(b).map((s) => {
                                const hit = statementHit(s, lens);
                                const cls = [
                                    "mm-item",
                                    on && (hit ? "hit" : "dim"),
                                    current === s.n && "current"
                                ].filter(Boolean);
                                return (
                                    <li key={s.n}>
                                        <Link
                                            className={cls.join(" ")}
                                            to={to(`c${s.n}`)}
                                            replace
                                            aria-current={current === s.n ? "location" : undefined}
                                            onClick={onNavigate}
                                        >
                                            <span className="mm-n">{s.n}</span>
                                            <span className="mm-label">{s.short}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
