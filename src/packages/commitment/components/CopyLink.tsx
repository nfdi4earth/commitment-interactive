import { useClipboard } from "@chakra-ui/react";
import { useIntl } from "open-pioneer:react-hooks";
import { useHref } from "react-router-dom";
import { useAppPath } from "./base";
import { Icon } from "./Icon";

/** Copies a link to `?focus=<anchor>` and confirms it in the button itself. */
export function CopyLink({ anchor, label }: { anchor: string; label: string }) {
    const intl = useIntl();
    const appPath = useAppPath();
    // useHref adds the router's basename, if the host has one
    const url = new URL(useHref(appPath(`?focus=${anchor}`)), window.location.href).href;
    const clipboard = useClipboard({ value: url, timeout: 2500 });
    return (
        <button type="button" className="btn-outline" title={url} onClick={clipboard.copy}>
            <Icon name="link" size={14} />
            <span aria-live="polite">
                {clipboard.copied ? intl.formatMessage({ id: "copy.done" }) : label}
            </span>
        </button>
    );
}
