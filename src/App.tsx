import { useState, type ReactNode } from 'react';
import { GoogleGenAI } from '@google/genai';
import { BookOpen, Sparkles, Download, FileJson, FileText, LoaderCircle, GraduationCap, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

type Paper = {
  title:string; abstract:string; research_questions:string[]; literature_review:string;
  methodology:string; findings:string[]; limitations:string[]; conclusion:string;
  references:{citation:string;url:string;verification_status:string}[];
};
const PROMPT = `You are ResearchMate, a careful academic research-paper assistant.
Create an evidence-aware academic research paper draft from the user's topic, academic level and scope.
Workflow: interpret scope; create 3–5 focused research questions; explain background and literature themes without claiming a systematic review; propose a feasible methodology; distinguish established evidence from hypotheses and expected themes; state limitations, uncertainty and ethical considerations; conclude concisely.
Never fabricate experiments, results, authors, titles, journals, DOIs, statistics, quotations or URLs. Include only references you are confident are real. If uncertain, leave references empty and state verification is needed. Do not reveal private chain-of-thought.
Return ONLY valid JSON with exactly these keys:
title (string), abstract (string), research_questions (array of strings), literature_review (string), methodology (string), findings (array of strings), limitations (array of strings), conclusion (string), references (array of objects with citation, url, verification_status strings).
Few-shot example: For "How can urban green spaces affect public health?", define population and outcomes, discuss plausible pathways like heat reduction and physical activity, identify confounders such as income/access, propose an observational or quasi-experimental design, and do not claim causation from correlation.`;
function download(name:string,content:string,type:string){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
export default function App(){
 const [topic,setTopic]=useState('The impact of artificial intelligence on employment and the future of work');
 const [level,setLevel]=useState('Undergraduate'); const [scope,setScope]=useState('');
 const [paper,setPaper]=useState<Paper|null>(null); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
 async function generate(){
  setError('');setPaper(null);
  const key=import.meta.env.VITE_GEMINI_API_KEY as string|undefined;
  if(!key || key==='your_gemini_api_key_here'){setError('Add your Gemini API key to a local .env file as VITE_GEMINI_API_KEY, then restart the dev server. Get a key at aistudio.google.com/app/apikey.');return;}
  if(topic.trim().length<8){setError('Please enter a more specific research topic.');return;}
  setBusy(true);
  try{
   const ai=new GoogleGenAI({apiKey:key,httpOptions:{timeout:90000}});
   const request = {model:'gemini-3.8-flash',contents:`${PROMPT}\n\nAcademic level: ${level}\nResearch topic: ${topic}\nScope or instructions: ${scope||'Choose a focused, feasible scope.'}`,config:{responseMimeType:'application/json',temperature:0.3,maxOutputTokens:4096}};
   let response;
   for(let attempt=0;attempt<3;attempt++){
    try{
     response=await ai.models.generateContent(request);
     break;
    }catch(err){
     const message=err instanceof Error?err.message:String(err);
     const retryable=/503|UNAVAILABLE|high demand|429|RESOURCE_EXHAUSTED/i.test(message);
     if(!retryable||attempt===2) throw err;
     await new Promise(resolve=>setTimeout(resolve,2000*(attempt+1)));
    }
   }
   if(!response) throw new Error('Gemini is temporarily busy. Please wait a minute and try again.');
   const raw=response.text||'';
   const parsed=JSON.parse(raw.replace(/^```json\s*/i,'').replace(/\s*```$/,''));
   const normalized:Paper={title:String(parsed.title||topic),abstract:String(parsed.abstract||''),research_questions:Array.isArray(parsed.research_questions)?parsed.research_questions:[],literature_review:String(parsed.literature_review||''),methodology:String(parsed.methodology||''),findings:Array.isArray(parsed.findings)?parsed.findings:[],limitations:Array.isArray(parsed.limitations)?parsed.limitations:[],conclusion:String(parsed.conclusion||''),references:Array.isArray(parsed.references)?parsed.references:[]};
   setPaper(normalized);
  }catch(e){setError(e instanceof Error?e.message:'Something went wrong. Check your API key and try again.');}
  finally{setBusy(false);}
 }
 const json=paper?JSON.stringify(paper,null,2):'';
 const txt=paper?[paper.title,'='.repeat(paper.title.length),'', 'ABSTRACT',paper.abstract,'','RESEARCH QUESTIONS',...paper.research_questions.map((x,i)=>`${i+1}. ${x}`),'','LITERATURE REVIEW',paper.literature_review,'','METHODOLOGY',paper.methodology,'','FINDINGS',...paper.findings.map(x=>'• '+x),'','LIMITATIONS',...paper.limitations.map(x=>'• '+x),'','CONCLUSION',paper.conclusion,'','REFERENCES',...(paper.references.length?paper.references.map((r,i)=>`${i+1}. ${r.citation} — ${r.url} [${r.verification_status}]`):['No references returned; verify sources independently.'])].join('\n'):'';
 return <div className="app-shell">
  <header className="topbar"><a className="brand" href="#"><span className="brand-icon"><BookOpen size={20}/></span><span>Research<span className="brand-accent">Mate</span></span></a><div className="top-tag"><span className="live-dot"/> GEMINI-POWERED RESEARCH AGENT</div></header>
  <main className="main">
   <section className="hero"><div className="eyebrow"><Sparkles size={14}/> YOUR ACADEMIC RESEARCH COMPANION</div><h1>Turn a research idea into<br/><em>a structured first draft.</em></h1><p>Explore a topic, shape research questions, design a methodology and generate an evidence-aware paper draft with Gemini.</p></section>
   <div className="workspace">
    <section className="panel input-panel"><div className="panel-heading"><div><span className="step">01 / INPUT</span><h2>Define your research</h2></div><span className="panel-icon"><Search size={18}/></span></div>
     <label htmlFor="topic">RESEARCH TOPIC</label><textarea id="topic" className="topic-input" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. The impact of AI on employment..." rows={4}/>
     <div className="field-row"><div className="field"><label htmlFor="level">ACADEMIC LEVEL</label><select id="level" value={level} onChange={e=>setLevel(e.target.value)}><option>High School</option><option>Undergraduate</option><option>Postgraduate</option><option>Doctoral</option></select></div><div className="field"><label>MODEL</label><div className="model-select"><Sparkles size={15}/> Gemini 3.8 Flash</div></div></div>
     <label htmlFor="scope">ADDITIONAL SCOPE <span className="optional">OPTIONAL</span></label><textarea id="scope" className="scope-input" value={scope} onChange={e=>setScope(e.target.value)} placeholder="Geography, timeframe, specific angle or constraints..." rows={3}/>
     <button className="generate-btn" onClick={generate} disabled={busy}>{busy?<><LoaderCircle className="spin" size={18}/> Generating your paper...</>:<><Sparkles size={17}/> Generate research paper <span>→</span></>}</button>
     <p className="privacy-note">Your API key stays in your local environment. Generated work should be checked against primary sources.</p>
     {error&&<div className="error-box"><AlertCircle size={17}/><span>{error}</span></div>}
    </section>
    <section className="panel output-panel"><div className="panel-heading"><div><span className="step">02 / OUTPUT</span><h2>Your research paper</h2></div>{paper&&<div className="export-actions"><button title="Download JSON" onClick={()=>download('research-paper.json',json,'application/json')}><FileJson size={16}/> JSON</button><button title="Download text" onClick={()=>download('research-paper.txt',txt,'text/plain')}><FileText size={16}/> TXT</button></div>}</div>
     {!paper&&!busy&&<div className="empty-state"><div className="empty-art"><BookOpen size={34}/><span><Sparkles size={15}/></span></div><h3>Your draft starts here</h3><p>Enter a topic and generate a structured research paper. Your result will appear in this space.</p><div className="empty-list"><span><CheckCircle2 size={15}/> Research questions</span><span><CheckCircle2 size={15}/> Methodology & findings</span><span><CheckCircle2 size={15}/> Limitations & references</span></div></div>}
     {busy&&<div className="loading-state"><LoaderCircle className="spin" size={30}/><h3>Thinking through your topic</h3><p>Gemini is structuring research questions, methodology and findings.</p><div className="loading-bar"><span/></div></div>}
     {paper&&<article className="paper-result"><div className="paper-kicker"><GraduationCap size={15}/> ${level.toUpperCase()} RESEARCH DRAFT</div><h2 className="paper-title">{paper.title}</h2><Section title="Abstract"><p>{paper.abstract}</p></Section><Section title="Research questions"><ol>{paper.research_questions.map((x,i)=><li key={i}>{x}</li>)}</ol></Section><Section title="Literature review"><p>{paper.literature_review}</p></Section><Section title="Methodology"><p>{paper.methodology}</p></Section><Section title="Findings"><ul>{paper.findings.map((x,i)=><li key={i}>{x}</li>)}</ul></Section><Section title="Limitations"><ul>{paper.limitations.map((x,i)=><li key={i}>{x}</li>)}</ul></Section><Section title="Conclusion"><p>{paper.conclusion}</p></Section><Section title="References">{paper.references.length?<ol>{paper.references.map((r,i)=><li key={i}>{r.citation} {r.url&&<a href={r.url} target="_blank" rel="noreferrer">{r.url}</a>} <small>({r.verification_status})</small></li>)}</ol>:<p className="muted">No references returned. Verify sources independently before submission.</p>}</Section><div className="integrity-note"><AlertCircle size={16}/><span>AI-generated draft: verify claims, statistics and references using original academic sources before submission.</span></div></article>}
    </section>
   </div>
   <footer><span>RESEARCHMATE · ASSIGNMENT 1</span><span>BUILT WITH REACT + GEMINI API</span></footer>
  </main>
 </div>;
}
function Section({title,children}:{title:string;children:ReactNode}){return <section className="paper-section"><h3>{title}</h3>{children}</section>}
