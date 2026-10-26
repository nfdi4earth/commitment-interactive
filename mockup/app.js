/* Clickable mock-up of the interactive NFDI4Earth Commitment.
 * Plain JS, hash routing (#/path?query). The real app will use React/Chakra (see CLAUDE.md);
 * note that it must not use document-level DOM queries because OneStop4All renders in a shadow root.
 */
(function () {
    "use strict";
    const D = window.DATA;
    const app = document.getElementById("app");

    /* ---------- icons ---------- */
    const ICON_PATHS = {
        cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/><path d="M22 9v6"/>',
        flask: '<path d="M9 3h6"/><path d="M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/>',
        building: '<path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6"/><path d="M9 11h.01M15 11h.01"/>',
        people: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.9.4 5 2.8 5 5.8"/>',
        scale: '<path d="M12 3v18M6 21h12M4 7h16"/><path d="M4 7l-3 7a3 3 0 0 0 6 0zM20 7l-3 7a3 3 0 0 0 6 0z"/>',
        compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
        pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
        book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
        unlock: '<rect x="4" y="11" width="16" height="10" rx="1"/><path d="M8 11V7a4 4 0 0 1 7.8-1.2"/>',
        eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
        chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
        chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z"/>',
        bulb: '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
        map: '<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7 6h10M6 8l5 8M18 8l-5 8"/>',
        user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
        text: '<path d="M4 6h16M4 10h16M4 14h10M4 18h12"/>',
        link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>'
    };
    const icon = (name) =>
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ""}</svg>`;
    const BACK_ICON =
        '<svg width="12" height="18" viewBox="0 0 16 24" fill="none" aria-hidden="true"><path d="M14.4541 22.5L2.99955 12L14.4541 1.5" stroke="#05668D" stroke-width="3" stroke-linecap="round"/></svg>';

    /* ---------- lookups ---------- */
    const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
    const ROLES = byId(D.roles);
    const TOPICS = byId(D.topics);
    const CONCEPTS = byId(D.concepts);
    const STMT = Object.fromEntries(D.statements.map((s) => [s.n, s]));
    const FACET_KIND = { role: ROLES, topic: TOPICS, concept: CONCEPTS };
    const plural = { role: "roles", topic: "topics", concept: "concepts" };

    // which statement / preamble paragraph contains which annotation
    const ANNO_HOME = {};
    D.statements.forEach((s) => {
        for (const m of s.text.matchAll(/\[\[([\w-]+)\|/g)) ANNO_HOME[m[1]] = "c" + s.n;
    });
    D.preamble.forEach((p, i) => {
        for (const m of p.matchAll(/\[\[([\w-]+)\|/g)) ANNO_HOME[m[1]] = "pre-" + (i + 1);
    });
    D.boxes.forEach((b) => {
        for (const m of b.title.matchAll(/\[\[([\w-]+)\|/g)) ANNO_HOME[m[1]] = b.id;
    });
    const plain = (t) => t.replace(/\[\[[\w-]+\|(.+?)\]\]/g, "$1");

    // text colour (dark or white) with the better contrast on a facet colour
    function ink(hex) {
        const [R, G, B] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
        const L = 0.2126 * R + 0.7152 * G + 0.0722 * B;
        return (L + 0.05) / 0.05 > 1.05 / (L + 0.05) ? "#1a202c" : "#ffffff";
    }
    const cv = (hex) => `--c:${hex};--ink:${ink(hex)}`;
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

    /* Minimal Markdown for annotation texts: paragraphs, **bold**, *italic* / _italic_,
     * "- " and "1. " lists, [links](url). Everything is HTML-escaped first, so authors
     * cannot inject HTML; only http(s), mailto and internal #/ links are turned into links.
     * The React app will use react-markdown (already an OS4A dependency) with the same subset. */
    function md(src) {
        const inline = (t) => {
            const links = [];
            let s = esc(t).replace(/\[([^\]]+)\]\(((?:https?:|mailto:|#\/)[^)\s]*)\)/g, (_, label, href) => {
                links.push(`<a href="${href}"${href.startsWith("#") ? "" : ' target="_blank" rel="noreferrer"'}>${label}</a>`);
                return `\u0000${links.length - 1}\u0000`;
            });
            s = s
                .replace(/\*\*(?=\S)(.+?)\*\*/g, "<strong>$1</strong>")
                .replace(/\*(?=\S)(.+?)\*/g, "<em>$1</em>")
                .replace(/(^|[\s(])_(?=\S)(.+?)_(?=$|[\s.,;:!?)])/g, "$1<em>$2</em>");
            return s.replace(/\u0000(\d+)\u0000/g, (_, i) => links[i]);
        };
        return String(src || "")
            .trim()
            .split(/\n\s*\n/)
            .map((block) => {
                const lines = block.split("\n").filter((l) => l.trim());
                if (lines.every((l) => /^\s*[-*] /.test(l)))
                    return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*] /, ""))}</li>`).join("")}</ul>`;
                if (lines.every((l) => /^\s*\d+\. /.test(l)))
                    return `<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+\. /, ""))}</li>`).join("")}</ol>`;
                return `<p>${inline(lines.join(" "))}</p>`;
            })
            .join("");
    }

    function markup(text) {
        return text.replace(/\[\[([\w-]+)\|(.+?)\]\]/g, (_, id, label) => {
            const a = D.annotations[id];
            if (!a) return label;
            return `<button type="button" class="anno d-${a.depth}" data-anchor="${id}" aria-haspopup="dialog" aria-label="${esc(label)} – ${a.depth}: ${esc(a.title)}">${label}</button>`;
        });
    }

    function tag(kind, id) {
        const f = FACET_KIND[kind][id];
        if (!f) return "";
        const ic = f.icon || (kind === "concept" ? "bulb" : "user");
        return `<a class="tag" data-kind="${kind}" style="${cv(f.colour)}" href="#/?${kind}=${id}" title="Show in text">${icon(ic)}${esc(f.label)}</a>`;
    }

    /* ---------- routing ---------- */
    function parseHash() {
        const h = location.hash.replace(/^#/, "") || "/";
        const [path, qs] = h.split("?");
        return { parts: path.split("/").filter(Boolean), q: new URLSearchParams(qs || "") };
    }
    function setQuery(q) {
        const { parts } = parseHash();
        const s = q.toString();
        history.replaceState(null, "", "#/" + parts.join("/") + (s ? "?" + s : ""));
    }

    function render() {
        closeAll();
        const { parts, q } = parseHash();
        const [p0, p1] = parts;
        if (!p0) renderReader(q);
        else if (p0 === "for") p1 ? renderPerspective(p1) : renderIndex("role");
        else if (p0 === "topics") p1 ? renderTopic(p1) : renderIndex("topic");
        else if (p0 === "concepts") renderIndex("concept");
        else if (p0 === "deep-dive") renderDeepDive(p1);
        else if (p0 === "map") renderMap();
        else app.innerHTML = page("Not found", "<p>This page does not exist in the mock-up.</p>");
        document.querySelectorAll(".menu-drawer a[data-nav]").forEach((a) => a.classList.toggle("here", a.dataset.nav === (p0 || "")));
        if (!q.get("focus")) window.scrollTo({ top: 0, behavior: "instant" });
    }
    window.addEventListener("hashchange", render);

    function page(title, body, opts = {}) {
        const back = opts.back === false ? "" :
            `<a class="backto" href="${opts.backHref || "#/"}">${BACK_ICON}<span><b>Back</b> ${esc(opts.backLabel || "to the Commitment")}</span></a>`;
        return `<div class="container">${back}${title ? `<h1 class="page-title">${title}</h1>` : ""}${body}</div>`;
    }

    /* ---------- lens ---------- */
    const lens = { role: null, topic: null, concept: null };

    function lensColour() {
        const k = ["role", "topic", "concept"].find((k) => lens[k]);
        return k ? FACET_KIND[k][lens[k]].colour : null;
    }
    function statementHit(s) {
        return ["role", "topic", "concept"].every((k) => !lens[k] || s[plural[k]].includes(lens[k]));
    }
    function annoHit(id) {
        const a = D.annotations[id];
        return ["role", "topic", "concept"].some((k) => lens[k] && (a[plural[k]] || []).includes(lens[k]));
    }

    function lensBar() {
        const roleChips = D.roles
            .map((r) => `<button type="button" class="chip" data-kind="role" style="${cv(r.colour)}" data-facet="role" data-id="${r.id}" aria-pressed="false" title="${esc(r.label)}">${icon(r.icon)}<span class="chip-text">${esc(r.label)}</span></button>`)
            .join("");
        const chips = (kind, list) => list.map((x) =>
            `<button type="button" class="chip" data-kind="${kind}" style="${cv(x.colour)}" data-facet="${kind}" data-id="${x.id}" aria-pressed="false">${icon(x.icon || "bulb")}<span class="chip-text">${esc(x.label)}</span></button>`
        ).join("");
        return `<div class="lensbar" id="lensbar"><div class="container">
            <div class="lens-status" aria-live="polite"><span id="lens-count"></span><button type="button" id="lens-clear" hidden>✕ Clear all</button></div>
            <div class="lens-group"><span class="lens-label">Perspective</span><div class="lens-chips">${roleChips}</div></div>
            <div class="lens-group"><span class="lens-label">Topic</span><div class="lens-chips">${chips("topic", D.topics)}</div></div>
            <div class="lens-group"><span class="lens-label">Concept</span><div class="lens-chips">${chips("concept", D.concepts)}</div></div>
        </div></div>`;
    }

    function applyLens() {
        const root = document.getElementById("reader-root");
        if (!root) return;
        const on = !!(lens.role || lens.topic || lens.concept);
        root.classList.toggle("lens-on", on);
        if (on) root.style.setProperty("--lens", lensColour());
        let hits = 0;
        root.querySelectorAll(".statement").forEach((el) => {
            const hit = statementHit(STMT[el.dataset.n]);
            if (hit) hits++;
            el.classList.toggle("hit", on && hit);
            el.classList.toggle("dim", on && !hit);
        });
        root.querySelectorAll(".mm-item").forEach((el) => {
            const hit = statementHit(STMT[el.dataset.n]);
            el.classList.toggle("hit", on && hit);
            el.classList.toggle("dim", on && !hit);
        });
        root.querySelectorAll(".anno[data-anchor]").forEach((el) => {
            const st = el.closest(".statement");
            el.classList.toggle("hit", on && annoHit(el.dataset.anchor) && (!st || st.classList.contains("hit")));
        });
        root.querySelectorAll(".preamble p, .intro").forEach((p) => {
            p.classList.toggle("dim", on && !p.querySelector(".anno.hit"));
        });
        document.querySelectorAll(".chip[data-facet]").forEach((c) =>
            c.setAttribute("aria-pressed", String(lens[c.dataset.facet] === c.dataset.id))
        );
        const count = document.getElementById("lens-count");
        if (count) {
            const names = ["role", "topic", "concept"].filter((k) => lens[k]).map((k) => FACET_KIND[k][lens[k]].label);
            count.innerHTML = on ? `<b>${hits}</b> of 12 statements relevant for <b>${esc(names.join(" + "))}</b>` : "Select badges to highlight the relevant parts. Combine one of each row to narrow down.";
        }
        const clear = document.getElementById("lens-clear");
        if (clear) clear.hidden = !on;
        // keep the preamble's collapse state; point the reader to relevant passages instead
        // one count per active category (perspective, topic, concept)
        const preCount = document.getElementById("pre-count");
        if (preCount) {
            const annos = [...root.querySelectorAll(".preamble .anno[data-anchor]")].map((el) => D.annotations[el.dataset.anchor]);
            preCount.innerHTML = ["role", "topic", "concept"].filter((k) => lens[k]).map((k) => {
                const f = FACET_KIND[k][lens[k]];
                const n = annos.filter((a) => (a[plural[k]] || []).includes(lens[k])).length;
                return `<span class="pre-count-item${n ? "" : " zero"}" data-kind="${k}" style="${cv(f.colour)}" title="${esc(f.label)}">${icon(f.icon || "bulb")}${n} passage${n === 1 ? "" : "s"}</span>`;
            }).join("");
            preCount.hidden = !on;
        }
        const q = parseHash().q;
        ["role", "topic", "concept"].forEach((k) => (lens[k] ? q.set(k, lens[k]) : q.delete(k)));
        q.delete("focus");
        setQuery(q);
    }

    function bindLens() {
        document.querySelectorAll(".chip[data-facet]").forEach((c) =>
            c.addEventListener("click", () => {
                const k = c.dataset.facet;
                lens[k] = lens[k] === c.dataset.id ? null : c.dataset.id;
                applyLens();
            })
        );
        document.getElementById("lens-clear").addEventListener("click", () => {
            lens.role = lens.topic = lens.concept = null;
            applyLens();
        });
    }

    /* ---------- Reader ---------- */
    function renderReader(q) {
        ["role", "topic", "concept"].forEach((k) => (lens[k] = FACET_KIND[k][q.get(k)] ? q.get(k) : null));
        const rail = (s) => s.roles.map((r) => `<span style="${cv(ROLES[r].colour)}" title="${esc(ROLES[r].label)}"></span>`).join("");
        const stmt = (s) => `<div class="statement" id="c${s.n}" data-n="${s.n}">
                <button type="button" class="num" data-stmt="${s.n}" aria-label="Statement ${s.n}: what it means for different perspectives">${s.n}</button>
                <p class="stext">${markup(s.text)}</p>
                <div class="rail" aria-hidden="true">${rail(s)}</div></div>`;
        const box = (b) => `<div class="box-banner" id="${b.id}">${markup(b.title)}</div>
            <div class="statements">${D.statements.filter((s) => s.n >= b.from && s.n <= b.to).map(stmt).join("")}</div>`;
        const mm = D.boxes.map((b) => `<li class="toc-box"><a href="#/" data-target="${b.id}">${b.id === "boxA" ? "We commit to advance FAIRness and Openness" : "We value data infrastructures and data experts"}</a></li>` +
            D.statements.filter((s) => s.n >= b.from && s.n <= b.to).map((s) =>
                `<li><a href="#/?focus=c${s.n}" class="mm-item" data-n="${s.n}"><span class="mm-n">${s.n}</span><span class="mm-label">${esc(s.short)}</span></a></li>`
            ).join("")).join("");

        const tiles = [
            ["#/for", "user", "Explore by", "Perspective"],
            ["#/topics", "pen", "Explore by", "Topics from your work"],
            ["#/concepts", "bulb", "Explore by", "Concepts"],
            ["#/map", "map", "Explore the", "Overview map"]
        ].map(([h, ic, t, title]) => `<a class="tile" href="${h}"><div class="tile-icon">${icon(ic)}</div><div class="tile-type">${t}</div><div class="tile-title">${title}</div></a>`).join("");

        app.innerHTML = `
            ${page("NFDI4Earth FAIRness and Openness Commitment <span class=\"mock-badge\">Mock-up · example content</span>",
                `<p class="page-sub">Version 1.0 (2024) · <a href="https://doi.org/10.5281/zenodo.10123880" target="_blank" rel="noreferrer">doi:10.5281/zenodo.10123880</a> · <a href="https://nfdi4earth.de/commit" target="_blank" rel="noreferrer">Sign the Commitment</a></p>
                <div class="tiles">${tiles}</div>`,
                { backHref: "https://nfdi4earth.de/commitment", backLabel: "to the Commitment website" })}
            ${lensBar()}
            <div class="container" id="reader-root">
                <div class="reader">
                    <aside class="minimap-col" id="minimap-col" aria-label="Overview">
                        <nav class="toc" id="toc" aria-label="Contents">
                            <div class="toc-head">Contents</div>
                            <ul>
                                <li><a href="#/" class="toc-top" data-target="preamble">Preamble</a></li>
                                ${mm}
                            </ul>
                        </nav>
                    </aside>
                    <article class="reader-text">
                        <div class="legend"><span>${markup("[[legend-note|short note]]")} (hover)</span><span>${markup("[[legend-explainer|explainer]]")} (click)</span><span>${markup("[[legend-deepdive|deep dive]]")} (click)</span><span><button type="button" class="num num-sample" data-stmt="1" aria-label="Example: open statement 1 with all perspectives">1</button> Click on the number of a statement to see all perspectives at once</span></div>
                        <details class="preamble" id="preamble"><summary>Preamble (click to read) <span class="pre-count" id="pre-count" hidden></span></summary>
                            ${D.preamble.map((p, i) => `<p id="pre-${i + 1}">${markup(p)}</p>`).join("")}
                            <p>Sign the Commitment at <a href="https://nfdi4earth.de/commit" target="_blank" rel="noreferrer">nfdi4earth.de/commit</a>.</p>
                        </details>
                        <h2 class="page-title" style="font-size:20px">The NFDI4Earth FAIRness and Openness Commitment</h2>
                        <p class="intro" id="intro">${esc(D.intro)}</p>
                        <p class="intro"><b>As signatories:</b></p>
                        ${D.boxes.map(box).join("")}
                    </article>
                </div>
            </div>
            <button type="button" class="btn-solid mm-toggle" id="mm-toggle">${icon("text").replace("<svg", '<svg width="18" height="18"')} Contents</button>`;

        bindLens();
        applyLens();
        setLensVar();
        bindAnnotations(app);
        app.querySelectorAll(".num").forEach((b) => b.addEventListener("click", () => openStatementPanel(+b.dataset.stmt)));

        // contents menu: click to jump + synced highlighting of the current section
        const canvas = document.getElementById("toc");
        canvas.querySelectorAll("a").forEach((it) =>
            it.addEventListener("click", (e) => {
                e.preventDefault();
                document.getElementById("minimap-col").classList.remove("open");
                const target = it.dataset.n ? "c" + it.dataset.n : it.dataset.target;
                if (target === "preamble") document.getElementById("preamble").open = true;
                scrollToEl(document.getElementById(target), !!it.dataset.n);
            })
        );
        document.getElementById("mm-toggle").addEventListener("click", () => document.getElementById("minimap-col").classList.toggle("open"));
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    canvas.querySelectorAll(".mm-item").forEach((m) => m.classList.toggle("current", m.dataset.n === e.target.dataset.n));
                }
            });
        }, { rootMargin: "-40% 0px -55% 0px" });
        app.querySelectorAll(".statement").forEach((s) => io.observe(s));

        const focus = q.get("focus");
        if (focus) setTimeout(() => focusAnchor(focus), 150);
    }

    function scrollToEl(el, pulse) {
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - headerH() - 90;
        window.scrollTo({ top, behavior: "smooth" });
        if (pulse) {
            el.classList.remove("pulse");
            void el.offsetWidth;
            el.classList.add("pulse");
        }
    }

    function focusAnchor(id) {
        if (/^pre-/.test(id) || D.annotations[id] && ANNO_HOME[id] && ANNO_HOME[id].startsWith("pre")) document.getElementById("preamble").open = true;
        let el = document.querySelector(`[data-anchor="${id}"]`) || document.getElementById(id);
        // fall back from an unknown phrase id like "c8-foo" to its statement
        if (!el && /^c\d+-/.test(id)) el = document.getElementById(id.split("-")[0]);
        if (!el) return toast(`Anchor “${id}” not found`);
        scrollToEl(el, true);
        if (D.annotations[id]) setTimeout(() => openAnnotation(el, true), 600);
    }

    /* ---------- annotations: tooltip / popover / panel ---------- */
    const tooltip = document.getElementById("tooltip");
    let popover = null;

    function bindAnnotations(root) {
        root.querySelectorAll(".anno[data-anchor]").forEach((el) => {
            const a = D.annotations[el.dataset.anchor];
            if (a.depth === "note") {
                el.addEventListener("mouseenter", () => showTooltip(el));
                el.addEventListener("focus", () => showTooltip(el));
                el.addEventListener("mouseleave", hideTooltipSoon);
                el.addEventListener("blur", hideTooltip);
            }
            el.addEventListener("click", (ev) => {
                ev.stopPropagation();
                openAnnotation(el, false);
            });
        });
    }

    function showTooltip(el) {
        clearTimeout(tooltipTimer);
        const a = D.annotations[el.dataset.anchor];
        tooltip.innerHTML = `<b>${esc(a.title)}</b>${md(a.body)}`;
        const r = el.getBoundingClientRect();
        tooltip.classList.add("show");
        const w = tooltip.offsetWidth;
        tooltip.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + window.scrollX + r.width / 2 - w / 2)) + "px";
        // flip below the word if the sticky header/lens bar would cover it
        const lb = document.getElementById("lensbar");
        const covered = Math.max(headerH(), lb ? lb.getBoundingClientRect().bottom : 0);
        const above = r.top - tooltip.offsetHeight - 8;
        tooltip.style.top = (above < covered ? r.bottom + 8 : above) + window.scrollY + "px";
    }
    let tooltipTimer = null;
    function hideTooltip() {
        clearTimeout(tooltipTimer);
        tooltip.classList.remove("show");
    }
    // short delay, so the pointer can move from the word onto the note (e.g. to click a link)
    const hideTooltipSoon = () => {
        clearTimeout(tooltipTimer);
        tooltipTimer = setTimeout(hideTooltip, 250);
    };
    tooltip.addEventListener("mouseenter", () => clearTimeout(tooltipTimer));
    tooltip.addEventListener("mouseleave", hideTooltipSoon);

    function openAnnotation(el, fromLink) {
        const id = el.dataset.anchor;
        const a = D.annotations[id];
        if (a.depth === "note") {
            showTooltip(el);
            if (fromLink) setTimeout(hideTooltip, 3500);
        } else if (a.depth === "explainer") openPopover(el, id);
        else openAnnoPanel(id);
    }

    function facetTags(obj) {
        return ["role", "topic", "concept"].flatMap((k) => (obj[plural[k]] || []).map((id) => tag(k, id))).join("");
    }
    function linkList(links) {
        return links && links.length ? `<ul class="links">${links.map(([l, u]) => `<li><a href="${u}" target="_blank" rel="noreferrer">${esc(l)}</a></li>`).join("")}</ul>` : "";
    }

    function openPopover(el, id) {
        closePopover();
        hideTooltip();
        const a = D.annotations[id];
        popover = document.createElement("div");
        popover.className = "popover";
        popover.setAttribute("role", "dialog");
        popover.setAttribute("aria-label", a.title);
        popover.innerHTML = `<button type="button" class="close-x" aria-label="Close">×</button>
            <h4>${esc(a.title)}</h4>${md(a.body)}${linkList(a.links)}
            <div class="facet-tags">${facetTags(a)}</div>
            <div class="pop-actions"><button type="button" class="btn-outline" data-copy="${id}">${icon("link").replace("<svg", '<svg width="14" height="14"')} Copy link</button>
            ${a.concepts && a.concepts.some((c) => D.deepdives[c]) ? `<a class="btn-outline" href="#/deep-dive/${a.concepts.find((c) => D.deepdives[c])}">Go deeper →</a>` : ""}</div>`;
        document.body.appendChild(popover);
        const r = el.getBoundingClientRect();
        const w = popover.offsetWidth;
        popover.style.left = Math.max(16, Math.min(window.innerWidth - w - 16, r.left + window.scrollX)) + "px";
        popover.style.top = r.bottom + window.scrollY + 8 + "px";
        popover.querySelector(".close-x").addEventListener("click", closePopover);
        popover.addEventListener("click", (e) => e.stopPropagation());
        bindCopy(popover);
        popover.querySelector(".close-x").focus({ preventScroll: true });
    }
    function closePopover() {
        if (popover) popover.remove();
        popover = null;
    }

    const panel = document.getElementById("panel");
    const backdrop = document.getElementById("panel-backdrop");
    function openPanel(html, label) {
        closePopover();
        hideTooltip();
        panel.innerHTML = `<button type="button" class="close-x" aria-label="Close">×</button>${html}`;
        panel.setAttribute("aria-label", label);
        panel.classList.add("open");
        backdrop.classList.add("open");
        panel.scrollTop = 0;
        panel.querySelector(".close-x").addEventListener("click", closePanel);
        bindCopy(panel);
        panel.querySelector(".close-x").focus({ preventScroll: true });
    }
    function closePanel() {
        panel.classList.remove("open");
        backdrop.classList.remove("open");
    }
    backdrop.addEventListener("click", closePanel);

    function openAnnoPanel(id) {
        const a = D.annotations[id];
        const home = ANNO_HOME[id];
        const s = home && /^c\d/.test(home) ? STMT[home.slice(1)] : null;
        const bx = D.boxes.find((b) => b.id === home);
        const dd = a.concept && D.deepdives[a.concept];
        openPanel(`<div class="kicker">Deep dive${s ? " · Statement " + s.n : bx ? " · Commitment heading" : ""}</div>
            <h3>${esc(a.title)}</h3>
            ${s ? `<div class="quote">${plain(s.text)}</div>` : bx ? `<div class="quote"><b>${plain(bx.title)}</b></div>` : ""}
            <div class="facet-tags">${facetTags(a)}</div>
            ${a.figure ? figure(a.figure) : ""}
            ${md(a.body)}${linkList(a.links)}
            ${a.statements || dd || s ? `<div class="facet-tags"><span class="lens-label">Related statements</span>${(a.statements || (dd ? dd.statements : [s.n])).map((n) => `<a class="tag" data-kind="stmt" href="#/?focus=c${n}">${n} · ${esc(STMT[n].short)}</a>`).join("")}</div>` : ""}
            <div class="pop-actions"><button type="button" class="btn-outline" data-copy="${id}">${icon("link").replace("<svg", '<svg width="14" height="14"')} Copy link</button>
            ${dd ? `<a class="btn-solid" href="#/deep-dive/${a.concept}">Open full deep dive →</a>` : ""}</div>`, a.title);
    }

    function openStatementPanel(n) {
        const s = STMT[n];
        const active = D.roles;
        const withNote = active.filter((r) => D.perspectiveNotes[r.id][n]);
        const without = active.filter((r) => !D.perspectiveNotes[r.id][n]);
        const persp = withNote.map((r) =>
            `<div class="persp" style="${cv(r.colour)}"><h5>${icon(r.icon)}${esc(r.label)}</h5>${md(D.perspectiveNotes[r.id][n][0])}<p><a href="#/for/${r.id}">More for ${esc(r.plural.toLowerCase())} →</a></p></div>`
        ).join("") + (without.length ? `<p class="persp-rest">Less directly relevant for ${without.map((r) => esc(r.plural.toLowerCase())).join(" and ")}.</p>` : "");
        openPanel(`<div class="kicker">Statement ${n} · ${n <= 9 ? "We commit to advance FAIRness and Openness" : "We value data infrastructures and data experts"}</div>
            <h3>${esc(s.short)}</h3>
            <div class="quote">${s.text.replace(/\[\[[\w-]+\|(.+?)\]\]/g, "$1")}</div>
            <div class="facet-tags">${facetTags(s)}</div>
            <p><b>What this means for…</b> <span class="mock-badge">example content</span></p>
            ${persp}
            <div class="pop-actions"><button type="button" class="btn-outline" data-copy="c${n}">${icon("link").replace("<svg", '<svg width="14" height="14"')} Copy link to statement</button></div>`, "Statement " + n);
    }

    function bindCopy(root) {
        root.querySelectorAll("[data-copy]").forEach((b) =>
            b.addEventListener("click", () => {
                const url = location.href.split("#")[0] + "#/?focus=" + b.dataset.copy;
                const done = () => toast("Link copied: " + url);
                if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, () => toast(url));
                else toast(url);
            })
        );
    }

    function toast(msg) {
        const t = document.getElementById("toast");
        t.textContent = msg;
        t.classList.add("show");
        clearTimeout(toast.timer);
        toast.timer = setTimeout(() => t.classList.remove("show"), 3500);
    }

    function closeAll() {
        closePopover();
        closePanel();
        hideTooltip();
        closeMenu();
    }
    document.addEventListener("click", closePopover);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAll();
    });

    /* ---------- zoom / pan (stand-in for react-zoom-pan-pinch) ---------- */
    function makeZoomPan(viewport, apply, { min = 0.5, max = 3 } = {}) {
        const t = { x: 0, y: 0, k: 1 };
        let drag = null;
        let moved = 0;
        const set = () => apply(t);
        const zoomAt = (f, cx, cy) => {
            const k = Math.min(max, Math.max(min, t.k * f));
            t.x = cx - ((cx - t.x) * k) / t.k;
            t.y = cy - ((cy - t.y) * k) / t.k;
            t.k = k;
            set();
        };
        viewport.addEventListener("wheel", (e) => {
            e.preventDefault();
            const r = viewport.getBoundingClientRect();
            zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top);
        }, { passive: false });
        viewport.addEventListener("pointerdown", (e) => {
            drag = { x: e.clientX - t.x, y: e.clientY - t.y };
            moved = 0;
            viewport.classList.add("grabbing");
        });
        window.addEventListener("pointermove", (e) => {
            if (!drag) return;
            const nx = e.clientX - drag.x;
            const ny = e.clientY - drag.y;
            moved += Math.abs(nx - t.x) + Math.abs(ny - t.y);
            t.x = nx;
            t.y = ny;
            set();
        });
        window.addEventListener("pointerup", () => {
            drag = null;
            viewport.classList.remove("grabbing");
        });
        const centre = () => {
            const r = viewport.getBoundingClientRect();
            return [r.width / 2, r.height / 2];
        };
        set();
        return {
            in: () => zoomAt(1.3, ...centre()),
            out: () => zoomAt(1 / 1.3, ...centre()),
            reset: () => {
                t.x = t.y = 0;
                t.k = 1;
                set();
            },
            wasDrag: () => moved > 5,
            t
        };
    }

    /* ---------- index pages ---------- */
    function renderIndex(kind) {
        const conf = {
            role: ["Explore by perspective", "Who are you? See what the Commitment means for your role.", D.roles, (r) => `#/for/${r.id}`],
            topic: ["Explore by topic", "Start from a task you know from your daily work as a researcher.", D.topics, (t) => `#/topics/${t.id}`],
            concept: ["Explore by concept", "Follow a cross-cutting idea through the whole Commitment.", D.concepts, (c) => (D.deepdives[c.id] && !D.deepdives[c.id].placeholder ? `#/deep-dive/${c.id}` : `#/?concept=${c.id}`)]
        }[kind];
        const [title, sub, list, href] = conf;
        const tiles = list.map((x) => {
            const n = D.statements.filter((s) => s[plural[kind]].includes(x.id)).length;
            const ic = x.icon || "bulb";
            const extra = kind === "topic" ? `You know this from: ${esc(x.knownFrom)}` : kind === "role" ? esc(x.blurb) :
                D.deepdives[x.id] && !D.deepdives[x.id].placeholder ? "Deep dive available" : "Highlight in text";
            return `<a class="tile" href="${href(x)}">
                <div class="tile-icon" style="color:${x.colour}">${icon(ic)}</div>
                <div class="tile-type">${n} statements</div>
                <div class="tile-title">${esc(x.label)}</div>
                <p style="font-size:14px;margin:6px 0 0;color:#4a5568">${extra}</p></a>`;
        }).join("");
        app.innerHTML = page(esc(title) + ' <span class="mock-badge">Mock-up</span>', `<p class="page-sub">${esc(sub)}</p><div class="tiles">${tiles}</div>`);
    }

    /* ---------- perspective page ---------- */
    function renderPerspective(id) {
        const r = ROLES[id];
        if (!r) return renderIndex("role");
        const others = D.roles.filter((o) => o.id !== id).map((o) =>
            `<a class="chip" data-kind="role" style="${cv(o.colour)}" href="#/for/${o.id}">${icon(o.icon)}<span class="chip-text">${esc(o.label)}</span></a>`
        ).join("");
        const hero = `<div class="role-hero" style="${cv(r.colour)}"><div class="role-icon">${icon(r.icon)}</div>
            <div><h1>The Commitment for ${esc(r.plural)} <span class="mock-badge">example content</span></h1><p>${esc(r.blurb)}</p></div></div>`;
        const notes = D.perspectiveNotes[id];
        const cards = Object.keys(notes).map((n) => {
            const s = STMT[n];
            const [text, action] = notes[n];
            return `<div class="card" style="${cv(r.colour)}"><div class="card-n">Statement ${n}</div><h3>${esc(s.short)}</h3><div class="md">${md(text)}</div>
                <label><input type="checkbox" class="todo"> ${esc(action)}</label>
                <div class="card-foot"><a href="#/?role=${id}&focus=c${n}">Show in text →</a></div></div>`;
        }).join("");
        app.innerHTML = page("", `${hero}
            <p><b>Your progress</b> <span id="prog-label" style="color:#718096">0 of ${Object.keys(notes).length} first steps</span></p>
            <div class="progress" style="${cv(r.colour)}"><div id="prog"></div></div>
            <div class="cards">${cards}</div>
            <div class="other-roles"><span class="lens-label">Other perspectives</span>${others}</div>
            <p style="margin-top:24px"><a class="btn-solid" href="#/?role=${id}">Read the full Commitment as ${esc(r.label.toLowerCase())}</a></p>`, { backHref: "#/for", backLabel: "to perspectives" });
        const boxes = app.querySelectorAll(".todo");
        boxes.forEach((b) => b.addEventListener("change", () => {
            const done = [...boxes].filter((x) => x.checked).length;
            document.getElementById("prog").style.width = (100 * done) / boxes.length + "%";
            document.getElementById("prog-label").textContent = `${done} of ${boxes.length} first steps`;
        }));
    }

    /* ---------- topic page (scrollytelling) ---------- */
    function renderTopic(id) {
        const t = TOPICS[id];
        if (!t) return renderIndex("topic");
        const steps = D.topicSteps[id] || D.statements.filter((s) => s.topics.includes(id)).map((s) => ({
            n: s.n, title: s.short,
            text: `[Example content] In ${t.label.toLowerCase()}, statement ${s.n} could mean: a concrete, familiar task that links “${s.short.toLowerCase()}” to what you already do.`
        }));
        const rel = new Set(D.statements.filter((s) => s.topics.includes(id)).map((s) => s.n));
        const cond = D.statements.map((s) => `<div class="cond ${rel.has(s.n) ? "rel" : "irrel"}" data-n="${s.n}"><span class="cn">${s.n}</span><span>${s.text.replace(/\[\[[\w-]+\|(.+?)\]\]/g, "$1")}</span></div>`).join("");
        const stepHtml = steps.map((st, i) => `<section class="step" data-n="${st.n}" data-i="${i}"><div class="step-n">Step ${i + 1} of ${steps.length} · Statement ${st.n}</div><h3>${esc(st.title)}</h3>${md(st.text)}
            <a href="#/?topic=${id}&focus=c${st.n}">Read in context →</a>
            ${i < steps.length - 1 ? `<div class="step-next" aria-hidden="true">↓ Next: ${esc(steps[i + 1].title)}</div>` : ""}</section>`).join("");
        const dots = steps.map((st, i) => `<i data-i="${i}"></i>`).join("");
        const others = D.topics.filter((o) => o.id !== id).map((o) => `<a class="chip" data-kind="topic" style="${cv(o.colour)}" href="#/topics/${o.id}">${icon(o.icon)}<span class="chip-text">${esc(o.label)}</span></a>`).join("");
        app.innerHTML = page("", `<div class="topic-hero" style="${cv(t.colour)}"><h1>${icon(t.icon)}${esc(t.label)} <span class="mock-badge">example content</span></h1>
            <p>You know this from: <i>${esc(t.knownFrom)}</i>. <b>${rel.size} of 12</b> statements are relevant – ${steps.length} steps below. <b>Scroll down ↓</b></p></div>
            <div class="scrolly" style="${cv(t.colour)}">
                <div class="scrolly-sticky" aria-hidden="true"><h4>The Commitment <span class="step-dots">${dots}</span></h4>${cond}</div>
                <div class="steps">${stepHtml}
                    <div style="margin-top:40px"><p class="lens-label">Other topics</p><div class="other-roles" style="margin-top:6px">${others}</div></div>
                </div>
            </div>`, { backHref: "#/topics", backLabel: "to topics" });
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (!e.isIntersecting) return;
                app.querySelectorAll(".step").forEach((s) => s.classList.toggle("active", s === e.target));
                app.querySelectorAll(".step-dots i").forEach((d) => d.classList.toggle("on", +d.dataset.i <= +e.target.dataset.i));
                app.querySelectorAll(".cond").forEach((c) => {
                    const on = c.dataset.n === e.target.dataset.n;
                    c.classList.toggle("active", on);
                    if (on && window.innerWidth <= 1000) c.parentElement.scrollTo({ top: c.offsetTop - 40, behavior: "smooth" });
                });
            });
        }, { rootMargin: "-45% 0px -45% 0px" });
        app.querySelectorAll(".step").forEach((s) => io.observe(s));
    }

    /* ---------- deep dive page ---------- */
    function renderDeepDive(id) {
        const d = D.deepdives[id];
        if (!d) return renderIndex("concept");
        const body = d.sections.map(([h, p]) => `<h2>${esc(h)}</h2>${md(p)}`).join("");
        const refs = d.statements.map((n) => `<a class="dd-ref" href="#/?concept=${d.concept}&focus=c${n}"><b>${n}</b> · ${esc(STMT[n].short)}</a>`).join("");
        const anchors = d.anchors.map((a) => `<a class="dd-ref" href="#/?concept=${d.concept}&focus=${a}">“${esc(D.annotations[a].title)}”</a>`).join("");
        app.innerHTML = page(`${esc(d.title)} <span class="mock-badge">Deep dive · example content</span>`,
            `<div class="dd-layout"><div class="dd-body"><div class="dd-lead">${md(d.lead)}</div>${d.figure ? figure(d.figure) : ""}${body}
                <h2>Further reading</h2>${linkList(d.links)}</div>
             <aside class="dd-aside"><div class="text-box"><h4>Where this appears in the Commitment</h4>${refs}
                <h4 style="margin-top:16px">Annotated phrases</h4>${anchors}
                <p style="margin:16px 0 0"><a class="btn-outline" href="#/?concept=${d.concept}">Highlight all in text</a></p></div></aside></div>`,
            { backHref: "#/concepts", backLabel: "to concepts" });
    }

    /* ---------- static figures ---------- */
    function figure(kind) {
        if (kind === "licence") {
            const steps = [["© reserved", "#C53030"], ["CC BY-NC-ND", "#DD6B20"], ["CC BY-NC", "#D69E2E"], ["CC BY-SA", "#38A169"], ["CC BY", "#2F855A"], ["CC0", "#05668D"]];
            const w = 100;
            return `<figure><svg viewBox="0 0 640 170" role="img" aria-label="Licence spectrum from all rights reserved to CC0">
                <text x="20" y="28" font-size="13" fill="#4a5568" font-family="Arial">Less reuse</text><text x="620" y="28" font-size="13" fill="#4a5568" text-anchor="end" font-family="Arial">More reuse</text>
                <line x1="100" y1="24" x2="540" y2="24" stroke="#a0aec0" stroke-width="2" marker-end="url(#arr)"/>
                <defs><marker id="arr" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="#a0aec0"/></marker></defs>
                ${steps.map(([l, col], i) => `<rect x="${20 + i * w + i * 2}" y="50" width="${w}" height="56" fill="${col}"/><text x="${20 + i * w + i * 2 + w / 2}" y="83" font-size="12" fill="#fff" text-anchor="middle" font-family="Arial" font-weight="700">${l}</text>`).join("")}
                <rect x="428" y="116" width="202" height="30" fill="none" stroke="#05668D" stroke-dasharray="4 3"/>
                <text x="529" y="136" font-size="12" fill="#05668D" text-anchor="middle" font-family="Arial" font-weight="700">recommended for data</text>
                </svg><figcaption>Figure (placeholder): the licence spectrum. Statement 8 asks for licences at the open end.</figcaption></figure>`;
        }
        if (kind === "openness") {
            const steps = ["Closed", "Restricted", "Embargoed", "Open with conditions", "Open"];
            return `<figure><svg viewBox="0 0 640 140" role="img" aria-label="Openness spectrum">
                <defs><linearGradient id="og" x1="0" x2="1"><stop offset="0" stop-color="#cbd5e0"/><stop offset="1" stop-color="#05668D"/></linearGradient></defs>
                <rect x="20" y="40" width="600" height="40" fill="url(#og)"/>
                ${steps.map((s, i) => `<line x1="${20 + i * 150}" y1="36" x2="${20 + i * 150}" y2="84" stroke="#fff" stroke-width="2"/><text x="${20 + i * 150}" y="104" font-size="12" text-anchor="${i === 0 ? "start" : i === 4 ? "end" : "middle"}" font-family="Arial" fill="#2d3748">${s}</text>`).join("")}
                <text x="320" y="128" font-size="13" text-anchor="middle" font-family="Arial" fill="#05668D" font-weight="700">“As open as possible, as closed as necessary”</text>
                </svg><figcaption>Figure (placeholder): openness is a spectrum, not a switch.</figcaption></figure>`;
        }
        if (kind === "fair") {
            const q = [["F", "Findable", 90], ["A", "Accessible", 85], ["I", "Interoperable", 45], ["R", "Reusable", 55]];
            return `<figure><svg viewBox="0 0 640 170" role="img" aria-label="Typical coverage of FAIR aspects (fake)">
                ${q.map(([l, n, v], i) => `<text x="20" y="${38 + i * 36}" font-size="20" font-weight="700" fill="#05668D" font-family="Arial">${l}</text><text x="48" y="${38 + i * 36}" font-size="13" fill="#4a5568" font-family="Arial">${n}</text>
                <rect x="160" y="${22 + i * 36}" width="440" height="20" fill="#e2e8f0"/><rect x="160" y="${22 + i * 36}" width="${4.4 * v}" height="20" fill="#22C0D2"/>`).join("")}
                </svg><figcaption>Figure (placeholder, fake numbers): repositories often cover F and A better than I and R.</figcaption></figure>`;
        }
        return "";
    }

    /* ---------- overview map ---------- */
    function renderMap() {
        app.innerHTML = page("Overview map <span class=\"mock-badge\">Mock-up</span>",
            `<p class="map-help">Perspectives and topics (left) connect to statements (middle) and concepts (right). Hover or tap a node to trace its connections, click again to open it. Scroll to zoom, drag to pan.</p>
            <div class="map-wrap"><div class="map-tools"><button type="button" data-z="out" aria-label="Zoom out">−</button><button type="button" data-z="in" aria-label="Zoom in">+</button><button type="button" data-z="reset">Fit</button></div>
            <svg id="map-svg" viewBox="0 0 1100 680" role="img" aria-label="Overview map"><g id="map-g"></g></svg></div>`);
        const g = document.getElementById("map-g");
        const nodes = [];
        const L = { x: 30, w: 210 }, M = { x: 440, w: 230 }, R = { x: 870, w: 200 };
        const left = [...D.roles.map((r) => ({ kind: "role", f: r })), ...D.topics.map((t) => ({ kind: "topic", f: t }))];
        left.forEach((o, i) => nodes.push({ id: o.kind + ":" + o.f.id, kind: o.kind, label: o.f.label, colour: o.f.colour, x: L.x, y: 50 + i * 47 + (o.kind === "topic" ? 20 : 0), w: L.w }));
        D.statements.forEach((s, i) => nodes.push({ id: "s:" + s.n, kind: "stmt", label: `${s.n} · ${s.short}`, colour: "#05668D", x: M.x, y: 50 + i * 52 + (s.n > 9 ? 16 : 0), w: M.w, n: s.n }));
        D.concepts.forEach((c, i) => nodes.push({ id: "concept:" + c.id, kind: "concept", label: c.label, colour: c.colour, x: R.x, y: 120 + i * 80, w: R.w }));
        const N = Object.fromEntries(nodes.map((n) => [n.id, n]));
        const edges = [];
        D.statements.forEach((s) => {
            s.roles.forEach((r) => edges.push(["role:" + r, "s:" + s.n]));
            s.topics.forEach((t) => edges.push(["topic:" + t, "s:" + s.n]));
            s.concepts.forEach((c) => edges.push(["s:" + s.n, "concept:" + c]));
        });
        const H = 32;
        let svg = `<text class="map-col-label" x="${L.x}" y="30">Perspectives</text><text class="map-col-label" x="${L.x}" y="${50 + D.roles.length * 47 + 8}">Topics</text>
            <text class="map-col-label" x="${M.x}" y="30">Statements</text><text class="map-col-label" x="${R.x}" y="100">Concepts</text>`;
        svg += edges.map(([a, b]) => {
            const A = N[a], B = N[b];
            const x1 = A.x + A.w, y1 = A.y + H / 2, x2 = B.x, y2 = B.y + H / 2, mx = (x1 + x2) / 2;
            return `<path class="medge" data-a="${a}" data-b="${b}" d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" style="stroke:${A.kind === "stmt" ? B.colour : A.colour}"/>`;
        }).join("");
        svg += nodes.map((n) => {
            const fill = n.kind === "stmt" ? "#fff" : n.colour;
            const tc = n.kind === "stmt" ? "#05668D" : ink(n.colour);
            // corner radius encodes the kind, same as the badges (see style.css: [data-kind])
            const rx = n.kind === "topic" ? 4 : n.kind === "stmt" ? 0 : 16;
            return `<g class="mnode" data-id="${n.id}" tabindex="0" role="button" aria-label="${esc(n.label)}"><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${H}" rx="${rx}" fill="${fill}" stroke="${n.colour}"/>
                <text x="${n.x + 12}" y="${n.y + 21}" fill="${tc}" ${n.kind === "stmt" ? "" : 'font-weight="700"'}>${esc(n.label)}</text></g>`;
        }).join("");
        g.innerHTML = svg;
        const svgEl = document.getElementById("map-svg");
        const zp = makeZoomPan(svgEl, (t) => g.setAttribute("transform", `translate(${t.x},${t.y}) scale(${t.k})`), { min: 0.4, max: 3 });
        app.querySelectorAll(".map-tools button").forEach((b) => b.addEventListener("click", () => zp[b.dataset.z]()));
        let selected = null;
        const focusNode = (id) => {
            const conn = new Set([id]);
            const direct = [...g.querySelectorAll(".medge")].filter((e) => e.dataset.a === id || e.dataset.b === id);
            // perspectives and topics: also follow their statements on to the concepts
            const hop = /^(role|topic):/.test(id) ? new Set(direct.map((e) => e.dataset.b)) : new Set();
            g.querySelectorAll(".medge").forEach((e) => {
                const on = direct.includes(e) || (hop.has(e.dataset.a) && e.dataset.b.startsWith("concept:"));
                e.classList.toggle("on", on);
                if (on) { conn.add(e.dataset.a); conn.add(e.dataset.b); }
            });
            g.querySelectorAll(".mnode").forEach((m) => m.classList.toggle("off", !conn.has(m.dataset.id)));
            svgEl.classList.add("map-focus");
        };
        const unfocus = () => svgEl.classList.remove("map-focus");
        const openNode = (id) => {
            const [k, v] = id.split(":");
            if (k === "s") location.hash = `#/?focus=c${v}`;
            else location.hash = `#/?${k}=${v}`;
        };
        g.querySelectorAll(".mnode").forEach((m) => {
            m.addEventListener("mouseenter", () => focusNode(m.dataset.id));
            m.addEventListener("mouseleave", () => selected ? focusNode(selected) : unfocus());
            m.addEventListener("focus", () => focusNode(m.dataset.id));
            m.addEventListener("click", () => {
                if (zp.wasDrag()) return;
                if (selected === m.dataset.id || window.matchMedia("(hover: hover)").matches) openNode(m.dataset.id);
                else { selected = m.dataset.id; focusNode(selected); }
            });
            m.addEventListener("keydown", (e) => { if (e.key === "Enter") openNode(m.dataset.id); });
        });
        // fit to width on small screens
        if (window.innerWidth <= 1000) { zp.t.k = 1; }
    }

    /* ---------- chrome: menu, search, header height ---------- */
    const menu = document.getElementById("menu-drawer");
    const menuBackdrop = document.getElementById("menu-backdrop");
    function closeMenu() {
        menu.classList.remove("open");
        menuBackdrop.classList.remove("open");
    }
    document.getElementById("menu-btn").addEventListener("click", (e) => {
        e.preventDefault();
        menu.classList.add("open");
        menuBackdrop.classList.add("open");
    });
    document.getElementById("menu-close").addEventListener("click", closeMenu);
    menuBackdrop.addEventListener("click", closeMenu);
    menu.querySelectorAll("a[data-nav]").forEach((a) => a.addEventListener("click", closeMenu));

    document.getElementById("search-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const term = document.getElementById("search-input").value;
        window.open("https://onestop4all.nfdi4earth.de/search?searchterm=" + encodeURIComponent(term), "_blank", "noreferrer");
    });

    function headerH() {
        return document.getElementById("site-header").offsetHeight;
    }
    function setLensVar() {
        const lb = document.getElementById("lensbar");
        if (lb) document.documentElement.style.setProperty("--lens-h", lb.offsetHeight + "px");
    }
    const setHeaderVar = () => document.documentElement.style.setProperty("--header-h", headerH() + "px");
    window.addEventListener("resize", () => {
        setHeaderVar();
        setLensVar();
    });
    setHeaderVar();

    render();
})();
