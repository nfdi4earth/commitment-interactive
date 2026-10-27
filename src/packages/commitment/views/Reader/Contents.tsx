import { useIntl } from "open-pioneer:react-hooks";
import { Link } from "react-router-dom";
import { useAppPath } from "../../components/base";
import { content } from "../../model/content";
import { boxTitle, lensActive, statementHit, statementsIn, type Lens } from "../../model/lens";

interface Props {
    lens: Lens;
    current: number | null;
    onJump(anchor: string, pulse: boolean): void;
}

/** Contents menu, synced with the scroll position (current) and the lens (hit/dim). */
export function Contents({ lens, current, onJump }: Props) {
    const intl = useIntl();
    const appPath = useAppPath();
    const on = lensActive(lens);
    const jump = (anchor: string, pulse: boolean) => (e: React.MouseEvent) => {
        e.preventDefault();
        onJump(anchor, pulse);
    };
    return (
        <nav className="toc" aria-label={intl.formatMessage({ id: "contents.title" })}>
            <div className="toc-head">{intl.formatMessage({ id: "contents.title" })}</div>
            <ul>
                <li>
                    <Link
                        className="toc-top"
                        to={appPath("?focus=preamble")}
                        onClick={jump("preamble", false)}
                    >
                        {intl.formatMessage({ id: "contents.preamble" })}
                    </Link>
                </li>
                {content.boxes.map((b) => (
                    <li key={b.id}>
                        <Link
                            className="toc-box"
                            to={appPath(`?focus=${b.id}`)}
                            onClick={jump(b.id, false)}
                        >
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
                                            to={appPath(`?focus=c${s.n}`)}
                                            aria-current={current === s.n ? "location" : undefined}
                                            onClick={jump(`c${s.n}`, true)}
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
