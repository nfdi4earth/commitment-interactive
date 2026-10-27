import {
    Controls,
    Handle,
    Position,
    ReactFlow,
    type Edge,
    type Node,
    type NodeProps
} from "@xyflow/react";
import { useIntl } from "open-pioneer:react-hooks";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppPath } from "../components/base";
import { Page } from "../components/Page";
import { content } from "../model/content";
import { ink } from "../model/lens";

// Overview map: perspectives and topics (left) → statements (middle) → concepts (right).
// Same layout as the mock-up's SVG map; @xyflow/react adds zoom, pan and fit.
type Kind = "role" | "topic" | "stmt" | "concept";
type MapNodeData = {
    kind: Kind;
    label: string;
    colour: string;
    onEnter(): void;
    onLeave(): void;
    onOpen(): void;
};
type MapNode = Node<MapNodeData, "item">;
type LabelNode = Node<{ label: string }, "label">;

const H = 32;
const COLUMNS = { left: { x: 30, w: 210 }, middle: { x: 440, w: 230 }, right: { x: 870, w: 200 } };

function ItemNode({ data }: NodeProps<MapNode>) {
    const style =
        data.kind === "stmt"
            ? { background: "#fff", color: "#05668D", borderColor: data.colour }
            : { background: data.colour, color: ink(data.colour), borderColor: data.colour };
    return (
        <>
            <Handle type="target" position={Position.Left} isConnectable={false} />
            <button
                type="button"
                className="mnode"
                data-kind={data.kind}
                style={style}
                onMouseEnter={data.onEnter}
                onMouseLeave={data.onLeave}
                onFocus={data.onEnter}
                onBlur={data.onLeave}
                onClick={data.onOpen}
            >
                {data.label}
            </button>
            <Handle type="source" position={Position.Right} isConnectable={false} />
        </>
    );
}
function ColumnLabel({ data }: NodeProps<LabelNode>) {
    return <div className="map-col-label">{data.label}</div>;
}
const NODE_TYPES = { item: ItemNode, label: ColumnLabel };

export default function MapView() {
    const intl = useIntl();
    const appPath = useAppPath();
    const navigate = useNavigate();
    const [hovered, setHovered] = useState<string | null>(null);
    // on touch screens, the first tap only shows the connections
    const [selected, setSelected] = useState<string | null>(null);
    const focus = hovered ?? selected;

    const { nodes, edges } = useMemo(() => {
        const open = (id: string) => {
            const [k, v] = id.split(":");
            navigate(appPath(k === "s" ? `?focus=c${v}` : `?${k}=${v}`));
        };
        const canHover = window.matchMedia?.("(hover: hover)").matches ?? true;
        const item = (
            id: string,
            kind: Kind,
            label: string,
            colour: string,
            x: number,
            y: number,
            w: number
        ): MapNode => ({
            id,
            type: "item",
            position: { x, y },
            width: w,
            height: H,
            draggable: false,
            selectable: false,
            // xyflow disables pointer events on nodes without its own handlers; ours are on the button
            style: { pointerEvents: "all" },
            data: {
                kind,
                label,
                colour,
                onEnter: () => setHovered(id),
                onLeave: () => setHovered(null),
                onOpen: () => {
                    if (canHover || selected === id) open(id);
                    else setSelected(id);
                }
            }
        });
        const label = (id: string, text: string, x: number, y: number): LabelNode => ({
            id,
            type: "label",
            position: { x, y },
            draggable: false,
            selectable: false,
            focusable: false,
            data: { label: text }
        });
        const { left: L, middle: M, right: R } = COLUMNS;
        const roleRows = content.roles.length;
        const nodes: (MapNode | LabelNode)[] = [
            label("l:roles", intl.formatMessage({ id: "map.roles" }), L.x, 8),
            label(
                "l:topics",
                intl.formatMessage({ id: "map.topics" }),
                L.x,
                50 + roleRows * 47 - 6
            ),
            label("l:statements", intl.formatMessage({ id: "map.statements" }), M.x, 8),
            label("l:concepts", intl.formatMessage({ id: "map.concepts" }), R.x, 78),
            ...content.roles.map((r, i) =>
                item(`role:${r.id}`, "role", r.label, r.colour, L.x, 50 + i * 47, L.w)
            ),
            ...content.topics.map((t, i) =>
                item(
                    `topic:${t.id}`,
                    "topic",
                    t.label,
                    t.colour,
                    L.x,
                    50 + (roleRows + i) * 47 + 20,
                    L.w
                )
            ),
            ...content.statements.map((s, i) =>
                item(
                    `s:${s.n}`,
                    "stmt",
                    `${s.n} · ${s.short}`,
                    "#05668D",
                    M.x,
                    50 + i * 52 + (s.box === "boxA" ? 0 : 16),
                    M.w
                )
            ),
            ...content.concepts.map((c, i) =>
                item(`concept:${c.id}`, "concept", c.label, c.colour, R.x, 120 + i * 80, R.w)
            )
        ];
        const colourOf = new Map(
            nodes.flatMap((n) => (n.type === "item" ? [[n.id, n.data.colour]] : []))
        );
        const edges: Edge[] = content.statements
            .flatMap((s) => [
                ...s.roles.map((r) => [`role:${r}`, `s:${s.n}`, `role:${r}`]),
                ...s.topics.map((t) => [`topic:${t}`, `s:${s.n}`, `topic:${t}`]),
                ...s.concepts.map((c) => [`s:${s.n}`, `concept:${c}`, `concept:${c}`])
            ])
            .map(([source = "", target = "", colourFrom = ""]) => ({
                id: `${source}>${target}`,
                source,
                target,
                selectable: false,
                focusable: false,
                style: { stroke: colourOf.get(colourFrom) }
            }));
        return { nodes, edges };
    }, [intl, navigate, appPath, selected]);

    // highlight the connections of the hovered or selected node; perspectives and topics also
    // follow their statements on to the concepts
    const view = useMemo(() => {
        if (!focus) return { nodes, edges };
        const direct = edges.filter((e) => e.source === focus || e.target === focus);
        const hop = /^(role|topic):/.test(focus)
            ? new Set(direct.map((e) => e.target))
            : new Set<string>();
        const on = new Set(
            edges
                .filter(
                    (e) =>
                        direct.includes(e) || (hop.has(e.source) && e.target.startsWith("concept:"))
                )
                .map((e) => e.id)
        );
        const connected = new Set([
            focus,
            ...edges.filter((e) => on.has(e.id)).flatMap((e) => [e.source, e.target])
        ]);
        return {
            nodes: nodes.map((n) =>
                n.type === "item" && !connected.has(n.id) ? { ...n, className: "off" } : n
            ),
            edges: edges.map((e) => ({ ...e, className: on.has(e.id) ? "on" : "off" }))
        };
    }, [focus, nodes, edges]);

    return (
        <Page
            back={{ to: "", label: intl.formatMessage({ id: "back-to.commitment" }) }}
            title={intl.formatMessage({ id: "map.title" })}
            badge={intl.formatMessage({ id: "mock-short" })}
        >
            <p className="map-help">{intl.formatMessage({ id: "map.help" })}</p>
            <div className={`map-wrap${focus ? " map-focus" : ""}`}>
                <ReactFlow
                    nodes={view.nodes}
                    edges={view.edges}
                    nodeTypes={NODE_TYPES}
                    fitView
                    minZoom={0.3}
                    maxZoom={3}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    nodesFocusable={false}
                    edgesFocusable={false}
                    elementsSelectable={false}
                    onPaneClick={() => setSelected(null)}
                    proOptions={{ hideAttribution: true }}
                >
                    <Controls showInteractive={false} />
                </ReactFlow>
            </div>
        </Page>
    );
}
