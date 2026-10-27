import { Container } from "@chakra-ui/react";
import { useIntl } from "open-pioneer:react-hooks";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, useAppPath } from "./base";

function BackIcon() {
    return (
        <svg width="12" height="18" viewBox="0 0 16 24" fill="none" aria-hidden="true">
            <path
                d="M14.4541 22.5L2.99955 12L14.4541 1.5"
                stroke="#05668D"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}

/** "‹ Back to …", as BackTo in OneStop4All. `to` is a path in the app or an external URL. */
export function BackLink({ to, label }: { to: string; label: string }) {
    const intl = useIntl();
    const appPath = useAppPath();
    const content = (
        <>
            <BackIcon />
            <span>
                <b>{intl.formatMessage({ id: "back" })}</b> {label}
            </span>
        </>
    );
    return /^https?:/.test(to) ? (
        <ExternalLink href={to} className="backto">
            {content}
        </ExternalLink>
    ) : (
        <Link className="backto" to={appPath(to)}>
            {content}
        </Link>
    );
}

interface PageProps {
    back: { to: string; label: string };
    /** Page title; omit when the page has its own hero. */
    title?: ReactNode;
    badge?: string;
    children: ReactNode;
}

/** The OneStop4All page container. */
export function PageContainer({ children }: { children: ReactNode }) {
    return <Container maxW={{ base: "100%", custombreak: "80%" }}>{children}</Container>;
}

/** Content page in the OneStop4All container. */
export function Page({ back, title, badge, children }: PageProps) {
    return (
        <PageContainer>
            <BackLink to={back.to} label={back.label} />
            {title && (
                <h1 className="page-title">
                    {title} {badge && <span className="mock-badge">{badge}</span>}
                </h1>
            )}
            {children}
        </PageContainer>
    );
}
