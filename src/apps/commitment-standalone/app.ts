import { createCustomElement } from "@open-pioneer/runtime";
import * as appMetadata from "open-pioneer:app";
import { config as themeConfig } from "@os4a/theme";
import { AppUI } from "@os4a/AppUI";

const Element = createCustomElement({
    component: AppUI,
    chakraSystemConfig: themeConfig,
    appMetadata,
    async resolveConfig(ctx) {
        const locale = ctx.getAttribute("forced-locale");
        if (!locale) {
            return undefined;
        }
        return { locale };
    },
    advanced: { enableShadowRoot: true }
});

customElements.define("commitment-app", Element);
