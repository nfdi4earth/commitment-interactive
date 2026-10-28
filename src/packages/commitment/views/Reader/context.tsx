import { createContext, useContext } from "react";
import type { Lens } from "../../model/lens";

export type Panel = { kind: "annotation"; id: string } | { kind: "statement"; n: number };

export interface ReaderState {
    lens: Lens;
    /** Annotation whose note or explainer is open (from `?focus=`). */
    openId: string | null;
    /** `?focus=`, also while the page still scrolls to it. */
    focusId: string | null;
    /** Opens an annotation: note or explainer in place, deep dive in the side panel. */
    open(id: string): void;
    /** Closes whatever is open. */
    close(): void;
    /** Ref callback that makes an element a scroll target for `?focus=<id>` and the contents menu. */
    anchor(id: string): (el: HTMLElement | null) => void;
}

export const ReaderContext = createContext<ReaderState | null>(null);

export function useReader(): ReaderState {
    const state = useContext(ReaderContext);
    if (!state) throw new Error("useReader() must be used inside the reader view");
    return state;
}
