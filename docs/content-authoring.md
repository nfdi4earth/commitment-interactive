# Writing and editing content

All text in the app lives in [`src/packages/commitment/content/`](../src/packages/commitment/content/) as plain Markdown files. It sits inside the app's package so that it moves with the page into OneStop4All. Below, `content/` means this folder. You edit these files; a small script checks them and builds the data the app reads.

> The current annotations, perspective notes, topic steps and deep dives are **made-up example content**. Replace them, don't extend them as if they were real guidance.

## Where things are

| Folder or file | One file per | The file name is the… | Text below the header |
|---|---|---|---|
| `content/commitment.md` | – | – | The Commitment itself, unchanged |
| `content/statements/` | statement (`01.md` … `12.md`) | statement number | none |
| `content/annotations/` | note, explainer or deep dive on a passage | annotation ID | the annotation text |
| `content/deepdives/` | deep-dive page | deep-dive ID | lead paragraph and sections |
| `content/roles/` | perspective (student, researcher, …) | perspective ID | description and notes per statement |
| `content/topics/` | topic (proposal writing, …) | topic ID | the scrollytelling steps |
| `content/concepts/` | concept (openness, licensing, …) | concept ID | none |

IDs (file names) use lower case letters, digits and hyphens, e.g. `data-laws.md`. An ID is used in links (`?focus=data-laws`), so don't rename files without need.

## Workflow

1. Edit or add a file in `src/packages/commitment/content/`.
2. Look at your change in the app: while `pnpm dev` runs (http://localhost:5173/), every saved change shows up at once. Problems are listed in the terminal where `pnpm dev` runs, with file name and reason; the app keeps the last good content.
3. Run the check and build:

   ```bash
   pnpm build-content
   ```

   It either lists every problem with file name and reason, or writes the file the app reads, `src/packages/commitment/model/content.generated.json`.
4. Commit the content files **and** the generated file. Never edit it by hand.

`pnpm check-content` only checks and fails if the generated file is out of date. `pnpm test` and the pre-commit hook also report a stale `content.generated.json`.

## File format

Every file except `commitment.md` starts with a **header** (YAML "front matter") between two `---` lines, followed by Markdown text:

```markdown
---
target: c8
quote: open and permissive data and software licences
depth: deepdive
title: Open and permissive licences
concepts: [licensing, openness]
---

A licence tells others what they may do with your data or code. …
```

### Header rules

- One `field: value` per line. Lists are written `[a, b, c]`, or one item per line starting with `- ` (a dash and a space), as for `links` below.
- Use spaces, never tabs.
- Put a value in `"double quotes"` (or `'single quotes'`, with `''` for a `'` inside) if it
  - starts with `#`, `*`, `[`, `]`, `{`, `}`, `,`, `&`, `!`, `|`, `>`, `%`, `@` or `` ` ``, or with a quote that does not enclose the whole value, or with `-`, `?` or `:` followed by a space – this is why colours are written `colour: "#F1C129"`
  - contains a colon followed by a space, e.g. `label: "The Turing Way: Licensing"`
  - contains a space followed by `#`, e.g. `title: "Step #3"`
  - is text that consists only of digits (with or without a leading `-`), or is exactly `true` or `false`, e.g. `quote: "2024"` (without quotes, it would be read as a number or a yes/no value)
  - is a list item with `[` or `]` in it, e.g. `["[draft] notes"]`
- Inside `"double quotes"`, write a backslash as `\\`.
- Every field needs a value; leave out a field instead of leaving it empty.
- Links in the header are a list of `label` and `url` pairs, indented by two spaces:

  ```yaml
  links:
    - label: Creative Commons licence chooser
      url: https://chooser-beta.creativecommons.org/
  ```

- Unknown or misspelled fields are reported as errors, so a typo can't silently hide content.
- Notes to other editors: in the header, a line starting with `#` is ignored; in the text below it, HTML comments (`<!-- … -->`) are ignored.

### Markdown rules

The texts support a small part of Markdown:

| Write | Result |
|---|---|
| a blank line | new paragraph |
| `**bold**` | **bold** |
| `*italic*` or `_italic_` | *italic* |
| lines starting with `- ` | bulleted list |
| lines starting with `1. `, `2. `, … | numbered list |
| `[link text](https://…)` | link, opens in a new tab |
| `[link text](mailto:…)` | e-mail link |
| `[link text](#/deep-dive/licensing)` | link inside the app |

Headings, images, tables and raw HTML are **not** supported. HTML is reported as an error. Only `https://`, `http://`, `mailto:` and `#/` links are allowed.

## The Commitment text: `content/commitment.md`

This is the published Commitment, so **don't change its wording**. It has one `#` heading per part, each with a fixed ID in braces:

- `# Preamble {#preamble}`: the preamble paragraphs, which become targets `pre-1` … `pre-5`
- `# Introduction {#intro}`: target `intro`
- `# We commit to … {#boxA}` and `# We value … {#boxB}`: the two boxes. The heading text is the box title (target `boxA` / `boxB`), and the numbered list below it holds the statements (targets `c1` … `c12`).

Line breaks inside a paragraph or statement don't matter.

## Annotations: `content/annotations/`

An annotation attaches to a passage by **quoting** it. The Commitment text itself stays clean: no markers, no IDs.

| Field | Required | Meaning |
|---|---|---|
| `target` | yes | where the quote is: `pre-1` … `pre-5`, `intro`, `boxA`, `boxB`, `c1` … `c12`; `legend` for the three examples in the reading legend |
| `quote` | yes, except for `legend` | the exact words that are underlined |
| `occurrence` | no | if the quote appears more than once in the target: which one (`2` = the second) |
| `depth` | yes | `note` (hover tooltip, one or two sentences), `explainer` (popover, a paragraph or two with links) or `deepdive` (side panel, several paragraphs, figure) |
| `title` | yes | heading of the popover or panel |
| `roles`, `topics`, `concepts` | no | IDs of related perspectives, topics and concepts; they show as badges and make the passage light up when that badge is selected |
| `links` | no | further-reading links, shown as a list below the text |
| `deepdive` | no | ID of a deep-dive page; the side panel gets an "Open full deep dive" button |
| `statements` | no | statement numbers listed as "Related statements" (default: the statement the quote is in) |
| `figure` | no | one of the built-in placeholder figures: `licence`, `openness`, `fair` |

How quotes are matched:

- The quote must match the text **exactly**: same spelling, punctuation and capitalisation. Line breaks and repeated spaces don't matter.
- It matches **whole words** only. `NFDI` matches "NFDI" but not the start of "NFDI4Earth".
- If the words occur more than once in the target, quote a few more words or add `occurrence`.
- Quotes of different annotations in the same target must not overlap, and a quote must not cross a link.
- A quote must not cross the edge of `**bold**` or `*italic*` text. Quote either plain text only, or only text inside one bold or italic part, without the `**` or `*`. For example, in "At its core, **Earth System Sciences** aims to …", `Earth System Sciences` and `aims to` work, but `core, **Earth System` and `**Earth System Sciences** aims` don't. If the passage you want to annotate mixes styles, shorten the quote.

If the Commitment text ever changes (e.g. a version 1.1), the check reports every annotation whose quote no longer matches. Fix those quotes, and nothing else needs to change.

## Statements: `content/statements/01.md` … `12.md`

Only a header. The statement text itself is in `commitment.md`.

| Field | Meaning |
|---|---|
| `short` | short label used in the contents menu, the overview map and as card title |
| `roles`, `topics`, `concepts` | which perspectives, topics and concepts this statement concerns. This drives the highlighting, the counts and the overview map. |

## Perspectives: `content/roles/`

Header fields: `label`, `plural` (e.g. "Students"), `colour`, `icon`, `order` (position in badge rows and menus).

The text starts with a one-paragraph description of the audience. Then add one section per relevant statement:

```markdown
## Statement 8

Pick CC BY 4.0 for your data and MIT for your scripts.

- [ ] Read the licensing deep dive
```

The paragraph(s) are the note shown in the statement panel and on the perspective page. The last line, `- [ ] …`, is the one "first step" shown as a checkbox. Statements without a section count as "less directly relevant" for this perspective.

## Topics: `content/topics/`

Header fields: `label`, `colour`, `icon`, `order`, `known_from` (completes "You know this from: …").

The text is the list of scrollytelling steps, in reading order. Each heading ends with the statement it highlights:

```markdown
## Budget for curation {statement=10}

Data publication and curation take time and sometimes money. …
```

Without any steps, the topic page shows generated placeholder steps for all statements tagged with the topic.

## Concepts: `content/concepts/`

Only a header: `label`, `colour`, `order`. A concept gets a full page by writing a deep dive with `concept: <its ID>`.

## Deep dives: `content/deepdives/`

| Field | Required | Meaning |
|---|---|---|
| `title` | yes | page title |
| `concept` | yes | the concept this page belongs to; also used for "Highlight all in text" |
| `statements` | yes | statements listed under "Where this appears in the Commitment" |
| `anchors` | yes | annotation IDs listed as "Annotated phrases" |
| `links` | no | "Further reading" |
| `figure` | no | built-in figure, as for annotations |
| `placeholder` | no | `true` hides the page from menus until it is written |

The text starts with a lead paragraph, followed by sections with `## Heading`.

The real deep dives will be written from the starting points listed in `CLAUDE.md` ("Sources for real content later"), e.g. the boxes on https://nfdi4earth.de/commitment.

## Colours and icons

Use colours from the NFDI4Earth palette in `README.md#colour-palette`. Icons are names from the app's icon set: `cap`, `flask`, `building`, `people`, `scale`, `compass`, `pen`, `book`, `unlock`, `eye`, `chart`, `chat`, `bulb`, `map`, `user`, `text`, `link`. The check lists the valid names if you use an unknown one.

## What the check verifies

- every file has a valid header that follows the header rules above, with no unknown fields and all required fields
- every referenced perspective, topic, concept, statement, annotation and deep dive exists
- every quote is found exactly once (or at the given `occurrence`), with no overlaps, not inside a link and not across the edge of bold or italic text
- no raw HTML and only allowed link types
- statement numbers in `commitment.md` run from 1 without gaps, and every statement has a file in `content/statements/`
- `order` values are unique within roles, topics and concepts

The app reads the header with its own small parser for these rules, and the text with `react-markdown`, which OneStop4All also uses. It runs these checks when it builds `content.generated.json` (see "Workflow"); the browser only gets that file.
