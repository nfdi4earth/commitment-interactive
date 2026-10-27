import { Container } from "@chakra-ui/react";
import { useIntl } from "open-pioneer:react-hooks";
import { forwardRef } from "react";
import { Icon } from "../../components/Icon";
import { content } from "../../model/content";
import { colourVars, facet, facetsOf, lensActive, statementHit, type Lens } from "../../model/lens";
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
            <Container maxW={{ base: "100%", custombreak: "80%" }}>
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
                                    className="chip"
                                    data-kind={kind}
                                    style={colourVars(f.colour)}
                                    aria-pressed={lens[kind] === f.id}
                                    onClick={() => onToggle(kind, f.id)}
                                >
                                    <Icon name={f.icon} />
                                    <span className="chip-text">{f.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </Container>
        </div>
    );
});
