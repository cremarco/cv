---
theme: apple-basic
layout: cover
routeAlias: intro
class: intro-slide
title: Marco Cremaschi
author: Marco Cremaschi
aspectRatio: 16/9
canvasWidth: 1280
colorSchema: dark
background: images/aipp-cover-bg.png
duration: 15min
timer: countdown
drawings:
  persist: false
mdc: true
preloadImages: false
info: |
  Public discussion of qualifications and publications.
  Procedure 2025-RTT-095, Department of Informatics, Systems and Communication.
  GSD 01/INFO-01, SSD INFO-01/A.
---

<section class="intro-cover title-only-cover">
  <div class="intro-copy">
    <h1>
      Marco Cremaschi
    </h1>
    <p class="intro-subtitle">
      Credentials Review
    </p>
  </div>
  <div class="intro-date">June 29, 2026</div>
</section>

<!--
Good morning. In this presentation I summarize the qualifications and publications supporting the application for procedure RTT-095. The common thread is a computer science profile fully positioned within SSD INFO-01/A, but built through interdisciplinary work: methods, models and systems for data, artificial intelligence and applications in complex domains, with a strong component of transfer and validation.
-->

---
layout: default
routeAlias: posizionamento
class: section-01 title-tight
---

# Scientific Positioning

<section class="trajectory-grid">
  <div class="bento-card trajectory-card">
    <div>
      <div class="bento-eyebrow">Axis 1</div>
      <div class="bento-title">Semantic AI and Knowledge Graphs</div>
    </div>
    <ul>
      <li>Semantic interpretation of tables and semi-structured data.</li>
      <li>Entity retrieval, disambiguation, annotation and enrichment.</li>
      <li>Datasets, tools and international challenges such as SemTab.</li>
    </ul>
  </div>
  <div class="bento-card trajectory-card">
    <div>
      <div class="bento-eyebrow">Axis 2</div>
      <div class="bento-title">AI for Digital Mental Health</div>
    </div>
    <ul>
      <li>RAG and LLMs grounded in clinical taxonomies such as ICD-11.</li>
      <li>Digital phenotyping, monitoring, adherence and decision support.</li>
      <li>Systems for training, assessment and continuity of care.</li>
    </ul>
  </div>
  <div class="bento-card trajectory-card">
    <div>
      <div class="bento-eyebrow">Axis 3</div>
      <div class="bento-title">Systems, Data and Transfer</div>
    </div>
    <ul>
      <li>Data and ML architectures for industrial and social applications.</li>
      <li>National and European projects, COST actions and industry collaboration.</li>
      <li>University spin-off activity and validation in real-world contexts.</li>
    </ul>
  </div>
</section>

<!--
The profile is organized around three axes. The first is the established core: Semantic AI, knowledge graphs and semantic interpretation of data. The second is the more recent trajectory: AI and LLMs for digital mental health, with attention to clinical utility, safety and evaluation. The third connects research and systems: data architectures, projects, technology transfer and collaboration with companies. These are distinct but connected axes: the common thread is the design of computer-based systems that transform heterogeneous data into decisions, services and usable knowledge.
-->

---
layout: default
routeAlias: traiettoria
class: section-02
---

# Academic and Research Trajectory

<section class="timeline">
  <div class="timeline-item" v-click>
    <div class="timeline-year">2011</div>
    <div class="timeline-title">First research projects</div>
    <div class="timeline-copy">Mobile services, digital public administration, open data and semantic models.</div>
  </div>
  <div class="timeline-item" v-click>
    <div class="timeline-year">2016-2020</div>
    <div class="timeline-title">PhD in Computer Science</div>
    <div class="timeline-copy">Tabular data understanding through semantic interpretation.</div>
  </div>
  <div class="timeline-item" v-click>
    <div class="timeline-year">2021-2024</div>
    <div class="timeline-title">International networks</div>
    <div class="timeline-copy">Sofia University, Bielefeld, NexusLinguarum, GOBLIN.</div>
  </div>
  <div class="timeline-item" v-click>
    <div class="timeline-year">2022-2025</div>
    <div class="timeline-title">RTD/A</div>
    <div class="timeline-copy">Semantic technologies and AI for early digital intervention.</div>
  </div>
  <div class="timeline-item" v-click>
    <div class="timeline-year">2025</div>
    <div class="timeline-title">Whattadata</div>
    <div class="timeline-copy">Bicocca spin-off for mental-health data, models and platforms.</div>
  </div>
  <div class="timeline-item" v-click>
    <div class="timeline-year">2026</div>
    <div class="timeline-title">Research contract</div>
    <div class="timeline-copy">Data and ML architectures for predictive maintenance.</div>
  </div>
</section>

<!--
The trajectory shows continuity. After the first projects on digital services, public administration and open data, the PhD consolidated the topic of semantic interpretation of tabular data. International experiences and COST actions extended the work to European networks. The RTD/A brought these competences into digital mental health, and Whattadata represents their transfer. The 2026 research contract preserves coherence with computer systems, data and machine learning in a different application domain.
-->

---
layout: default
routeAlias: semantic-ai
class: section-01
---

# Axis 1 · Semantic AI and Tabular Data

<section class="axis-overview axis-hero axis-hero-01">
  <img class="axis-visual axis-visual-01" :src="$aippImage('ia-salute-mentale-cosa-pensiamo.png')" alt="" />
  <div class="bento-card axis-lead bento-accent">
    <div class="bento-eyebrow">Scientific contribution</div>
    <div class="bento-title">From heterogeneous tables to queryable knowledge</div>
    <p>The research addresses the transition from semi-structured data to semantic representations: entity linking, retrieval, disambiguation, annotation, datasets and tools for curation.</p>
  </div>
  <div class="axis-points">
    <div class="bento-card axis-point">
      <div class="bento-eyebrow">Focus</div>
      <div class="bento-title">Semantic Table Interpretation</div>
      <p>Tables and semi-structured data linked to entities, properties and concepts.</p>
    </div>
    <div class="bento-card axis-point">
      <div class="bento-eyebrow">Outputs</div>
      <div class="bento-title">Datasets and tools</div>
      <p>MammoTab, MantisTable UI and annotation workflows for reproducible curation.</p>
    </div>
    <div class="bento-card axis-point">
      <div class="bento-eyebrow">Community</div>
      <div class="bento-title">Benchmarks and challenges</div>
      <p>SemTab and evaluation settings for comparing semantic interpretation systems.</p>
    </div>
  </div>
</section>

<!--
The first axis is the most established one. The problem is how to interpret tabular and semi-structured data by linking them to entities, properties and concepts in knowledge graphs. The contribution is not only algorithmic: it includes datasets, benchmarks, tools and community organization. MammoTab 25 represents the dataset side; MantisTable UI the software and curation side; StEELlm brings LLMs into the annotation process; SemTab shows the ability to build and lead an international challenge.
-->

---
layout: default
routeAlias: publications-axis-1
class: section-01
---

# Axis 1 · Papers

<section class="axis-paper-list">
  <div class="publication-list-panel">
    <div class="bento-eyebrow">Selected publications · timeline</div>
    <div class="publication-timeline">
      <div class="publication-item"><span class="publication-timeline-year">2025</span><span class="publication-timeline-body"><span class="publication-timeline-head"><span class="publication-title">StEELlm: an LLM for generating semantic annotations of tabular data</span><span class="publication-kind publication-kind-approach">Approach</span></span><span class="publication-authors">Marco Cremaschi, Fabio D'Adda, Andrea Maurino</span><span class="publication-venue">ACM Transactions on Intelligent Systems and Technology, 2025 <span class="publication-ranking publication-ranking-scimago">SCImago Q1</span></span></span></div>
      <div class="publication-item"><span class="publication-timeline-year">2025</span><span class="publication-timeline-body"><span class="publication-timeline-head"><span class="publication-title">MammoTab 25: A Large-Scale Dataset for Semantic Table Interpretation</span><span class="publication-kind publication-kind-dataset">Dataset</span></span><span class="publication-authors">Marco Cremaschi, Federico Belotti, Jennifer D'Souza, Matteo Palmonari</span><span class="publication-venue">International Semantic Web Conference, Springer, 2025 <span class="publication-ranking publication-ranking-icore">ICORE A</span></span></span></div>
      <div class="publication-item"><span class="publication-timeline-year">2025</span><span class="publication-timeline-body"><span class="publication-timeline-head"><span class="publication-title">MantisTable UI: semantic table interpretation curation and management</span><span class="publication-kind publication-kind-tool">Tool</span></span><span class="publication-authors">Marco Cremaschi, Fabio D'Adda, Sara Nocco</span><span class="publication-venue">Journal of Open Research Software, 2025 <span class="publication-ranking publication-ranking-scimago">SCImago Q1</span></span></span></div>
      <div class="publication-item"><span class="publication-timeline-year">2024</span><span class="publication-timeline-body"><span class="publication-timeline-head"><span class="publication-title">Feature/vector entity retrieval and disambiguation techniques</span><span class="publication-kind publication-kind-approach">Approach</span></span><span class="publication-authors">Roberto Avogadro, Fabio D'Adda, Marco Cremaschi</span><span class="publication-venue">Knowledge-Based Systems, 2024 <span class="publication-ranking publication-ranking-scimago">SCImago Q1</span></span></span></div>
      <div class="publication-item"><span class="publication-timeline-year">2021</span><span class="publication-timeline-body"><span class="publication-timeline-head"><span class="publication-title">A framework for quality assessment of semantic annotations of tabular data</span><span class="publication-kind publication-kind-approach">Approach</span></span><span class="publication-authors">Roberto Avogadro, Marco Cremaschi, Ernesto Jimenez-Ruiz, Anisa Rula</span><span class="publication-venue">International Semantic Web Conference, Springer, 2021 <span class="publication-ranking publication-ranking-icore">ICORE A</span></span></span></div>
    </div>
  </div>
</section>

<!--
This slide links the first research axis to the publications and awards that make it externally visible. The axis has journal output, conference output, datasets, software and challenge participation. The three awards belong to the same trajectory: MantisTable as a demo, SemTab as a challenge environment, and MammoTab 25 as a resource for the community.
-->

---
layout: default
routeAlias: awards-axis-1
class: section-01
---

# Axis 1 · Awards

<section class="award-bento-grid">
  <div class="bento-card award-tile award-tile-large bento-accent has-certificate">
    <figure class="award-certificate-frame">
      <img class="award-certificate-image" :src="$aippImage('awards/iswc-best-resource-2025.png')" alt="ISWC Best Resource Award certificate" />
    </figure>
    <div class="award-detail">
      <div class="award-meta"><span>2025</span><span>ISWC</span></div>
      <div class="award-tile-title">Best Resource Award</div>
      <p>MammoTab 25 as a reusable dataset and benchmark for semantic table interpretation and LLM-based STI evaluation.</p>
    </div>
  </div>
  <div class="bento-card award-tile has-certificate">
    <figure class="award-certificate-frame">
      <img class="award-certificate-image" :src="$aippImage('awards/eswc-best-demo-2019.jpg')" alt="ESWC Best Demo Award certificate" />
    </figure>
    <div class="award-detail">
      <div class="award-meta"><span>2019</span><span>ESWC</span></div>
      <div class="award-tile-title">Best Demo Award</div>
      <p>MantisTable as a practical tool for creating semantic annotations on tabular data.</p>
    </div>
  </div>
  <div class="bento-card award-tile has-certificate">
    <figure class="award-certificate-frame">
      <img class="award-certificate-image" :src="$aippImage('awards/semtab-outstanding-2019.jpg')" alt="SemTab Outstanding Improvement certificate" />
    </figure>
    <div class="award-detail">
      <div class="award-meta"><span>2019</span><span>SemTab</span></div>
      <div class="award-tile-title">Outstanding Improvement</div>
      <p>Recognition in the international challenge on matching tabular data to knowledge graphs.</p>
    </div>
  </div>
</section>

<!--
These awards are grouped separately to keep the paper evidence and the recognition evidence distinct. The common element is that each recognition concerns usable resources, tools or systems in semantic table interpretation.
-->

---
layout: default
routeAlias: digital-mental-health
class: section-02
---

# Axis 2 · AI for Digital Mental Health

<section class="axis-overview axis-hero axis-hero-02">
  <img class="axis-visual axis-visual-02" :src="$aippImage('ml-psicologia-psichiatria.png')" alt="" />
  <div class="bento-card axis-lead bento-accent">
    <div class="bento-eyebrow">Applied transition</div>
    <div class="bento-title">Intelligent systems to support clinicians, patients and training</div>
    <p>The most recent trajectory transfers AI methods, data and software systems into mental health: decision support, therapeutic apps, digital phenotyping and virtual patients.</p>
  </div>
  <div class="axis-points">
    <div class="bento-card axis-point">
      <div class="bento-eyebrow">Decision support</div>
      <div class="bento-title">Decoding the Mind</div>
      <p>RAG and LLMs grounded in ICD-11 for psychology and psychiatry.</p>
    </div>
    <div class="bento-card axis-point">
      <div class="bento-eyebrow">Engagement</div>
      <div class="bento-title">PENguIN</div>
      <p>Gamification and token economy to support therapeutic adherence in young users.</p>
    </div>
    <div class="bento-card axis-point">
      <div class="bento-eyebrow">Systems</div>
      <div class="bento-title">MiCare and LLMPatients</div>
      <p>Monitoring, early detection and virtual patients for supervised training.</p>
    </div>
  </div>
</section>

<!--
The second axis originates in the RTD/A and places computer science at the service of a complex domain: mental health. Decoding the Mind uses RAG and ICD-11 for decision support; PENguIN works on adherence and engagement; MiCare on monitoring and early detection; LLMPatients on controlled simulations for training. The key point here is methodological caution: AI is not presented as a replacement for clinicians, but as a measurable, validatable support system that can be integrated into clinical processes.
-->

---
layout: default
routeAlias: publications-axis-2
class: section-02
---

# Axis 2 · Papers

<section class="axis-paper-list">
  <div class="publication-list-panel">
    <div class="bento-eyebrow">Selected publications · timeline</div>
    <div class="publication-timeline">
      <div class="publication-item"><span class="publication-timeline-year">2026</span><span class="publication-timeline-body"><span class="publication-timeline-head"><span class="publication-title">Clinically grounded LLM agents for psychotherapy patient simulation</span><span class="publication-kind publication-kind-approach">Approach</span></span><span class="publication-authors">David La Barbera, Erika Fanti, Elisa Pisati, Marco Cremaschi</span><span class="publication-venue">Submitted to Technology, Mind, and Behavior, 2026 <span class="publication-ranking publication-ranking-scimago">SCImago Q1</span></span></span></div>
      <div class="publication-item"><span class="publication-timeline-year">2026</span><span class="publication-timeline-body"><span class="publication-timeline-head"><span class="publication-title">LLMPatients: multi-session virtual patient simulation</span><span class="publication-kind publication-kind-tool">Tool</span></span><span class="publication-authors">Marco Cremaschi, Erika Fanti, Elisa Pisati, David La Barbera</span><span class="publication-venue">Submitted manuscript, 2026 <span class="publication-ranking publication-ranking-pending">Venue pending</span></span></span></div>
      <div class="publication-item"><span class="publication-timeline-year">2025</span><span class="publication-timeline-body"><span class="publication-timeline-head"><span class="publication-title">Decoding the Mind: A RAG-LLM on ICD-11 for decision support in psychology</span><span class="publication-kind publication-kind-approach">Approach</span></span><span class="publication-authors">Marco Cremaschi, Davide Ditolve, Cesare Curcio, Anna Panzeri, Andrea Spoto, Andrea Maurino</span><span class="publication-venue">Expert Systems With Applications, 2025 <span class="publication-ranking publication-ranking-scimago">SCImago Q1</span></span></span></div>
      <div class="publication-item"><span class="publication-timeline-year">2025</span><span class="publication-timeline-body"><span class="publication-timeline-head"><span class="publication-title">PENguIN: gamification and token economy for therapeutic adherence</span><span class="publication-kind publication-kind-tool">Tool</span></span><span class="publication-authors">Marco Cremaschi, Giulia Rosemary Avis, An Qi Zhao, Elia Guarnieri, Anna Panzeri, Andrea Spoto</span><span class="publication-venue">Computers in Human Behavior Reports, 2025 <span class="publication-ranking publication-ranking-scimago">SCImago Q1</span></span></span></div>
      <div class="publication-item"><span class="publication-timeline-year">2025</span><span class="publication-timeline-body"><span class="publication-timeline-head"><span class="publication-title">MiCare: real-time mental health monitoring and early disease detection</span><span class="publication-kind publication-kind-tool">Tool</span></span><span class="publication-authors">Marco Cremaschi, Sara Nocco, Alessandra Agostini, Andrea Maurino</span><span class="publication-venue">SEBD 2025, CEUR Workshop Proceedings <span class="publication-ranking publication-ranking-icore">ICORE C</span></span></span></div>
    </div>
  </div>
</section>

<!--
For the second axis, the publication record is newer and concentrated around 2025 and 2026. It includes one journal article on ICD-11 grounded RAG, one on therapeutic adherence, one systems paper on real-time monitoring and three submitted or presented works on virtual patients and clinically grounded LLM agents. No formal paper award is recorded in the CV for this axis; the relevant recognition is the invited AIPP contribution and the consolidation of submitted journal work.
-->

---
layout: default
routeAlias: awards-axis-2
class: section-02
---

# Axis 2 · Recognition

<section class="award-bento-grid">
  <div class="bento-card award-tile award-tile-large bento-accent">
    <div class="bento-eyebrow">2026 · AIPP</div>
    <div class="award-tile-title">Invited contribution</div>
    <p>Virtual patients and personality simulation presented in the clinical psychology context.</p>
  </div>
  <div class="bento-card award-tile">
    <div class="bento-eyebrow">2025-2026 · submitted work</div>
    <div class="award-tile-title">Journal pipeline</div>
    <p>Clinically grounded LLM agents, personality-constrained simulations and LLMPatients.</p>
  </div>
  <div class="bento-card award-tile">
    <div class="bento-eyebrow">CV evidence</div>
    <div class="award-tile-title">No formal paper award recorded</div>
    <p>The recognition for this axis is expressed through invited talks, interdisciplinary projects and submitted journal work.</p>
  </div>
</section>

<!--
This slide is intentionally labelled recognition rather than award. The CV does not record a formal paper award for the digital mental health axis, but it does document invited and interdisciplinary recognition.
-->

---
layout: default
routeAlias: progetti
class: section-03
---

# Axis 3 · Systems, Data and Transfer

<section class="axis-overview axis-hero axis-hero-03">
  <img class="axis-visual axis-visual-03" :src="$aippImage('sfide-future-index.png')" alt="" />
  <div class="bento-card axis-lead bento-accent">
    <div class="bento-eyebrow">Research transfer</div>
    <div class="bento-title">Models, datasets and platforms in real-world contexts</div>
    <p>The third axis connects data and ML architectures with funded projects, international networks, industrial collaborations and university spin-off activity.</p>
  </div>
  <div class="axis-points">
    <div class="bento-card axis-point">
      <div class="axis-point-figure">17</div>
      <div class="bento-eyebrow">Projects in the CV</div>
      <p>EU, MIUR/MIMIT, regional, PNRR and industry collaborations.</p>
    </div>
    <div class="bento-card axis-point">
      <div class="axis-point-figure">3</div>
      <div class="bento-eyebrow">Networks and actions</div>
      <p>DigInMind, GOBLIN and NexusLinguarum across data, AI and European networks.</p>
    </div>
    <div class="bento-card axis-point">
      <div class="axis-point-figure">1</div>
      <div class="bento-eyebrow">University spin-off</div>
      <p>Whattadata: platforms, models and data for digital mental health.</p>
    </div>
  </div>
</section>

<!--
The projects show the ability to work within consortia and applied contexts. The CV records 17 projects, plus networks and international actions. I mention DIPPS, InterTwino, NODES, Best4Food and BReCHS as examples across different domains. The Whattadata spin-off is an important qualification because it represents the transformation of research into platforms and services. In this application, I read it as evidence of autonomy, project capacity and impact.
-->

---
layout: statement
routeAlias: whattadata
class: whattadata-slide section-03
---

<section class="whattadata-hero">
  <div class="whattadata-logo-stack">
    <img class="whattadata-mark" :src="$aippImage('whattadata-logo.svg')" alt="Whattadata" />
    <img class="whattadata-unimib-mark" :src="$aippImage('bicocca-logo.png')" alt="Università degli Studi di Milano-Bicocca" />
  </div>
  <div class="whattadata-copy">
    <div class="whattadata-kicker">University of Milano-Bicocca spin-off</div>
    <h1>Whattadata</h1>
    <p>Data, models and digital platforms for mental health: from project design to field validation.</p>
  </div>
</section>

<!--
Whattadata is the main transfer evidence for the third axis. I present it as a university spin-off that connects research, platforms and real-world validation in digital mental health. It shows that the work is not limited to publications or prototypes, but can become operational systems and services.
-->

---
layout: default
routeAlias: publications-axis-3
class: section-03
---

# Axis 3 · Papers

<section class="axis-paper-list">
  <div class="publication-list-panel">
    <div class="bento-eyebrow">Selected publications · timeline</div>
    <div class="publication-timeline">
      <div class="publication-item"><span class="publication-timeline-year">2026</span><span class="publication-timeline-body"><span class="publication-timeline-head"><span class="publication-title">Eventour: A GeoSPARQL Knowledge Graph for urban exploration</span><span class="publication-kind publication-kind-dataset">Dataset</span></span><span class="publication-authors">Blerina Spahiu, Marco Cremaschi, Giuseppe Vizzari</span><span class="publication-venue">Submitted to International Semantic Web Conference, 2026 <span class="publication-ranking publication-ranking-icore">ICORE A</span></span></span></div>
      <div class="publication-item"><span class="publication-timeline-year">2025</span><span class="publication-timeline-body"><span class="publication-timeline-head"><span class="publication-title">Guiding AI-assisted persona generation with Hofstede's cultural dimensions</span><span class="publication-kind publication-kind-approach">Approach</span></span><span class="publication-authors">Giulia Rosemary Avis, Sara Nocco, An Qi Zhao, Marco Cremaschi</span><span class="publication-venue">Behaviour & Information Technology, 2025 <span class="publication-ranking publication-ranking-scimago">SCImago Q1</span></span></span></div>
      <div class="publication-item"><span class="publication-timeline-year">2024</span><span class="publication-timeline-body"><span class="publication-timeline-head"><span class="publication-title">A neural network for handwriting extraction in psychodiagnostic questionnaires</span><span class="publication-kind publication-kind-approach">Approach</span></span><span class="publication-authors">Giulia Rosemary Avis, Fabio D'Adda, David Chieregato, Elia Guarnieri, Maria Meliante, Andrea Primo Pierotti, Marco Cremaschi</span><span class="publication-venue">ICT4AWE, SciTePress, 2024 <span class="publication-ranking publication-ranking-icore">ICORE C</span></span></span></div>
      <div class="publication-item"><span class="publication-timeline-year">2017</span><span class="publication-timeline-body"><span class="publication-timeline-head"><span class="publication-title">Toward automatic semantic API descriptions to support service composition</span><span class="publication-kind publication-kind-approach">Approach</span></span><span class="publication-authors">Marco Cremaschi, Flavio De Paoli</span><span class="publication-venue">ESOCC, Springer, 2017 <span class="publication-ranking publication-ranking-pending">ICORE N/A</span></span></span></div>
      <div class="publication-item"><span class="publication-timeline-year">2016</span><span class="publication-timeline-body"><span class="publication-timeline-head"><span class="publication-title">Enriching API descriptions by adding API profiles through semantic annotation</span><span class="publication-kind publication-kind-approach">Approach</span></span><span class="publication-authors">Meherun Nesa Lucky, Marco Cremaschi, Barbara Lodigiani, Antonio Menolascina, Flavio De Paoli</span><span class="publication-venue">ICSOC, Springer, 2016 <span class="publication-ranking publication-ranking-icore">ICORE A</span></span></span></div>
    </div>
  </div>
</section>

<!--
The third axis connects systems, data architectures and transfer. The publication examples deliberately span semantic services, APIs, social and clinical data systems, and a submitted urban knowledge graph paper. The recorded award is the MobiDataLab Codagon third place; the spin-off is not a prize, but it is important evidence of technology transfer and applied impact.
-->

---
layout: default
routeAlias: awards-axis-3
class: section-03
---

# Axis 3 · Awards and Transfer

<section class="award-bento-grid">
  <div class="bento-card award-tile award-tile-large bento-accent has-certificate">
    <figure class="award-certificate-frame">
      <img class="award-certificate-image" :src="$aippImage('awards/mobidatalab-codagon-2023.jpg')" alt="MobiDataLab Codagon 3rd place certificate" />
    </figure>
    <div class="award-detail">
      <div class="award-meta"><span>2023</span><span>MobiDataLab Codagon</span></div>
      <div class="award-tile-title">3rd Place</div>
      <p>Data-driven mobility challenge, connecting data architectures, services and applied validation.</p>
    </div>
  </div>
  <div class="bento-card award-tile">
    <div class="bento-eyebrow">2025 · Bicocca spin-off</div>
    <div class="award-tile-title">Whattadata</div>
    <p>Transfer of data, models and platforms into operational contexts for digital mental health.</p>
  </div>
  <div class="bento-card award-tile">
    <div class="bento-eyebrow">Projects and networks</div>
    <div class="award-tile-title">Applied impact</div>
    <p>EU, national, regional and industry collaborations used as validation contexts for systems research.</p>
  </div>
</section>

<!--
For the third axis, the recognition evidence combines one formal challenge result and technology-transfer evidence. The slide separates this from the paper record while keeping the applied-impact argument visible.
-->

---
layout: default
routeAlias: didattica
class: section-01
---

# Courses and Teaching

<section class="teaching-grid">
  <div class="bento-card bento-accent">
    <div class="bento-eyebrow">Courses</div>
    <div class="course-list">
      <div class="course-item">
        <span class="course-where">UNIMIB</span>
        <span class="course-title">Visual Communication and Interface Design · Data Visualisation · Data Architecture</span>
      </div>
      <div class="course-item">
        <span class="course-where">PhD</span>
        <span class="course-title">Introduction to Knowledge Graphs · Digital Futures for Intangible Heritage</span>
      </div>
      <div class="course-item">
        <span class="course-where">UNICATT</span>
        <span class="course-title">Data Structures and Database Systems · Information Management Online</span>
      </div>
      <div class="course-item">
        <span class="course-where">UNIBG</span>
        <span class="course-title">Health Engineering for Health Promotion</span>
      </div>
    </div>
  </div>
  <div class="bento-card bento-stat thesis-stat">
    <div class="bento-figure">120</div>
    <div class="bento-label">supervised theses</div>
    <p>38 bachelor's and 82 master's theses across Computer Science, Communication, Data Science, AI and Linguistic Computing.</p>
  </div>
</section>

<!--
Teaching is coherent with the profile: visualization, interfaces, data architectures, knowledge graphs and systems for health. The supervised theses are 120: 38 bachelor's and 82 master's theses. This figure shows continuity and the ability to supervise students across different areas, always connected to data, computer systems and applications. PhD teaching on knowledge graphs and intangible heritage confirms the ability to bring research topics into advanced contexts.
-->

---
layout: default
routeAlias: project-management
class: section-03
---

# Project Writing and PM Coordination

<section class="project-pm-grid">
  <div class="bento-card project-pm-lead bento-accent">
    <div class="bento-eyebrow">University of Milano-Bicocca</div>
    <div class="bento-title">From proposal writing to consortium execution</div>
    <p>Projects written and coordinated as project manager, connecting research design, partner alignment, technical planning and delivery tracking.</p>
  </div>
  <div class="bento-card project-pm-card project-pm-dipps">
    <div class="project-pm-head">
      <img :src="$aippImage('logos/dipps.png')" alt="DIPPS" />
      <div>
        <div class="project-pm-name">DIPPS</div>
        <div class="project-pm-period">2023-2026 · MIMIT</div>
      </div>
    </div>
    <p>Digital ecosystem for psychological and psychiatric services: clinician dashboard, patient apps, psychodiagnostic tools, conversational support and decision support.</p>
    <div class="project-pm-role">Lead proposal writer · project manager · research-unit PM</div>
  </div>
  <div class="bento-card project-pm-card project-pm-apm">
    <div class="project-pm-head">
      <img :src="$aippImage('logos/apm.png')" alt="APM" />
      <div>
        <div class="project-pm-name">APM</div>
        <div class="project-pm-period">2025-2028 · MIMIT</div>
      </div>
    </div>
    <p>AI and machine-learning platform for predictive maintenance in corporate fleets and local public transport, integrating IoT/CAN data and maintenance history.</p>
    <div class="project-pm-role">Lead proposal writer · project manager · research-unit PM</div>
  </div>
  <div class="bento-card project-pm-card project-pm-foodnet">
    <div class="project-pm-head">
      <img :src="$aippImage('logos/foodnet.png')" alt="Food NET" />
      <div>
        <div class="project-pm-name">FOODNET</div>
        <div class="project-pm-period">2017-2021 · Regione Lombardia</div>
      </div>
    </div>
    <p>Smart Cities and Communities project on nutritional needs, functional foods and agri-food innovation through advanced research infrastructures.</p>
    <div class="project-pm-role">Project coordination · partner alignment · technical planning</div>
  </div>
</section>

<!--
This slide makes explicit the project-management qualification. DIPPS and APM are the strongest examples because I wrote the proposals and served, or currently serve, as project manager for the overall project and the research unit. FOODNET adds earlier evidence of project coordination for Bicocca: partner alignment, technical planning and progress tracking across the R&D activities.
-->

---
layout: default
routeAlias: produzione
class: section-03
---

# Scientific Output

<section class="metric-grid">
  <div class="bento-card bento-stat bento-accent">
    <div class="bento-figure">47</div>
    <div class="bento-label">items in the updated CV</div>
    <p>13 journal, 21 conference, 7 challenge, 5 workshop, 1 book chapter.</p>
  </div>
  <div class="bento-card bento-stat">
    <div class="bento-figure">12</div>
    <div class="bento-label">submitted publications</div>
    <p>Targeted selection based on quality, scientific coherence and thematic continuity.</p>
  </div>
  <div class="bento-card bento-stat">
    <div class="bento-figure">249</div>
    <div class="bento-label">Scopus citations</div>
    <p>Scopus h-index 10; Google Scholar: 517 citations and h-index 14.</p>
  </div>
</section>

<section class="selected-paper-list">
  <div class="paper-row"><span class="paper-year">2025</span><span class="paper-title">StEELlm · ACM TIST <span class="paper-classification">SCImago Q1</span></span></div>
  <div class="paper-row"><span class="paper-year">2025</span><span class="paper-title">Decoding the Mind · Expert Systems With Applications <span class="paper-classification">SCImago Q1</span></span></div>
  <div class="paper-row"><span class="paper-year">2025</span><span class="paper-title">PENguIN · Computers in Human Behavior Reports <span class="paper-classification">SCImago Q1</span></span></div>
  <div class="paper-row"><span class="paper-year">2024</span><span class="paper-title">Feature/vector entity retrieval · Knowledge-Based Systems <span class="paper-classification">SCImago Q1</span></span></div>
</section>

<!--
Quantitatively, the updated CV includes 47 items: 13 journal articles, 21 conference contributions, 7 challenge papers, 5 workshop papers and one book chapter. For this procedure, 12 publications were selected. I mention four recent examples because they represent the profile well: StEELlm in TIST, Decoding the Mind in Expert Systems With Applications, PENguIN in Computers in Human Behavior Reports, and the work on entity retrieval in Knowledge-Based Systems. The bibliometric figures in the updated CV report 249 Scopus citations and h-index 10; the attached ASN documentation reported 39 works, h-index 9 and 206 citations at the application reference date.
-->

---
layout: default
routeAlias: servizio
class: section-03
---

# Scientific Service and Recognition

<section class="compact-bento">
  <div class="bento-card bento-accent">
    <div class="bento-eyebrow">Chair / organizer</div>
    <div class="bento-title">SemTab 2024-2025 · CLIC-it · DIKW</div>
    <p>Scientific responsibility in international challenges, conferences and workshops.</p>
  </div>
  <div class="bento-card">
    <div class="bento-eyebrow">Editorial</div>
    <div class="bento-title">Associate Editor</div>
    <p>Journal of Intelligent & Fuzzy Systems; reviewer for journals and conferences.</p>
  </div>
  <div class="bento-card">
    <div class="bento-eyebrow">Evaluation</div>
    <div class="bento-title">ANR · Bicocca committees</div>
    <p>Project evaluation and participation in committees for research grants and collaborations.</p>
  </div>
  <div class="bento-card">
    <div class="bento-eyebrow">Awards</div>
    <div class="bento-title">ESWC · ISWC · SemTab · Codagon</div>
    <p>Best Demo Award, Best Resource Award and challenge recognitions.</p>
  </div>
</section>

<div class="logo-strip">
  <span class="logo-chip"><img :src="$aippImage('logos/scopus.png')" alt="Scopus" />Scopus</span>
  <span class="logo-chip"><img :src="$aippImage('logos/google_scholar.png')" alt="Google Scholar" />Google Scholar</span>
  <span class="logo-chip"><img :src="$aippImage('logos/aipp.png')" alt="AIPP" />Invited speaker AIPP 2026</span>
  <span class="logo-chip">MobiDataLab Codagon</span>
</div>

<!--
Beyond scientific output, there are service qualifications: chairing and organizing challenges and workshops, editorial activity, evaluation for ANR and Bicocca committees. The awards, from Best Demo Award to Best Resource Award, are signals of practical quality: software, resources and results used by the community. I also mention the AIPP 2026 invitation because it testifies to recognition in the more recent interdisciplinary domain.
-->

---
layout: default
routeAlias: sintesi
class: closing-slide section-06
---

# Synthesis for INFO-01/A

<section class="closing-wrap">
  <div class="bento-card bento-accent">
    <div class="bento-eyebrow">Main argument</div>
    <div class="bento-title">A computer science profile with strong cross-domain capacity</div>
    <p>Coherence does not lie in a single application domain, but in the method: designing models, data, algorithms, interfaces and evaluable systems.</p>
    <ul>
      <li>Recent scientific output on AI, knowledge graphs, LLMs and digital systems.</li>
      <li>Continuity between basic research, software development and applied validation.</li>
      <li>Teaching and supervision in computer science, data science, interfaces and health engineering.</li>
      <li>Technology transfer through projects, networks and a university spin-off.</li>
    </ul>
  </div>
  <figure class="closing-photo">
    <img :src="$aippImage('photo-profile.png')" alt="Marco Cremaschi" />
    <span>Data and AI as infrastructures for responsible, multidisciplinary systems.</span>
  </figure>
</section>

<!--
The synthesis is this: the profile is a computer science profile not because it remains within a single domain, but because it uses computer science tools to build evaluable systems. The scientific output covers AI, knowledge graphs, LLMs and digital systems; the projects show applied continuity; teaching brings these topics to students; transfer demonstrates the ability to reach software, platforms and real organizations. This is the contribution I propose for INFO-01/A.
-->

---
layout: default
routeAlias: grazie
class: thanks-slide
---

<section class="thanks-content">
  <h1>Thank you</h1>
  <p>Marco Cremaschi · Discussion of qualifications and publications · 2025-RTT-095</p>
</section>

<!--
Thank you for your attention. I am available for questions on the qualifications, selected publications or projects summarized in the presentation.
-->
