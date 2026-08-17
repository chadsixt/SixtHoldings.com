const DIMENSIONS = {
  architecture: {
    name: "Data Architecture",
    base: 50,
    positive: [
      ["data warehouse", 8, "Enterprise data warehouse"],
      ["data lake", 6, "Data lake"],
      ["lakehouse", 8, "Lakehouse architecture"],
      ["canonical model", 7, "Canonical data model"],
      ["enterprise data model", 8, "Enterprise data model"],
      ["api", 4, "API-based access"],
      ["structured data", 4, "Structured data"],
      ["cloud", 3, "Cloud infrastructure"],
      ["postgres", 3, "Managed relational data"],
      ["snowflake", 5, "Cloud data platform"],
      ["databricks", 5, "Lakehouse/data platform"]
    ],
    negative: [
      ["spreadsheet", -5, "Spreadsheet dependency"],
      ["excel", -5, "Excel dependency"],
      ["silo", -8, "Data silos"],
      ["fragmented", -8, "Fragmented data landscape"],
      ["multiple systems", -4, "Distributed systems"],
      ["manual extract", -6, "Manual extracts"],
      ["copy data", -4, "Copied datasets"]
    ]
  },
  governance: {
    name: "Data Governance",
    base: 45,
    positive: [
      ["data owner", 8, "Data ownership"],
      ["data steward", 8, "Data stewardship"],
      ["governance", 8, "Governance practice"],
      ["authoritative source", 9, "Authoritative sources"],
      ["system of record", 8, "Systems of record"],
      ["lineage", 8, "Data lineage"],
      ["catalog", 5, "Data catalog"],
      ["metadata", 5, "Metadata management"],
      ["quality rules", 5, "Quality controls"],
      ["access control", 4, "Access controls"]
    ],
    negative: [
      ["unclear ownership", -10, "Unclear ownership"],
      ["no owner", -9, "Missing ownership"],
      ["unknown source", -7, "Unknown data provenance"],
      ["no lineage", -9, "Missing lineage"],
      ["inconsistent quality", -7, "Inconsistent data quality"],
      ["manual governance", -4, "Manual governance"]
    ]
  },
  meaning: {
    name: "Organizational Meaning",
    base: 45,
    positive: [
      ["ontology", 9, "Enterprise ontology"],
      ["taxonomy", 6, "Shared taxonomy"],
      ["semantic", 7, "Semantic standards"],
      ["shared definition", 9, "Shared definitions"],
      ["business glossary", 8, "Business glossary"],
      ["common definition", 8, "Common definitions"],
      ["master data", 6, "Master data"],
      ["knowledge graph", 8, "Knowledge graph"],
      ["entity model", 6, "Entity modeling"]
    ],
    negative: [
      ["define differently", -10, "Conflicting definitions"],
      ["different definitions", -10, "Conflicting definitions"],
      ["inconsistent definition", -9, "Inconsistent definitions"],
      ["same term", -5, "Ambiguous terminology"],
      ["different meaning", -8, "Semantic inconsistency"],
      ["tribal knowledge", -7, "Tribal knowledge dependency"]
    ]
  },
  ai: {
    name: "AI & Analytics Enablement",
    base: 40,
    positive: [
      ["machine learning", 7, "Machine learning"],
      ["artificial intelligence", 7, "AI capability"],
      ["generative ai", 8, "Generative AI"],
      ["genai", 8, "Generative AI"],
      ["copilot", 5, "AI productivity tools"],
      ["rag", 8, "Retrieval-augmented generation"],
      ["vector", 5, "Vector search"],
      ["embedding", 5, "Embeddings"],
      ["predictive", 5, "Predictive analytics"],
      ["data science", 5, "Data science capability"],
      ["llm", 7, "Large language models"],
      ["agent", 6, "Agentic workflows"]
    ],
    negative: [
      ["pilot only", -4, "Pilot-stage AI"],
      ["experimenting", -2, "Early-stage experimentation"],
      ["no ai", -9, "No AI capability"],
      ["cannot deploy", -8, "Deployment constraints"],
      ["proof of concept", -3, "Proof-of-concept stage"]
    ]
  },
  integration: {
    name: "Automation & Integration",
    base: 45,
    positive: [
      ["pipeline", 7, "Automated data pipelines"],
      ["etl", 6, "ETL automation"],
      ["elt", 6, "ELT automation"],
      ["ci/cd", 7, "CI/CD"],
      ["cicd", 7, "CI/CD"],
      ["automated testing", 7, "Automated testing"],
      ["event driven", 6, "Event-driven architecture"],
      ["event-driven", 6, "Event-driven architecture"],
      ["integration", 4, "System integration"],
      ["microservice", 5, "Service-oriented architecture"],
      ["api", 4, "API integration"],
      ["workflow automation", 6, "Workflow automation"]
    ],
    negative: [
      ["manual process", -7, "Manual processes"],
      ["manual upload", -6, "Manual uploads"],
      ["manual download", -6, "Manual downloads"],
      ["email file", -5, "Email-based file exchange"],
      ["swivel chair", -7, "Human-mediated integration"],
      ["batch file", -3, "File-based integration"]
    ]
  }
};

const exampleText = `We have data spread across SQL Server, Excel, SharePoint, and several SaaS platforms. Different business groups define customers and products differently. We have begun moving selected data into a cloud data warehouse and have several ETL pipelines, but some extracts and uploads are still manual.

We are experimenting with Copilot and an internal RAG application. The data science team is building predictive models, but ownership of several key data sets is unclear and we do not consistently maintain lineage or shared business definitions. Some APIs exist, although many integrations are still point-to-point.`;

function normalize(text) {
  return text.toLowerCase().replace(/[^\w\s/-]/g, " ");
}

function scoreDimension(text, config) {
  let score = config.base;
  const signals = [];
  const foundLabels = new Set();

  for (const [phrase, points, label] of config.positive) {
    if (text.includes(phrase)) {
      score += points;
      if (!foundLabels.has(label)) {
        signals.push({ label, type: "positive", points });
        foundLabels.add(label);
      }
    }
  }

  for (const [phrase, points, label] of config.negative) {
    if (text.includes(phrase)) {
      score += points;
      if (!foundLabels.has(label)) {
        signals.push({ label, type: "negative", points });
        foundLabels.add(label);
      }
    }
  }

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 25) score -= 5;
  if (wordCount > 100) score += 2;

  score = Math.max(10, Math.min(95, Math.round(score)));
  return { score, signals };
}

function readinessLabel(score) {
  if (score >= 80) return "Advanced: strong foundations for scalable enterprise AI.";
  if (score >= 65) return "Established: many foundations exist, with targeted gaps limiting scale and reliability.";
  if (score >= 50) return "Developing: meaningful capabilities exist, but structural weaknesses are likely to constrain AI.";
  if (score >= 35) return "Emerging: early capabilities are present, but foundational data and operating-model work is needed.";
  return "Foundational: core infrastructure and governance should mature before broad AI scaling.";
}

function getPrimaryFinding(results) {
  const sorted = Object.entries(results).sort((a, b) => a[1].score - b[1].score);
  const [weakestKey] = sorted[0];
  const strongest = sorted[sorted.length - 1][1];

  const findings = {
    architecture: {
      title: "The primary constraint is data architecture.",
      text: `Your environment shows stronger capability in ${strongest.name.toLowerCase()}, but fragmented or weakly standardized data architecture may prevent AI systems from accessing consistent, reusable representations of enterprise reality.`
    },
    governance: {
      title: "The primary constraint is governance and trust.",
      text: "Your organization appears capable of building technology, but AI reliability may be limited by unclear ownership, lineage, provenance, or authoritative-source decisions. AI can scale faster than governance unless those controls are designed into the data environment."
    },
    meaning: {
      title: "The primary constraint is shared organizational meaning.",
      text: "Your technical environment may support analytics and AI, but inconsistent definitions and weak semantic alignment can cause models, people, and applications to reason from different interpretations of the same business concepts."
    },
    ai: {
      title: "The primary constraint is operational AI enablement.",
      text: "The underlying environment may have useful data and integration capabilities, but AI and advanced analytics appear relatively immature. The next step is to connect governed enterprise data to repeatable analytical and AI use cases."
    },
    integration: {
      title: "The primary constraint is automation and integration.",
      text: "Your organization may possess useful data and AI capabilities, but manual handoffs and weak integration can prevent those capabilities from becoming repeatable enterprise workflows."
    }
  };

  return findings[weakestKey];
}

function buildRecommendations(results) {
  const ranked = Object.entries(results).sort((a, b) => a[1].score - b[1].score);
  const actions = {
    architecture: "Consolidate high-value data domains around governed, reusable data models and reduce dependence on isolated files and point solutions.",
    governance: "Assign explicit data owners and stewards, establish authoritative sources, and capture lineage for data used by analytics and AI.",
    meaning: "Create shared enterprise definitions for core entities, metrics, and relationships through a business glossary, semantic model, or ontology.",
    ai: "Select a small number of measurable AI use cases and connect them to governed enterprise data rather than isolated experiments.",
    integration: "Replace recurring manual transfers and handoffs with APIs, automated pipelines, testing, and observable workflows."
  };

  const recommendations = ranked.slice(0, 3).map(([key]) => actions[key]);
  recommendations.push("Define measurable AI-readiness outcomes such as data availability, semantic consistency, lineage coverage, reuse, and time from data creation to trusted decision support.");
  recommendations.push("Reassess maturity after foundational improvements so AI adoption is measured against infrastructure readiness, not simply the number of AI tools deployed.");
  return recommendations;
}

function renderResults(results) {
  const scores = Object.values(results).map(r => r.score);
  const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  document.getElementById("overallScore").textContent = overall;
  document.getElementById("overallBar").style.width = `${overall}%`;
  document.getElementById("readinessLabel").textContent = readinessLabel(overall);

  const grid = document.getElementById("dimensionGrid");
  grid.innerHTML = "";

  for (const result of Object.values(results)) {
    const item = document.createElement("div");
    item.className = "dimension";
    item.innerHTML = `
      <div class="dimension-name">${result.name}</div>
      <div class="dimension-score">${result.score}</div>
      <div class="mini-track"><div class="mini-fill" style="width:${result.score}%"></div></div>
    `;
    grid.appendChild(item);
  }

  const finding = getPrimaryFinding(results);
  document.getElementById("primaryFindingTitle").textContent = finding.title;
  document.getElementById("primaryFinding").textContent = finding.text;

  const recList = document.getElementById("recommendations");
  recList.innerHTML = "";
  buildRecommendations(results).forEach(rec => {
    const li = document.createElement("li");
    li.textContent = rec;
    recList.appendChild(li);
  });

  const signalContainer = document.getElementById("signals");
  signalContainer.innerHTML = "";
  const allSignals = Object.values(results).flatMap(r => r.signals);
  if (!allSignals.length) {
    signalContainer.innerHTML = '<span class="signal">No strong keyword signals detected. Add more detail for a richer assessment.</span>';
  } else {
    allSignals.slice(0, 18).forEach(signal => {
      const el = document.createElement("span");
      el.className = `signal ${signal.type}`;
      el.textContent = signal.label;
      signalContainer.appendChild(el);
    });
  }

  const resultsSection = document.getElementById("results");
  resultsSection.classList.remove("hidden");
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function analyze() {
  const input = document.getElementById("environment");
  const rawText = input.value.trim();
  if (rawText.length < 20) {
    input.focus();
    alert("Please enter a little more detail about the environment before analyzing it.");
    return;
  }

  const text = normalize(rawText);
  const results = {};
  for (const [key, config] of Object.entries(DIMENSIONS)) {
    results[key] = { name: config.name, ...scoreDimension(text, config) };
  }
  renderResults(results);
}

document.getElementById("analyzeBtn").addEventListener("click", analyze);
document.getElementById("exampleBtn").addEventListener("click", () => {
  document.getElementById("environment").value = exampleText;
});
document.getElementById("year").textContent = new Date().getFullYear();
