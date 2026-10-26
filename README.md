# NFDI4Earth Commitment – interactive

An interactive, annotated version of the
[NFDI4Earth FAIRness and Openness Commitment](https://nfdi4earth.de/commitment).
It helps students, researchers, institutions and organisations understand what the 12 statements mean in their daily work, and how to put them into practice.

> **Status: early mock-up.** All explanations, deep dives and examples are **made-up placeholder content** that shows how the interaction could work. They are not official guidance from NFDI4Earth.

## Try the mock-up

Open [`mockup/index.html`](mockup/index.html) in a web browser. No installation is needed.

You can:
- read the commitment with annotations at different depths (hover, click, side panel)
- switch **perspectives** (student, researcher, institution, organisation/group) and **topics** (e.g. proposal writing, publishing, reviewing) to highlight the relevant parts
- follow deep dives on concepts such as licensing and openness
- explore a map that connects perspectives, topics and statements

## Design

The app follows the design of [NFDI4Earth OneStop4All](https://onestop4all.nfdi4earth.de/) and will eventually be integrated there as a page, similar to [the NFDI4Earth Label page](https://onestop4all.nfdi4earth.de/label).

## Colour palette

The mock-up re-uses colours that NFDI4Earth already uses. Base UI colours (links, buttons, headings, box banners) follow the OneStop4All theme. The facet colours below come from these sources:

- **Logos** (`NFDI4Earth_2Participate`, `_2Facilitate`, `_2Coordinate`, `_2Interoperate`, PNG, 2023). Colours were measured from the pixels, ignoring anti-aliasing.
- **Service bricks** (`NFDI4Earth_Rollup_2026_Jan_2_brick_colours.pdf`). Values were taken from the table and confirmed in the PDF's drawing commands.

| Hex | Source | Used in the mock-up for |
|---|---|---|
| `#05668D` | NFDI4Earth blue: all logos, OneStop4All primary colour | base UI colour; topic *Scholarly communication* |
| `#A4E5EC` | 2Facilitate, light (also the OneStop4All logo) | – |
| `#22C0D2` | 2Facilitate, mid (also OneStop4All focus colour) | perspective *Researcher* |
| `#FAE8B0` | 2Participate, light | "example content" badges |
| `#F1C129` | 2Participate, mid | perspective *Student* |
| `#E5AC0C` | 2Participate, dark (subtitle text) | topic *Research evaluation*; badge border |
| `#C5E7AE` | 2Coordinate, light | – |
| `#81CA4F` | 2Coordinate, mid (subtitle text) | perspective *Organisation / Group* |
| `#ADD7E6` | 2Interoperate, light | – |
| `#0485B1` | 2Interoperate, mid (subtitle text) | perspective *Institution* |
| `#E76F51` | Service brick: OneStop4All (burnt sienna) | topic *Proposal writing* |
| `#F4A261` | Service brick: User Support Network (sandy brown) | topic *Publishing* |
| `#E9C46A` | Service brick: Knowledge Hub (saffron) | topic *Open access* |
| `#AEAB65` | Service brick: EduTrain Portal (olive) | topic *Teaching & supervision* |
| `#2A9D8F` | Service brick: **Commitment** (persian green) | all concepts |
| `#264653` | Service brick: Label (charcoal) | topic *Reviewing* |

Notes:

- Text on coloured backgrounds is automatically dark or white, whichever reads better. Several palette colours (e.g. `#F1C129`, `#22C0D2`) are too light for white text.
- The palette has fewer distinct colours than there are perspectives, topics and concepts. So all concepts share the Commitment colour, and they are told apart by their labels.

## Possible future work

- Add more perspectives, for example **policy makers** and **institutional leadership**.

## The Commitment

NFDI4Earth Consortium (2024). *NFDI4Earth FAIRness and Openness Commitment* (Version 1.0). Zenodo. https://doi.org/10.5281/zenodo.10123880

Sign the Commitment at https://nfdi4earth.de/commit.

## How this was made

The mock-up in `mockup/` was generated over multiple prompts with [Claude Code](https://claude.com/claude-code) (Anthropic) in October 2026. The prompts and the review of each iteration came from Daniel Nüst. It builds on:

- **OneStop4All implementation**, upstream commit `b39aaff` (v1.11.2), <https://git.rwth-aachen.de/nfdi4earth/onestop4all/onestop4all-implementation> (Apache-2.0). Layout, theme tokens, header and footer structure, the logo SVGs, the icons and the images in `mockup/assets/` are taken or adapted from it.
- **Commitment text** from `FAIRness-and-Openness-Commitment/NFDI4Earth_FAIRness-and-Openness-Commitment.source.md` in the [NFDI4Earth deliverables repository](https://git.rwth-aachen.de/nfdi4earth/crosstopics/nfdi4earth-deliverables) (CC BY 4.0).
- **Colour palette:** NFDI4Earth task-area logos and the 2026 service rollup colours (see [Colour palette](#colour-palette)).

All annotations, perspective notes, topic steps and deep dives are made-up example content written during this process.

## License

- **Code:** [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0). It is based on the OneStop4All implementation.
- **Commitment text and content:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

This work is funded by the German Research Foundation (DFG) through NFDI4Earth (DFG project no. 460036893).
