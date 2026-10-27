import { ICON_PATHS } from "./icons";

/** One of the icons in icons.ts. The paths are constants of this package, not content. */
export function Icon({ name, size }: { name: string; size?: number }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] ?? "" }}
        />
    );
}
