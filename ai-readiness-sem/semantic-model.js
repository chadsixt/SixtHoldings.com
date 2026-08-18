import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.0.1";

export const MODEL_ID = "mixedbread-ai/mxbai-embed-xsmall-v1";

const PROFILES = {
  architecture: {
    name: "Data Architecture",
    mature: [
      "Enterprise data is organized in a governed shared platform with reusable data models.",
      "Operational systems feed a centralized warehouse lakehouse or shared analytical data platform.",
      "Applications access consistent structured enterprise data through well defined APIs.",
      "Core enterprise entities are represented consistently across systems."
    ],
    immature: [
      "Important information is fragmented across spreadsheets files and disconnected applications.",
      "Teams maintain duplicate copies of data and reconcile them manually.",
      "Data is difficult to discover combine or reuse across organizational boundaries.",
      "Point solutions and isolated data stores dominate the architecture."
    ]
  },
  governance: {
    name: "Data Governance",
    mature: [
      "Critical data has named owners stewards authoritative sources and documented lineage.",
      "The organization manages metadata provenance access quality and lifecycle consistently.",
      "People know which source is authoritative and can trace how important data was produced.",
      "Data quality rules and governance responsibilities are embedded into operations."
    ],
    immature: [
      "Ownership of important data is unclear and nobody is accountable for its quality.",
      "The organization cannot reliably trace where data came from or how it was transformed.",
      "Different teams keep preferred sources without an authoritative system of record.",
      "Governance is informal inconsistent or performed only after problems occur."
    ]
  },
  meaning: {
    name: "Organizational Meaning",
    mature: [
      "The organization maintains shared definitions for important business entities metrics and relationships.",
      "A business glossary taxonomy ontology or semantic model captures common organizational meaning.",
      "Different systems and teams interpret core concepts consistently.",
      "Enterprise knowledge is represented so people and machines can interpret it consistently."
    ],
    immature: [
      "Different departments use the same words to mean different things.",
      "Business definitions are tribal knowledge and vary between teams.",
      "Metrics and entities have conflicting definitions across reports systems and applications.",
      "Technology exchanges data but the organization has not standardized what that data means."
    ]
  },
  ai: {
    name: "AI & Analytics Enablement",
    mature: [
      "The organization routinely deploys machine learning predictive analytics generative AI or agentic systems into useful workflows.",
      "AI systems have governed access to trusted enterprise data and measurable business use cases.",
      "Data science and AI capabilities move beyond experiments into repeatable operational services.",
      "The organization evaluates AI outcomes quality reliability and business impact."
    ],
    immature: [
      "AI work is limited to isolated experiments demonstrations or proofs of concept.",
      "Teams want AI but cannot reliably connect models to trusted enterprise information.",
      "The organization has little operational machine learning or advanced analytics capability.",
      "AI adoption is measured by tool usage rather than dependable business outcomes."
    ]
  },
  integration: {
    name: "Automation & Integration",
    mature: [
      "Data moves automatically through observable pipelines APIs and integrated workflows.",
      "Software delivery uses automated testing continuous integration and repeatable deployment.",
      "Systems exchange information through governed interfaces rather than manual handoffs.",
      "Operational workflows are automated monitored and designed for reuse."
    ],
    immature: [
      "Employees repeatedly download upload email or copy files between systems.",
      "Important workflows depend on manual handoffs and spreadsheet based processes.",
      "System integrations are brittle point to point and difficult to maintain.",
      "Routine data preparation requires significant human intervention."
    ]
  }
};

let extractorPromise;
let prototypePromise;

function cosine(a,b){
  let dot=0,aa=0,bb=0;
  for(let i=0;i<a.length;i++){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i]}
  return aa&&bb ? dot/(Math.sqrt(aa)*Math.sqrt(bb)) : 0;
}

async function getExtractor(progress_callback){
  if(!extractorPromise){
    extractorPromise=pipeline("feature-extraction",MODEL_ID,{progress_callback});
  }
  return extractorPromise;
}

async function embed(texts,progress_callback){
  const extractor=await getExtractor(progress_callback);
  const output=await extractor(texts,{pooling:"mean",normalize:true});
  return output.tolist();
}

function chunks(text){
  const parts=text.split(/(?<=[.!?])\s+|\n+/).map(x=>x.trim()).filter(x=>x.length>=20);
  return (parts.length?parts:[text.trim()]).slice(0,24);
}

async function prototypes(progress_callback){
  if(!prototypePromise){
    prototypePromise=(async()=>{
      const result={};
      for(const [key,p] of Object.entries(PROFILES)){
        result[key]={
          mature:await embed(p.mature,progress_callback),
          immature:await embed(p.immature,progress_callback)
        };
      }
      return result;
    })();
  }
  return prototypePromise;
}

function topAverage(values,n=3){
  const selected=[...values].sort((a,b)=>b-a).slice(0,n);
  return selected.reduce((a,b)=>a+b,0)/selected.length;
}

export async function analyzeSemantically(text,progress_callback){
  const proto=await prototypes(progress_callback);
  const vectors=await embed(chunks(text),progress_callback);
  const result={};

  for(const [key,profile] of Object.entries(PROFILES)){
    const mature=vectors.map(v=>Math.max(...proto[key].mature.map(p=>cosine(v,p))));
    const immature=vectors.map(v=>Math.max(...proto[key].immature.map(p=>cosine(v,p))));
    const matureSimilarity=topAverage(mature);
    const immatureSimilarity=topAverage(immature);
    const margin=matureSimilarity-immatureSimilarity;
    const score=Math.round(Math.max(20,Math.min(90,55+margin*115)));

    result[key]={
      name:profile.name,
      score,
      matureSimilarity,
      immatureSimilarity,
      margin
    };
  }
  return result;
}
