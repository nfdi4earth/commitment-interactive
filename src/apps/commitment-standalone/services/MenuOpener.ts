import { emit, emitter, EventEmitter } from "@conterra/reactivity-events";

export interface MenuOpenerEvents {
    "open-menu": boolean;
}

export class MenuHandler {
    declare [DECLARE_SERVICE_INTERFACE]: "onestop4all.MenuHandler";

    readonly emitter: EventEmitter<boolean> = emitter<boolean>();

    open(): void {
        emit(this.emitter, true);
        //this.emit("open-menu", true);
    }
    close(): void {
        emit(this.emitter, false);
    }
}

import "@open-pioneer/runtime";
import { DECLARE_SERVICE_INTERFACE } from "@open-pioneer/runtime";
declare module "@open-pioneer/runtime" {
    interface ServiceRegistry {
        "onestop4all.MenuHandler": MenuHandler;
    }
}
