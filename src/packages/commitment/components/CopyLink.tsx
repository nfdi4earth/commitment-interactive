import { useEffect, useState } from "react";
import { useIntl } from "open-pioneer:react-hooks";
import { useAppPath } from "./base";
import { Icon } from "./Icon";

/** Copies a link to `?focus=<anchor>` and confirms it in the button itself. */
export function CopyLink({ anchor, label }: { anchor: string; label: string }) {
    const intl = useIntl();
    const appPath = useAppPath();
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        if (!copied) return;
        const t = setTimeout(() => setCopied(false), 2500);
        return () => clearTimeout(t);
    }, [copied]);
    const url = window.location.origin + appPath(`?focus=${anchor}`);
    return (
        <button
            type="button"
            className="btn-outline"
            title={url}
            onClick={() => navigator.clipboard?.writeText(url).then(() => setCopied(true))}
        >
            <Icon name="link" size={14} />
            <span aria-live="polite">
                {copied ? intl.formatMessage({ id: "copy.done" }) : label}
            </span>
        </button>
    );
}
