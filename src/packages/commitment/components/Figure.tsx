import { useIntl } from "open-pioneer:react-hooks";
import type { Figure as FigureKind } from "../model/types";

// Placeholder figures of the mock-up (mockup/app.js, figure()). The labels inside the drawings are
// part of the placeholder images; captions and descriptions come from i18n.
const FONT = "Arial";

function Licence() {
    const steps: [string, string][] = [
        ["© reserved", "#C53030"],
        ["CC BY-NC-ND", "#DD6B20"],
        ["CC BY-NC", "#D69E2E"],
        ["CC BY-SA", "#38A169"],
        ["CC BY", "#2F855A"],
        ["CC0", "#05668D"]
    ];
    const w = 100;
    return (
        <>
            <text x="20" y="28" fontSize="13" fill="#4a5568" fontFamily={FONT}>
                Less reuse
            </text>
            <text x="620" y="28" fontSize="13" fill="#4a5568" textAnchor="end" fontFamily={FONT}>
                More reuse
            </text>
            <defs>
                <marker
                    id="cv-arr"
                    markerWidth="10"
                    markerHeight="10"
                    refX="8"
                    refY="5"
                    orient="auto"
                >
                    <path d="M0,0 L10,5 L0,10z" fill="#a0aec0" />
                </marker>
            </defs>
            <line
                x1="100"
                y1="24"
                x2="540"
                y2="24"
                stroke="#a0aec0"
                strokeWidth="2"
                markerEnd="url(#cv-arr)"
            />
            {steps.map(([label, colour], i) => (
                <g key={label}>
                    <rect x={20 + i * (w + 2)} y="50" width={w} height="56" fill={colour} />
                    <text
                        x={20 + i * (w + 2) + w / 2}
                        y="83"
                        fontSize="12"
                        fill="#fff"
                        textAnchor="middle"
                        fontFamily={FONT}
                        fontWeight="700"
                    >
                        {label}
                    </text>
                </g>
            ))}
            <rect
                x="428"
                y="116"
                width="202"
                height="30"
                fill="none"
                stroke="#05668D"
                strokeDasharray="4 3"
            />
            <text
                x="529"
                y="136"
                fontSize="12"
                fill="#05668D"
                textAnchor="middle"
                fontFamily={FONT}
                fontWeight="700"
            >
                recommended for data
            </text>
        </>
    );
}

function Openness() {
    const steps = ["Closed", "Restricted", "Embargoed", "Open with conditions", "Open"];
    return (
        <>
            <defs>
                <linearGradient id="cv-og" x1="0" x2="1">
                    <stop offset="0" stopColor="#cbd5e0" />
                    <stop offset="1" stopColor="#05668D" />
                </linearGradient>
            </defs>
            <rect x="20" y="40" width="600" height="40" fill="url(#cv-og)" />
            {steps.map((s, i) => (
                <g key={s}>
                    <line
                        x1={20 + i * 150}
                        y1="36"
                        x2={20 + i * 150}
                        y2="84"
                        stroke="#fff"
                        strokeWidth="2"
                    />
                    <text
                        x={20 + i * 150}
                        y="104"
                        fontSize="12"
                        textAnchor={i === 0 ? "start" : i === steps.length - 1 ? "end" : "middle"}
                        fontFamily={FONT}
                        fill="#2d3748"
                    >
                        {s}
                    </text>
                </g>
            ))}
            <text
                x="320"
                y="128"
                fontSize="13"
                textAnchor="middle"
                fontFamily={FONT}
                fill="#05668D"
                fontWeight="700"
            >
                “As open as possible, as closed as necessary”
            </text>
        </>
    );
}

function Fair() {
    const rows: [string, string, number][] = [
        ["F", "Findable", 90],
        ["A", "Accessible", 85],
        ["I", "Interoperable", 45],
        ["R", "Reusable", 55]
    ];
    return (
        <>
            {rows.map(([letter, name, v], i) => (
                <g key={letter}>
                    <text
                        x="20"
                        y={38 + i * 36}
                        fontSize="20"
                        fontWeight="700"
                        fill="#05668D"
                        fontFamily={FONT}
                    >
                        {letter}
                    </text>
                    <text x="48" y={38 + i * 36} fontSize="13" fill="#4a5568" fontFamily={FONT}>
                        {name}
                    </text>
                    <rect x="160" y={22 + i * 36} width="440" height="20" fill="#e2e8f0" />
                    <rect x="160" y={22 + i * 36} width={4.4 * v} height="20" fill="#22C0D2" />
                </g>
            ))}
        </>
    );
}

const DRAWINGS: Record<FigureKind, [() => React.ReactElement, number]> = {
    licence: [Licence, 170],
    openness: [Openness, 140],
    fair: [Fair, 170]
};

export function Figure({ kind }: { kind: FigureKind }) {
    const intl = useIntl();
    const [Drawing, height] = DRAWINGS[kind];
    return (
        <figure>
            <svg
                viewBox={`0 0 640 ${height}`}
                role="img"
                aria-label={intl.formatMessage({ id: `figure.${kind}.alt` })}
            >
                <Drawing />
            </svg>
            <figcaption>{intl.formatMessage({ id: `figure.${kind}.caption` })}</figcaption>
        </figure>
    );
}
