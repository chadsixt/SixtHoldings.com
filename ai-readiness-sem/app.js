import { analyzeSemantically, MODEL_ID } from "./semantic-model.js";

const RULE_WEIGHT=.35;
const SEMANTIC_WEIGHT=.65;

const RULES={
 architecture:{name:"Data Architecture",base:50,pos:[["data warehouse",8],["data lake",6],["lakehouse",8],["enterprise data model",8],["api",4],["cloud",3]],neg:[["spreadsheet",-5],["excel",-5],["silo",-8],["fragmented",-8],["manual extract",-6]]},
 governance:{name:"Data Governance",base:45,pos:[["data owner",8],["data steward",8],["governance",8],["authoritative source",9],["system of record",8],["lineage",8],["metadata",5]],neg:[["unclear ownership",-10],["no owner",-9],["no lineage",-9],["inconsistent quality",-7]]},
 meaning:{name:"Organizational Meaning",base:45,pos:[["ontology",9],["taxonomy",6],["semantic",7],["shared definition",9],["business glossary",8],["common definition",8],["knowledge graph",8]],neg:[["define differently",-10],["different definitions",-10],["inconsistent definition",-9],["different meaning",-8],["tribal knowledge",-7]]},
 ai:{name:"AI & Analytics Enablement",base:40,pos:[["machine learning",7],["generative ai",8],["genai",8],["copilot",5],["rag",8],["vector",5],["embedding",5],["predictive",5],["data science",5],["llm",7],["agent",6]],neg:[["pilot only",-4],["experimenting",-2],["no ai",-9],["proof of concept",-3]]},
 integration:{name:"Automation & Integration",base:45,pos:[["pipeline",7],["etl",6],["elt",6],["ci/cd",7],["automated testing",7],["event driven",6],["integration",4],["microservice",5],["api",4]],neg:[["manual process",-7],["manual upload",-6],["manual download",-6],["email file",-5],["swivel chair",-7]]}
};

const example=`We have a centralized cloud data warehouse that integrates several operational systems through automated data pipelines and APIs. Most important business information is structured and accessible, and we have begun documenting metadata and lineage. Responsibility for several major data domains is assigned, although governance is still inconsistent across departments.

Several core entities have common definitions, but teams do not always agree on customer, product, and operational metrics. We are developing a shared business glossary and improving the way enterprise concepts are represented.

Our data science group uses machine learning and predictive analytics. We are experimenting with generative AI and retrieval augmented generation, and several software teams use CI/CD and automated testing. Some older processes still require manual file transfers and spreadsheet based reconciliation.`;

function normalize(t){return t.toLowerCase().replace(/[^\w\s/-]/g," ")}
function ruleScore(text,c){
 let s=c.base;
 for(const [p,v] of c.pos)if(text.includes(p))s+=v;
 for(const [p,v] of c.neg)if(text.includes(p))s+=v;
 return Math.max(10,Math.min(95,Math.round(s)));
}
function label(s){
 if(s>=80)return"Advanced: strong foundations for scalable enterprise AI.";
 if(s>=65)return"Established: many foundations exist, with targeted gaps limiting scale and reliability.";
 if(s>=50)return"Developing: meaningful capabilities exist, but structural weaknesses are likely to constrain AI.";
 if(s>=35)return"Emerging: early capabilities are present, but foundational work is needed.";
 return"Foundational: core infrastructure and governance should mature before broad AI scaling.";
}
function finding(results){
 const weakest=Object.entries(results).sort((a,b)=>a[1].score-b[1].score)[0][0];
 const f={
  architecture:["The primary constraint is data architecture.","Fragmentation or weak standardization may prevent AI systems from accessing consistent, reusable representations of enterprise information."],
  governance:["The primary constraint is governance and trust.","Ownership, lineage, provenance, quality, or authoritative-source decisions appear to be the weakest foundation for reliable AI at scale."],
  meaning:["The primary constraint is shared organizational meaning.","Teams or systems may interpret important enterprise concepts differently, causing analytics and AI to reason from inconsistent definitions."],
  ai:["The primary constraint is operational AI enablement.","The organization has useful foundations but appears less mature in connecting them to repeatable, measurable AI and analytics use cases."],
  integration:["The primary constraint is automation and integration.","Manual handoffs or weak integration may prevent data and AI capabilities from becoming repeatable enterprise workflows."]
 };
 return{title:f[weakest][0],text:f[weakest][1]};
}
function recommendations(results){
 const order=Object.entries(results).sort((a,b)=>a[1].score-b[1].score).map(x=>x[0]);
 const a={
  architecture:"Consolidate high-value data domains around governed, reusable data models and reduce isolated data stores.",
  governance:"Assign explicit data owners and stewards, establish authoritative sources, and capture lineage for AI-relevant data.",
  meaning:"Create shared enterprise definitions for core entities, metrics, and relationships through a glossary, semantic model, or ontology.",
  ai:"Select measurable AI use cases and connect them to governed enterprise data rather than isolated experiments.",
  integration:"Replace recurring manual transfers and handoffs with APIs, automated pipelines, testing, and observable workflows."
 };
 return[...order.slice(0,3).map(k=>a[k]),"Measure readiness using data availability, semantic consistency, lineage coverage, reuse, reliability, and business outcomes."];
}
function render(results){
 const overall=Math.round(Object.values(results).reduce((a,b)=>a+b.score,0)/5);
 document.getElementById("overallScore").textContent=overall;
 document.getElementById("overallBar").style.width=overall+"%";
 document.getElementById("readinessLabel").textContent=label(overall);
 const grid=document.getElementById("dimensionGrid");grid.innerHTML="";
 for(const r of Object.values(results)){
  const e=document.createElement("div");e.className="dimension";
  e.innerHTML=`<div class="dimension-name">${r.name}</div><div class="dimension-score">${r.score}</div><div class="mini-track"><div class="mini-fill" style="width:${r.score}%"></div></div><div class="score-detail">Semantic ${r.semanticScore} · Rules ${r.ruleScore}</div>`;
  grid.appendChild(e);
 }
 const f=finding(results);
 document.getElementById("primaryFindingTitle").textContent=f.title;
 document.getElementById("primaryFinding").textContent=f.text;
 const list=document.getElementById("recommendations");list.innerHTML="";
 recommendations(results).forEach(x=>{const li=document.createElement("li");li.textContent=x;list.appendChild(li)});
 document.getElementById("signals").innerHTML=`<span class="signal">Semantic embeddings</span><span class="signal">Context similarity</span><span class="signal">Explainable rules</span><span class="signal">65% semantic / 35% rules</span>`;
 document.getElementById("results").classList.remove("hidden");
 document.getElementById("results").scrollIntoView({behavior:"smooth"});
}
function status(t){document.getElementById("modelStatus").textContent=t}
async function analyze(){
 const box=document.getElementById("environment"),raw=box.value.trim();
 if(raw.length<20){alert("Please enter more detail before analyzing.");box.focus();return}
 const button=document.getElementById("analyzeBtn"),original=button.textContent;
 button.disabled=true;button.textContent="Analyzing…";status("Loading or running semantic model in your browser…");
 try{
  const sem=await analyzeSemantically(raw,p=>{
   if(p?.status==="progress"&&Number.isFinite(p.progress))status(`Loading semantic model… ${Math.round(p.progress)}%`);
  });
  const text=normalize(raw),results={};
  for(const [key,c] of Object.entries(RULES)){
   const rs=ruleScore(text,c),ss=sem[key].score;
   results[key]={name:c.name,ruleScore:rs,semanticScore:ss,score:Math.round(rs*RULE_WEIGHT+ss*SEMANTIC_WEIGHT)};
  }
  render(results);status(`Semantic model ready · ${MODEL_ID}`);
 }catch(err){
  console.error(err);status("The semantic model could not be loaded. Check the browser console and network connection.");
  alert("The semantic model could not be loaded. Refresh the page and try again.");
 }finally{button.disabled=false;button.textContent=original}
}
document.getElementById("analyzeBtn").addEventListener("click",analyze);
document.getElementById("exampleBtn").addEventListener("click",()=>document.getElementById("environment").value=example);
document.getElementById("year").textContent=new Date().getFullYear();
