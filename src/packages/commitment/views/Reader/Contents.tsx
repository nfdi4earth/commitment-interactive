import { useIntl } from "open-pioneer:react-hooks";
import { useAppPath } from "../../components/base";
import { content } from "../../model/content";
import { lensActive, statementHit, type Lens } from "../../model/lens";
import { plainText } from "../../model/parse";

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
                    <a
                        className="toc-top"
                        href={appPath("?focus=preamble")}
                        onClick={jump("preamble", false)}
                    >
                        {intl.formatMessage({ id: "contents.preamble" })}
                    </a>
                </li>
                {content.boxes.map((b) => (
                    <li key={b.id}>
                        <a
                            className="toc-box"
                            href={appPath(`?focus=${b.id}`)}
                            onClick={jump(b.id, false)}
                        >
                            {plainText(b.title).replace(/\.$/, "")}
                        </a>
                        <ul>
                            {content.statements
                                .filter((s) => s.n >= b.from && s.n <= b.to)
                                .map((s) => {
                                    const hit = statementHit(s, lens);
                                    const cls = [
                                        "mm-item",
                                        on && (hit ? "hit" : "dim"),
                                        current === s.n && "current"
                                    ].filter(Boolean);
                                    return (
                                        <li key={s.n}>
                                            <a
                                                className={cls.join(" ")}
                                                href={appPath(`?focus=c${s.n}`)}
                                                aria-current={
                                                    current === s.n ? "location" : undefined
                                                }
                                                onClick={jump(`c${s.n}`, true)}
                                            >
                                                <span className="mm-n">{s.n}</span>
                                                <span className="mm-label">{s.short}</span>
                                            </a>
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
