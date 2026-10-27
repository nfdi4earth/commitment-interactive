import { useIntl } from "open-pioneer:react-hooks";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAppPath } from "../components/base";
import { Figure } from "../components/Figure";
import { Markdown } from "../components/Markdown";
import { Page } from "../components/Page";
import { content } from "../model/content";
import { LinkList } from "../components/LinkList";

// annotation titles that are a quote already keep their own quotation marks
const quoted = (t: string) => (/^[“"‘']/.test(t) ? t : `“${t}”`);

/** Long-form page on a concept, with references back into the Commitment. */
export default function DeepDiveView() {
    const intl = useIntl();
    const appPath = useAppPath();
    const { id } = useParams();
    const dd = id ? content.deepdives[id] : undefined;
    if (!dd) return <Navigate to={appPath("/concepts")} replace />;

    return (
        <Page
            back={{ to: "/concepts", label: intl.formatMessage({ id: "back-to.concepts" }) }}
            title={dd.title}
            badge={intl.formatMessage({ id: "deepdive.badge" })}
        >
            <div className="dd-layout">
                <div className="dd-body">
                    <div className="dd-lead">
                        <Markdown text={dd.lead} />
                    </div>
                    {dd.figure && <Figure kind={dd.figure} />}
                    {dd.sections.map((sec) => (
                        <section key={sec.heading}>
                            <h2>{sec.heading}</h2>
                            <Markdown text={sec.text} />
                        </section>
                    ))}
                    {dd.links.length > 0 && (
                        <>
                            <h2>{intl.formatMessage({ id: "deepdive.further" })}</h2>
                            <LinkList links={dd.links} />
                        </>
                    )}
                </div>
                <aside className="dd-aside">
                    <div className="text-box">
                        <h4>{intl.formatMessage({ id: "deepdive.where" })}</h4>
                        {dd.statements.map((n) => (
                            <Link
                                key={n}
                                className="dd-ref"
                                to={appPath(`?concept=${dd.concept}&focus=c${n}`)}
                            >
                                <b>{n}</b> · {content.statements[n - 1]?.short}
                            </Link>
                        ))}
                        <h4>{intl.formatMessage({ id: "deepdive.phrases" })}</h4>
                        {dd.anchors.map((a) => (
                            <Link
                                key={a}
                                className="dd-ref"
                                to={appPath(`?concept=${dd.concept}&focus=${a}`)}
                            >
                                {quoted(content.annotations[a]?.title ?? a)}
                            </Link>
                        ))}
                        <p className="dd-highlight">
                            <Link className="btn-outline" to={appPath(`?concept=${dd.concept}`)}>
                                {intl.formatMessage({ id: "deepdive.highlight" })}
                            </Link>
                        </p>
                    </div>
                </aside>
            </div>
        </Page>
    );
}
