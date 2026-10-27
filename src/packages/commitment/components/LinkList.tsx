import type { Link } from "../model/types";
import { ExternalLink } from "./base";

/** List of external links ("Further reading"). */
export function LinkList({ links }: { links: Link[] }) {
    if (!links.length) return null;
    return (
        <ul className="links">
            {links.map((l) => (
                <li key={l.url}>
                    <ExternalLink href={l.url}>{l.label}</ExternalLink>
                </li>
            ))}
        </ul>
    );
}
