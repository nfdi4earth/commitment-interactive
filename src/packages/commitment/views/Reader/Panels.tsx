import { CloseButton, Drawer, Portal } from "@chakra-ui/react";
import { useIntl } from "open-pioneer:react-hooks";
import { Link } from "react-router-dom";
import { Scoped, useAppPath } from "../../components/base";
import { CopyLink } from "../../components/CopyLink";
import { FacetTags } from "../../components/FacetBadge";
import { Figure } from "../../components/Figure";
import { Icon } from "../../components/Icon";
import { Markdown } from "../../components/Markdown";
import { content } from "../../model/content";
import { LinkList } from "../../components/LinkList";
import { boxOf, boxTitle, colourVars, statementOf } from "../../model/lens";
import type { Panel } from "./context";

function StatementTags({ numbers }: { numbers: number[] }) {
    const intl = useIntl();
    const appPath = useAppPath();
    return (
        <div className="facet-tags">
            <span className="lens-label">{intl.formatMessage({ id: "panel.related" })}</span>
            {numbers.map((n) => (
                <Link key={n} className="tag" data-kind="stmt" to={appPath(`?focus=c${n}`)}>
                    {n} · {content.statements[n - 1]?.short}
                </Link>
            ))}
        </div>
    );
}

function AnnotationPanel({ id }: { id: string }) {
    const intl = useIntl();
    const appPath = useAppPath();
    const a = content.annotations[id];
    if (!a) return null;
    const statement = statementOf(a.target);
    const box = content.boxes.find((b) => b.id === a.target);
    const dd = a.deepdive ? content.deepdives[a.deepdive] : undefined;
    const related = a.statements ?? dd?.statements ?? (statement ? [statement.n] : []);
    return (
        <>
            <div className="kicker">
                {intl.formatMessage(
                    { id: "panel.deepdive-kicker" },
                    { where: statement ? "statement" : box ? "heading" : "other", n: statement?.n }
                )}
            </div>
            <Drawer.Title asChild>
                <h3>{a.title}</h3>
            </Drawer.Title>
            {statement && (
                <div className="quote">
                    <Markdown inline text={statement.text} />
                </div>
            )}
            {box && (
                <div className="quote">
                    <b>
                        <Markdown inline text={box.title} />
                    </b>
                </div>
            )}
            <FacetTags tags={a} />
            {a.figure && <Figure kind={a.figure} />}
            <Markdown text={a.body} />
            <LinkList links={a.links} />
            {related.length > 0 && <StatementTags numbers={related} />}
            <div className="pop-actions">
                <CopyLink anchor={id} label={intl.formatMessage({ id: "copy.link" })} />
                {dd && (
                    <Link className="btn-solid" to={appPath(`/deep-dive/${dd.id}`)}>
                        {intl.formatMessage({ id: "panel.open-deepdive" })}
                    </Link>
                )}
            </div>
        </>
    );
}

function StatementPanel({ n }: { n: number }) {
    const intl = useIntl();
    const appPath = useAppPath();
    const s = content.statements[n - 1];
    if (!s) return null;
    const withNote = content.roles.filter((r) => r.notes[n]);
    const without = content.roles.filter((r) => !r.notes[n]);
    return (
        <>
            <div className="kicker">
                {intl.formatMessage(
                    { id: "panel.statement-kicker" },
                    { n, box: boxTitle(boxOf(n)) }
                )}
            </div>
            <Drawer.Title asChild>
                <h3>{s.short}</h3>
            </Drawer.Title>
            <div className="quote">
                <Markdown inline text={s.text} />
            </div>
            <FacetTags tags={s} />
            <p>
                <b>{intl.formatMessage({ id: "panel.means-for" })}</b>{" "}
                <span className="mock-badge">{intl.formatMessage({ id: "example-badge" })}</span>
            </p>
            {withNote.map((r) => (
                <div key={r.id} className="persp" style={colourVars(r.colour)}>
                    <h5>
                        <Icon name={r.icon} />
                        {r.label}
                    </h5>
                    <Markdown text={r.notes[n]?.note ?? ""} />
                    <p>
                        <Link to={appPath(`/for/${r.id}`)}>
                            {intl.formatMessage(
                                { id: "panel.more-for" },
                                { plural: r.plural.toLowerCase() }
                            )}
                        </Link>
                    </p>
                </div>
            ))}
            {without.length > 0 && (
                <p className="persp-rest">
                    {intl.formatMessage(
                        { id: "panel.less-relevant" },
                        { names: intl.formatList(without.map((r) => r.plural.toLowerCase())) }
                    )}
                </p>
            )}
            <div className="pop-actions">
                <CopyLink anchor={`c${n}`} label={intl.formatMessage({ id: "copy.statement" })} />
            </div>
        </>
    );
}

/** Side panel for deep-dive annotations and statements; a bottom sheet on small screens. */
export function SidePanel({ panel, onClose }: { panel: Panel | null; onClose(): void }) {
    const intl = useIntl();
    return (
        <Drawer.Root
            open={panel !== null}
            onOpenChange={(e) => !e.open && onClose()}
            placement={{ base: "bottom", custombreak: "end" }}
            size="md"
        >
            <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content
                        maxH={{ base: "80vh", custombreak: "100vh" }}
                        maxW={{ base: "100vw", custombreak: "460px" }}
                        borderRadius="0"
                    >
                        <Drawer.CloseTrigger asChild position="absolute" top="10px" right="12px">
                            <CloseButton aria-label={intl.formatMessage({ id: "panel.close" })} />
                        </Drawer.CloseTrigger>
                        <Drawer.Body
                            padding={{ base: "22px 18px 40px", custombreak: "28px 28px 40px" }}
                        >
                            <Scoped>
                                <div className="panel">
                                    {panel?.kind === "annotation" && (
                                        <AnnotationPanel id={panel.id} />
                                    )}
                                    {panel?.kind === "statement" && <StatementPanel n={panel.n} />}
                                </div>
                            </Scoped>
                        </Drawer.Body>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    );
}
