import { useIntl } from "open-pioneer:react-hooks";
import { forwardRef } from "react";
import { chip } from "../../components/FacetBadge";
import { PageContainer } from "../../components/Page";
import { content } from "../../model/content";
import { facet, facetsOf, lensActive, statementHit, type Lens } from "../../model/lens";
import { FACET_KINDS, type FacetKind } from "../../model/types";

interface Props {
    lens: Lens;
    onToggle(kind: FacetKind, id: string): void;
    onClear(): void;
}

/** Sticky bar with one row of toggle badges per facet kind. */
export const LensBar = forwardRef<HTMLDivElement, Props>(function LensBar(
    { lens, onToggle, onClear },
    ref
) {
    const intl = useIntl();
    const on = lensActive(lens);
    const hits = content.statements.filter((s) => statementHit(s, lens)).length;
    const names = FACET_KINDS.flatMap((k) => facet(k, lens[k])?.label ?? []);
    return (
        <div className="lensbar" ref={ref}>
            <PageContainer>
                <div className="lens-status" aria-live="polite">
                    <span>
                        {on
                            ? intl.formatRichMessage(
                                  { id: "lens.count" },
                                  {
                                      hits,
                                      total: content.statements.length,
                                      names: names.join(" + ")
                                  }
                              )
                            : intl.formatMessage({ id: "lens.hint" })}
                    </span>
                    {on && (
                        <button type="button" onClick={onClear}>
                            {intl.formatMessage({ id: "lens.clear" })}
                        </button>
                    )}
                </div>
                {FACET_KINDS.map((kind) => (
                    <div
                        key={kind}
                        className="lens-group"
                        role="group"
                        aria-label={intl.formatMessage({ id: `lens.${kind}` })}
                    >
                        <span className="lens-label">
                            {intl.formatMessage({ id: `lens.${kind}` })}
                        </span>
                        <div className="lens-chips">
                            {facetsOf(kind).map((f) => (
                                <button
                                    key={f.id}
                                    type="button"
                                    aria-pressed={lens[kind] === f.id}
                                    onClick={() => onToggle(kind, f.id)}
                                    {...chip(kind, f)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </PageContainer>
        </div>
    );
});
