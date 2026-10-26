/* Mock-up data for the interactive NFDI4Earth Commitment.
 * Commitment text: NFDI4Earth Consortium (2024), doi:10.5281/zenodo.10123880, CC-BY 4.0.
 * All annotations, perspective notes, topic steps and deep dives are FAKE example content.
 * Inline markup: [[annotation-id|text]] marks an annotated span.
 */
window.DATA = {};

/* Colours re-use the NFDI4Earth palette, see README.md#colour-palette */
DATA.roles = [
    { id: "student", label: "Student", plural: "Students", colour: "#F1C129", icon: "cap",
      blurb: "You are starting to work with data – in coursework, a thesis or as a student assistant." },
    { id: "researcher", label: "Researcher", plural: "Researchers", colour: "#22C0D2", icon: "flask",
      blurb: "You collect, analyse and publish data, write proposals and review the work of others." },
    { id: "institution", label: "Institution", plural: "Institutions", colour: "#0485B1", icon: "building",
      blurb: "Universities, research centres and agencies that set policies, run infrastructure and evaluate research." },
    { id: "organisation", label: "Organisation / Group", plural: "Organisations & groups", colour: "#81CA4F", icon: "people",
      blurb: "Research groups, departments, societies and networks that shape everyday practice." }
];

DATA.topics = [
    { id: "proposal-writing", label: "Proposal writing", colour: "#E76F51", icon: "pen",
      knownFrom: "DFG and EU proposals, data management sections, budget planning" },
    { id: "publishing", label: "Publishing", colour: "#F4A261", icon: "book",
      knownFrom: "submitting papers, data availability statements, supplementary material" },
    { id: "open-access", label: "Open access", colour: "#E9C46A", icon: "unlock",
      knownFrom: "APCs, green and gold OA, institutional repositories" },
    { id: "reviewing", label: "Reviewing", colour: "#264653", icon: "eye",
      knownFrom: "peer review of papers, data and proposals" },
    { id: "research-evaluation", label: "Research evaluation", colour: "#E5AC0C", icon: "chart",
      knownFrom: "hiring, tenure and funding committees, CVs, indicators" },
    { id: "scholarly-communication", label: "Scholarly communication", colour: "#05668D", icon: "chat",
      knownFrom: "conferences, preprints, social media, science communication" },
    { id: "teaching", label: "Teaching & supervision", colour: "#AEAB65", icon: "cap",
      knownFrom: "lectures, thesis supervision, summer schools" }
];

DATA.concepts = [
    { id: "openness", label: "Openness", colour: "#2A9D8F", deepdive: true },
    { id: "fairness", label: "FAIRness", colour: "#2A9D8F", deepdive: false },
    { id: "licensing", label: "Licensing", colour: "#2A9D8F", deepdive: true },
    { id: "credit", label: "Credit & citation", colour: "#2A9D8F", deepdive: false },
    { id: "infrastructure", label: "Infrastructure", colour: "#2A9D8F", deepdive: false },
    { id: "standards", label: "Standards", colour: "#2A9D8F", deepdive: false }
];

DATA.preamble = [
    "<b>Science advances when knowledge is openly shared.</b> In response to the growing geo-societal challenges of our planet, and in light of the [[sdgs|UN Sustainable Development Goals]], trustworthy research practices require the open sharing of well-documented data and their provenance in an ethical manner. This requires a cultural and systemic change that evolves current practices and that promotes solutions for data sharing and improvements of incentives within and beyond the Earth System Sciences. <b>Only by working together as a community can this happen.</b>",
    "At its core, <b>Earth System Sciences</b> aims to unravel the complex processes that drive the Earth as a dynamic system. This includes the fluxes of matter and energy in the five main spheres - the geosphere, hydrosphere (including the cryosphere), atmosphere, biosphere and anthroposphere (cf. Leopoldina's report <a href=\"https://doi.org/10.26164/LEOPOLDINA_03_00591\" target=\"_blank\" rel=\"noreferrer\">Earth System Science: Discovery, Diagnosis, and Solutions in Times of Global Change</a>).",
    "Data acquisition, simulation, integration, and analysis are crucial to understanding these complex processes. The Earth System Sciences community already embraces many Open Science practices, including making its manifold types of <b>research outputs [[fair-principles|findable, accessible, interoperable, and reusable]]</b> for humans and machines (as stated in the <a href=\"https://doi.org/10.1038/sdata.2016.18\" target=\"_blank\" rel=\"noreferrer\">The FAIR Guiding Principles for scientific data management and stewardship</a>). Equal priority should be given to data management and analysis tools that enable data-driven methods. Efficient and effective use of research outputs, facilities, and funding, as well as appropriate [[reward-systems|reward systems and recognition of all research activities]] are equally important parts of Earth System Sciences data activities.",
    "<b><a href=\"https://www.nfdi4earth.de/\" target=\"_blank\" rel=\"noreferrer\">NFDI4Earth</a></b> - the consortium for the Earth System Sciences within the National Research Data Infrastructure (<a href=\"https://www.nfdi.de/?lang=en\" target=\"_blank\" rel=\"noreferrer\">NFDI</a>) - aims to become a central facilitator for research data management in the German Earth System Sciences community, enabling more intensive and widespread open knowledge sharing. The <b>mission of NFDI4Earth is to provide easy, efficient, open and, as far as possible, unrestricted and standardised access to all relevant Earth system data, scientific data management and data analysis services, and to ensure sustainable and quality-assured research data management infrastructures</b>. This commitment will help to engage the NFDI4Earth community in shaping, promoting, and implementing the NFDI4Earth agenda. In the longer term, the results of this work will also help to drive the much needed change in the way research is evaluated, as expressed in the [[dora-coara|DORA and CoARA declarations]].",
    "<b>NFDI4Earth invites</b> institutions and individual researchers, laboratories, infrastructure providers, publishers, academic societies, government agencies, administrations, industry, funders, and research organisations to sign the following statement of commitment and become ambassadors for change towards more FAIR and Open data practices in Earth System Sciences. To support this shift, the NFDI4Earth website provides background information and guidance for different stakeholders."
];

DATA.intro = "Signatories of the NFDI4Earth FAIRness and Openness Commitment pledge to support NFDI4Earth's mission, products, and services. The signature of members and/or representatives of the Earth System Sciences community is a public signal of agreement with the goals and values of the Commitment. By collectively supporting the Commitment, the signatories realise NFDI4Earth as a community of practice, taking into account the full range of expertise and all relevant user groups of Earth System Sciences for a sustainable shift towards more FAIR and Open Research.";

DATA.boxes = [
    { id: "boxA", title: "[[we-commit|We commit]] to advance FAIRness and Openness in Earth System Sciences.", from: 1, to: 9 },
    { id: "boxB", title: "We value data infrastructures and [[data-experts|data experts]].", from: 10, to: 12 }
];

/* short = label used in minimap, map and condensed views */
DATA.statements = [
    { n: 1, short: "NFDI mission", roles: ["institution", "organisation", "researcher"], topics: ["proposal-writing"], concepts: ["infrastructure", "openness"],
      text: "Commit to the mission of [[nfdi|NFDI]] in bringing together research communities to provide data for the common good, and the recognition of the role of NFDI4Earth as a [[facilitator|facilitator of sustainable and collaboratively developed solutions]] in Earth System Sciences." },
    { n: 2, short: "Open Science declarations", roles: ["researcher", "institution", "organisation"], topics: ["research-evaluation", "scholarly-communication", "open-access"], concepts: ["openness"],
      text: "Support and uphold, [[where-appropriate|where appropriate and possible]], the principles and values outlined in [[os-declarations|existing Open Science declarations and statements]]." },
    { n: 3, short: "Data laws & acts", roles: ["researcher", "student", "institution"], topics: ["proposal-writing", "publishing"], concepts: ["licensing", "openness"],
      text: "Be familiar with [[data-laws|relevant data laws and acts]], especially those related to [[geospatial|geospatial data]], in both national and European jurisdictions. These laws facilitate data sharing at both national and international levels." },
    { n: 4, short: "Give credit", roles: ["student", "researcher", "organisation"], topics: ["publishing", "reviewing", "research-evaluation", "scholarly-communication"], concepts: ["credit"],
      text: "Give credit to [[all-sources|all sources underlying our research findings]] and, whenever possible, credit is given through [[citations|proper citations]]." },
    { n: 5, short: "Domain repositories", roles: ["researcher", "student"], topics: ["publishing", "open-access", "proposal-writing", "reviewing"], concepts: ["fairness", "infrastructure"],
      text: "Choose to publish Earth System Sciences data in [[domain-repos|Earth System Sciences domain repositories]] and other suitable research infrastructures that meet [[four-aspects|all four aspects of FAIR principles]] and consider the specific characteristics of Earth System Sciences data." },
    { n: 6, short: "Education & training", roles: ["student", "institution", "organisation"], topics: ["teaching"], concepts: ["openness", "fairness"],
      text: "Strengthen FAIR and Open Data practices by supporting [[edu-networks|educational networks]], robust training programmes, and the production of [[edu-materials|educational materials]] that promote transparency and accessibility of research outputs." },
    { n: 7, short: "Data Management Plans", roles: ["researcher", "student", "institution"], topics: ["proposal-writing", "teaching"], concepts: ["fairness"],
      text: "Adopt [[dmps|Data Management Plans]] as important tools for all research projects. These plans are invaluable for strategically planning data documentation, publication, and collaboratively monitoring data management activities. We seek and consider [[expert-curation|expert curation and guidance]] for them." },
    { n: 8, short: "Open licences", roles: ["researcher", "student", "institution"], topics: ["publishing", "open-access", "reviewing"], concepts: ["licensing", "openness"],
      text: "[[where-possible|Where possible]], use [[licences|open and permissive data and software licences]] that legally enable the envisioned free and open sharing of Earth System Sciences data." },
    { n: 9, short: "Governing bodies", roles: ["institution", "organisation"], topics: ["research-evaluation"], concepts: ["standards"],
      text: "Support and align scientific work with [[governing-bodies|governing bodies and organisations]] that advance the underlying causes of this commitment." },
    { n: 10, short: "Sustain repositories", roles: ["institution", "researcher"], topics: ["proposal-writing", "research-evaluation"], concepts: ["infrastructure"],
      text: "Recognise the vital role that Earth System Sciences domain repositories and their [[curation-services|curation services]] play in achieving and preserving the highest possible FAIRness and Openness in the Earth System Sciences. As researchers, institutions, and funding agencies, we endeavour to ensure the [[sustainability|sustainability of these repositories]] and other relevant research infrastructures." },
    { n: 11, short: "Data curators", roles: ["researcher", "institution", "organisation"], topics: ["publishing"], concepts: ["infrastructure", "credit", "fairness"],
      text: "Collaborate with [[curators|data curators and repository managers]] and leverage their expertise to make Earth System Sciences research outputs transparent, machine-readable, interoperable, and re-usable in the long term. They use diverse approaches, such as the [[label|NFDI4Earth Label]], to document and advance interoperability across data repositories." },
    { n: 12, short: "International standards", roles: ["researcher", "organisation", "institution"], topics: ["reviewing", "publishing"], concepts: ["standards", "fairness"],
      text: "Adhere to and contribute to [[standards|international standards]] for harmonising Earth System Sciences data, metadata, data quality, and application programming interfaces (APIs). Support their implementation and development across research infrastructures, as this is crucial for effective interdisciplinary research and advancements in novel analysis methods such as [[ai-ml|Artificial Intelligence or Machine Learning (AI &amp; ML)]]." }
];

/* depth: note → tooltip, explainer → popover, deepdive → side panel */
DATA.annotations = {
    /* box headings */
    "we-commit": { depth: "explainer", title: "What does “we commit” mean?", roles: ["student", "researcher", "institution", "organisation"], concepts: ["openness"],
        body: "<p>Signing is a <b>public, voluntary statement of intent</b> by individuals, groups and organisations. It is not a contract and has no reporting duties – but it makes your support visible and invites others to join.</p><p>[Example content] Each signatory decides which steps fit their role; the perspectives in this app suggest where to start.</p>",
        links: [["Sign the Commitment", "https://nfdi4earth.de/commit"], ["List of signatories", "https://nfdi4earth.de/commitment"]] },
    "data-experts": { depth: "deepdive", title: "Data experts", statements: [10, 11, 12], roles: ["institution", "researcher", "organisation"], topics: ["research-evaluation", "proposal-writing"], concepts: ["infrastructure", "credit"],
        body: "<p>[Example content] <b>Data experts</b> are the people who make FAIR data possible: data curators, data stewards, repository managers, research software engineers and data scientists in infrastructure teams.</p><p>Their work is often invisible in publications and evaluations. Valuing them means <b>crediting</b> them (e.g. with the CRediT role “Data curation”), <b>involving</b> them early in projects, and <b>creating career paths</b> for them at institutions.</p><p>Statements 10–12 spell out how: sustaining repositories, collaborating with curators and building on shared standards.</p>",
        links: [["CRediT taxonomy", "https://credit.niso.org/"], ["NFDI4Earth User Support Network", "https://www.nfdi4earth.de/"]] },
    /* legend: each sample explains its own interaction */
    "legend-note": { depth: "note", title: "Short note",
        body: "Hover over (or tap) a dotted word to see a one-sentence clarification – like this one." },
    "legend-explainer": { depth: "explainer", title: "Explainer",
        body: "<p>A click on a word with a <b>half-filled dot</b> opens a box like this one: a short paragraph, often with external links and the perspectives, topics or concepts it relates to.</p><p>Click a coloured badge to highlight all related parts of the Commitment, or use <b>Copy link</b> to share exactly this place.</p>",
        links: [["Example: NFDI4Earth OneStop4All", "https://onestop4all.nfdi4earth.de/"]] },
    "legend-deepdive": { depth: "deepdive", title: "Deep dive",
        body: "<p>A word with a <b>filled dot</b> opens this side panel. Deep dives give you several paragraphs, figures and further reading on one subject, while the Commitment text stays visible next to it.</p><p>If a full deep-dive page exists for a concept, a button at the bottom takes you there – try the one in statement 8, “open and permissive data and software licences”.</p><p>Close the panel with × or the Escape key, or by clicking outside of it.</p>" },
    "sdgs": { depth: "note", title: "UN Sustainable Development Goals",
        body: "17 global goals adopted by the UN in 2015. Many of them (e.g. climate action, life below water) depend directly on Earth system data.", concepts: ["openness"] },
    "fair-principles": { depth: "explainer", title: "The FAIR principles", concepts: ["fairness"], roles: ["student", "researcher"],
        body: "<p>FAIR stands for <b>Findable, Accessible, Interoperable, Reusable</b>. FAIR is about machine-actionability – FAIR data is not necessarily open data.</p><p>Example: a dataset with a DOI, rich metadata and a clear licence in a domain repository is a good start.</p>",
        links: [["Wilkinson et al. (2016)", "https://doi.org/10.1038/sdata.2016.18"], ["GO FAIR", "https://www.go-fair.org/"]] },
    "reward-systems": { depth: "note", title: "Reward systems",
        body: "Recognising datasets, software and curation work in hiring and evaluation – not only journal articles.", topics: ["research-evaluation"] },
    "dora-coara": { depth: "explainer", title: "DORA and CoARA", topics: ["research-evaluation"], roles: ["institution", "researcher"],
        body: "<p>The <b>San Francisco Declaration on Research Assessment</b> (DORA) and the <b>Coalition for Advancing Research Assessment</b> (CoARA) call for evaluating research on its merits rather than on journal-based metrics.</p><p>For you this may mean: list datasets and software in your CV, and use narrative CVs where offered.</p>",
        links: [["DORA", "https://sfdora.org/"], ["CoARA", "https://coara.eu/"]] },
    "nfdi": { depth: "note", title: "NFDI",
        body: "The German National Research Data Infrastructure: 26 consortia across all disciplines, funded by federal and state governments.", links: [["nfdi.de", "https://www.nfdi.de/?lang=en"]] },
    "facilitator": { depth: "explainer", title: "NFDI4Earth as facilitator", roles: ["organisation", "institution"], concepts: ["infrastructure"],
        body: "<p>NFDI4Earth does not replace existing infrastructures. It connects them – e.g. via the <b>OneStop4All</b> search, the <b>Living Handbook</b>, the <b>User Support Network</b> and the <b>Label</b>.</p>",
        links: [["OneStop4All", "https://onestop4all.nfdi4earth.de/"]] },
    "where-appropriate": { depth: "note", title: "“Where appropriate and possible”", concepts: ["openness"],
        body: "Openness is the default, but legal, ethical or contractual reasons can justify exceptions: as open as possible, as closed as necessary." },
    "os-declarations": { depth: "explainer", title: "Open Science declarations", concepts: ["openness"], roles: ["researcher", "institution"], topics: ["scholarly-communication"],
        body: "<p>A small selection of declarations the commitment builds on. The real app will use the curated list from the commitment website.</p>",
        links: [["UNESCO Recommendation on Open Science (2021)", "https://doi.org/10.54677/MNMH8546"], ["Beijing Declaration on Research Data", "https://codata.org/"], ["COPDESS", "https://copdess.org/"]] },
    "data-laws": { depth: "explainer", title: "Data laws and acts", concepts: ["licensing"], roles: ["researcher", "institution"], topics: ["proposal-writing"],
        body: "<p>Relevant examples include the <b>GDPR</b> (personal data), the <b>INSPIRE Directive</b> (spatial data infrastructure in the EU) and the German <b>Geodata Access Act (GeoZG)</b>.</p><p>Tip: check early whether your data contains personal information, e.g. GPS tracks or interview locations.</p>",
        links: [["INSPIRE", "https://eur-lex.europa.eu/eli/dir/2007/2/oj"], ["GDPR", "https://eur-lex.europa.eu/eli/reg/2016/679/oj"]] },
    "geospatial": { depth: "note", title: "Geospatial data", body: "Data with a location – from sample coordinates to satellite imagery. Location can make data personal." },
    "all-sources": { depth: "note", title: "All sources", concepts: ["credit"],
        body: "Not just papers: datasets, software, samples, models, workflows and the people who curated them." },
    "citations": { depth: "explainer", title: "Proper citations", concepts: ["credit"], roles: ["student", "researcher"], topics: ["publishing", "reviewing"],
        body: "<p>Cite data like a paper: <i>Author (Year). Title. Publisher/Repository. DOI.</i> Put the citation in the reference list, not only in the text.</p><p>Reviewers can ask for missing data citations.</p>",
        links: [["FORCE11 Data Citation Principles", "https://doi.org/10.25490/a97f-egyk"]] },
    "domain-repos": { depth: "explainer", title: "ESS domain repositories", concepts: ["infrastructure", "fairness"], roles: ["researcher", "student"], topics: ["publishing"],
        body: "<p>Domain repositories (e.g. PANGAEA, GFZ Data Services, BonaRes) know your data types, offer curation and use community metadata standards.</p><p>Find suitable repositories in OneStop4All.</p>",
        links: [["Search repositories in OneStop4All", "https://onestop4all.nfdi4earth.de/search"]] },
    "four-aspects": { depth: "deepdive", concept: "fairness", title: "All four aspects of FAIR", concepts: ["fairness"], roles: ["researcher"],
        body: "<p>Many repositories are good at <b>F</b> and <b>A</b> (DOIs, landing pages) but weaker at <b>I</b> and <b>R</b> (machine-readable formats, vocabularies, licences, provenance).</p><p>The commitment asks you to choose repositories that cover all four. The NFDI4Earth Label is one way to see this at a glance.</p><p>[Example content – a real deep dive would include checklists per data type.]</p>",
        figure: "fair" },
    "edu-networks": { depth: "note", title: "Educational networks", topics: ["teaching"], body: "E.g. the NFDI4Earth EduTrain community and university data literacy networks." },
    "edu-materials": { depth: "note", title: "Educational materials", topics: ["teaching"], body: "Open Educational Resources (OER), licensed so that others can reuse and adapt them." },
    "dmps": { depth: "explainer", title: "Data Management Plans", topics: ["proposal-writing"], roles: ["researcher", "student", "institution"], concepts: ["fairness"],
        body: "<p>A DMP describes what data you will create, how you document, store, share and archive it, and who is responsible.</p><p>Many funders now require one; the DFG asks for a data handling section in proposals.</p>",
        links: [["RDMO", "https://rdmorganiser.github.io/"], ["DFG (see guidelines on research data)", "https://www.dfg.de/en"]] },
    "expert-curation": { depth: "note", title: "Expert curation", body: "Ask your repository's curators or the NFDI4Earth User Support Network early – before the data is collected." },
    "where-possible": { depth: "note", title: "“Where possible”", concepts: ["openness", "licensing"],
        body: "Some data cannot be openly licensed (third-party rights, personal data). The commitment asks for open licences as the default." },
    "licences": { depth: "deepdive", concept: "licensing", title: "Open and permissive licences", concepts: ["licensing", "openness"], roles: ["researcher", "student", "institution"], topics: ["publishing", "open-access"],
        body: "<p>A licence tells others what they may do with your data or code. Without one, the default is “all rights reserved” – even if the file is publicly downloadable.</p><p><b>Data:</b> CC BY 4.0 or CC0 are the most common open choices. <b>Software:</b> permissive licences such as MIT or Apache-2.0 allow broad reuse.</p><p>Avoid “non-commercial” (NC) and “no derivatives” (ND) clauses for research data – they block reuse in many projects.</p>",
        links: [["Creative Commons licence chooser", "https://chooser-beta.creativecommons.org/"], ["choosealicense.com", "https://choosealicense.com/"], ["The Turing Way: Licensing", "https://book.the-turing-way.org/reproducible-research/licensing"]],
        figure: "licence" },
    "governing-bodies": { depth: "explainer", title: "Governing bodies", concepts: ["standards"], roles: ["institution", "organisation"],
        body: "<p>Bodies such as the <b>RDA</b>, <b>OGC</b>, <b>ISO/TC 211</b>, <b>EOSC</b> and <b>GDI-DE</b> develop the standards and policies the commitment refers to.</p>",
        links: [["RDA", "https://www.rd-alliance.org/"], ["OGC", "https://www.ogc.org/"]] },
    "curation-services": { depth: "note", title: "Curation services", concepts: ["infrastructure"], body: "Checking, enriching and documenting submitted data – often invisible but essential work." },
    "sustainability": { depth: "explainer", title: "Sustainable repositories", topics: ["proposal-writing", "research-evaluation"], roles: ["institution", "researcher"], concepts: ["infrastructure"],
        body: "<p>Repositories need long-term funding. As a researcher you can budget data publication costs in proposals; as an institution you can co-fund domain repositories.</p>" },
    "curators": { depth: "explainer", title: "Data curators and repository managers", concepts: ["credit", "infrastructure"], roles: ["researcher"],
        body: "<p>Involve curators early. Acknowledge them – or invite them as co-authors of data papers where their contribution warrants it (see CRediT role “Data curation”).</p>",
        links: [["CRediT taxonomy", "https://credit.niso.org/"]] },
    "label": { depth: "explainer", title: "NFDI4Earth Label", concepts: ["fairness", "infrastructure"], roles: ["institution", "researcher"],
        body: "<p>The Label documents how repositories implement FAIR and interoperability criteria, helping researchers choose where to publish.</p>",
        links: [["NFDI4Earth Label in OneStop4All", "https://onestop4all.nfdi4earth.de/label"]] },
    "standards": { depth: "explainer", title: "International standards", concepts: ["standards", "fairness"], topics: ["reviewing"], roles: ["researcher", "organisation"],
        body: "<p>Examples: <b>CF conventions</b> for netCDF, <b>ISO 19115</b> for geospatial metadata, <b>OGC API</b> for web services, <b>DCAT/GeoDCAT</b> for catalogues.</p><p>As a reviewer, you can check whether the data uses community formats.</p>" },
    "ai-ml": { depth: "note", title: "AI & ML", body: "Machine learning needs large, consistently described training data – standards make datasets combinable." }
};

/* Statement-level notes per perspective (shown in the statement side panel and on perspective pages). FAKE. */
DATA.perspectiveNotes = {
    student: {
        3: ["Check whether your thesis data includes personal or restricted data.", "Ask your supervisor about data agreements"],
        4: ["Cite datasets and software in your thesis like papers.", "Find the DOI of one dataset you use"],
        5: ["Publish your thesis data in a domain repository, not only as a PDF appendix.", "Look up the repository your group uses"],
        6: ["Join a data literacy course or summer school.", "Bookmark one OER course"],
        7: ["Write a one-page DMP for your thesis.", "Use the DMP template of your university"],
        8: ["Pick CC BY 4.0 for your data and MIT for your scripts.", "Read the licensing deep dive"]
    },
    researcher: {
        1: ["Mention relevant NFDI4Earth services in your proposals.", "Search OneStop4All for a service you could use"],
        2: ["Know which declarations your institution has signed.", "Check if your institution signed DORA"],
        3: ["Plan legal checks in your DMP.", "List data with access restrictions"],
        4: ["Cite data and software in the reference list.", "Add data citations to your next paper"],
        5: ["Choose a domain repository that covers all four FAIR aspects.", "Compare two repositories via the Label"],
        7: ["Write and update a DMP for every project.", "Schedule a DMP review at month 12"],
        8: ["Default to CC BY 4.0 / CC0 for data, permissive licences for code.", "Add a LICENSE file to your repos"],
        10: ["Budget data publication costs in proposals.", "Add a curation line to your next budget"],
        11: ["Involve curators early and credit them.", "Contact a repository before data collection"],
        12: ["Use community formats and metadata standards.", "Check your data against CF conventions"]
    },
    institution: {
        1: ["Sign the commitment as an institution.", "Nominate a contact person"],
        2: ["Align institutional policies with DORA/CoARA.", "Review hiring criteria"],
        3: ["Offer legal advice on data sharing.", "Publish a data law FAQ"],
        6: ["Fund training programmes and PhD school modules.", "Add RDM to the PhD curriculum"],
        7: ["Offer DMP consulting.", "Provide an institutional DMP template"],
        8: ["Adopt an open licensing policy.", "Set CC BY as default in the repository"],
        9: ["Engage in standards bodies.", "Join an RDA interest group"],
        10: ["Co-fund domain repositories.", "Include repositories in the strategy"],
        11: ["Create career paths for data stewards.", "Advertise a data steward position"],
        12: ["Require standard-compliant APIs in procurement.", "Check OGC API support in new systems"]
    },
    organisation: {
        1: ["Sign the commitment as a group.", "Discuss it in the next group meeting"],
        2: ["Agree on group-wide Open Science practices.", "Write a group data policy"],
        4: ["Make data citation a group norm.", "Add a citation check to internal review"],
        6: ["Share training material openly.", "Publish slides under CC BY"],
        9: ["Align with societies and networks.", "Link your society's policy"],
        11: ["Collaborate with curators on data papers.", "Invite a curator to a group meeting"],
        12: ["Contribute to community standards.", "Comment on a draft standard"]
    }
};

/* Scrollytelling steps per topic. FAKE. Topics without custom steps get generated ones. */
DATA.topicSteps = {
    "proposal-writing": [
        { n: 7, title: "The data management section", text: "Most funders ask how you will handle data. Statement 7 asks you to adopt a DMP – write the proposal section as a short DMP and refer to RDMO or your funder's template." },
        { n: 5, title: "Name your target repository", text: "Reviewers like concrete plans. Name the ESS domain repository where you will publish data (statement 5), and why it fits your data types." },
        { n: 10, title: "Budget for curation", text: "Data publication and curation take time and sometimes money. Statement 10 asks us to sustain repositories – include these costs in your budget." },
        { n: 3, title: "Legal aspects", text: "Plan for data laws early (statement 3): personal data, INSPIRE-relevant data or third-party data need a strategy before the project starts." },
        { n: 1, title: "Use NFDI services", text: "Mentioning existing NFDI4Earth services (statement 1) shows you build on community infrastructure instead of reinventing it." }
    ],
    "publishing": [
        { n: 5, title: "Data first", text: "Deposit the data in a domain repository before you submit the paper, so the data DOI can go into the data availability statement." },
        { n: 8, title: "Choose a licence", text: "Pick an open licence for data (CC BY 4.0 / CC0) and code (e.g. MIT). See the licensing deep dive." },
        { n: 4, title: "Cite your sources", text: "Cite all datasets and software you used in the reference list – including your own." },
        { n: 11, title: "Work with curators", text: "Repository curators will check your submission. Plan time for their feedback." },
        { n: 12, title: "Use standard formats", text: "Community formats make your data reusable – and reviewers increasingly check this." },
        { n: 3, title: "Check legal restrictions", text: "Make sure you are allowed to publish all data, especially third-party or personal data." }
    ]
};

DATA.deepdives = {
    licensing: {
        title: "Licensing data and software", concept: "licensing", anchors: ["licences", "where-possible", "data-laws"], statements: [8, 3, 6],
        lead: "Why the commitment asks for open and permissive licences – and how to choose one.",
        sections: [
            ["No licence ≠ open", "If you publish data without a licence, others legally cannot reuse it, even if they can download it. A licence turns “visible” into “reusable”."],
            ["Data licences", "For research data, CC BY 4.0 (attribution) and CC0 (public domain dedication) are the most widely used. Many ESS repositories default to CC BY 4.0."],
            ["Software licences", "Permissive licences (MIT, Apache-2.0, BSD) allow reuse in almost any context. Copyleft licences (GPL) require derived work to stay open."],
            ["When open is not possible", "Personal data, third-party rights or contracts can prevent open licensing. Document the reason and use the most open option that is possible (statement 8: “where possible”)."],
            ["Practices what it preaches", "NFDI4Earth audits the licences of its own software repositories. [Example: a chart of licence types across NFDI4Earth GitLab projects would go here.]"]
        ],
        links: [["Creative Commons licences", "https://creativecommons.org/licenses/"], ["choosealicense.com", "https://choosealicense.com/"], ["The Turing Way: Licensing", "https://book.the-turing-way.org/reproducible-research/licensing"], ["REUSE (FSFE)", "https://reuse.software/"]],
        figure: "licence"
    },
    openness: {
        title: "Openness", concept: "openness", anchors: ["where-appropriate", "where-possible", "os-declarations"], statements: [2, 6, 8, 1, 3],
        lead: "“As open as possible, as closed as necessary” – how openness runs through the whole commitment.",
        sections: [
            ["A thread, not a statement", "No single statement is “the openness statement”. Openness appears in the preamble, in statements 1, 2, 6 and 8, and implicitly in the call for sharing."],
            ["Open is a spectrum", "Between closed and fully open there are many steps: embargoed, restricted access, open with attribution, public domain. The commitment asks you to move as far to the open end as you responsibly can."],
            ["Openness and FAIR", "FAIR data is not necessarily open, and open data is not necessarily FAIR. The commitment asks for both."],
            ["Openness for institutions", "Institutions enable openness through policies, infrastructure and recognition in research evaluation (DORA, CoARA)."]
        ],
        links: [["UNESCO Recommendation on Open Science", "https://doi.org/10.54677/MNMH8546"], ["Open Definition", "https://opendefinition.org/"]],
        figure: "openness"
    },
    fairness: {
        title: "FAIRness", concept: "fairness", anchors: ["fair-principles", "four-aspects"], statements: [5, 7, 11, 12], placeholder: true,
        lead: "Placeholder deep dive – coming soon.", sections: [["Coming soon", "This deep dive is a placeholder in the mock-up."]], links: []
    }
};
