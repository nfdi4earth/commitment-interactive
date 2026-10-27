import { createContext, useContext } from "react";
import type { Lens } from "../../model/lens";

export type Panel = { kind: "annotation"; id: string } | { kind: "statement"; n: number };

export interface ReaderState {
    lens: Lens;
    /** Annotation whose note or explainer is open. */
    openId: string | null;
    setOpenId(id: string | null): void;
    openPanel(panel: Panel): void;
    /** Ref callback that makes an element a scroll target for `?focus=<id>` and the contents menu. */
    anchor(id: string): (el: HTMLElement | null) => void;
}

export const ReaderContext = createContext<ReaderState | null>(null);

export function useReader(): ReaderState {
    const state = useContext(ReaderContext);
    if (!state) throw new Error("useReader() must be used inside the reader view");
    return state;
}
