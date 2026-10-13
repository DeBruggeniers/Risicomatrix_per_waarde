const WORKER_URL='https://risicomatrix-per-waarde-publisher.koen-f98.workers.dev/';

const RISK_LEVELS=[
  {id:'very-low',name:'Zeer laag',css:'risk-very-low'},
  {id:'low',name:'Laag',css:'risk-low'},
  {id:'medium',name:'Middel',css:'risk-medium'},
  {id:'high',name:'Hoog',css:'risk-high'},
  {id:'very-high',name:'Zeer hoog',css:'risk-very-high'}
];
const EFFECT_LABELS={
  3:['Klein','Matig','Ernstig'],
  4:['Verwaarloosbaar','Klein','Behoorlijk','Ernstig'],
  5:['Verwaarloosbaar','Klein','Matig','Behoorlijk','Ernstig'],
  6:['Verwaarloosbaar','Klein','Matig','Behoorlijk','Ernstig','Zeer ernstig'],
  7:['Zeer klein','Klein','Beperkt','Matig','Behoorlijk','Ernstig','Catastrofaal']
};
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function fmt(v=''){return esc(v).replace(/\n/g,'<br>');}
function riskById(id){return RISK_LEVELS.find(r=>r.id===id)||RISK_LEVELS[0];}
function effectLabel(config,i){return EFFECT_LABELS[config.effectCount]?.[i]||String(i+1);}
async function loadConfig(){
  const res=await fetch(WORKER_URL+'?t='+Date.now(),{cache:'no-store'});
  if(!res.ok) throw new Error('De gepubliceerde risicomatrix kon niet worden opgehaald.');
  const data=await res.json();
  if(!data?.config) throw new Error('Geen gepubliceerde configuratie gevonden.');
  return data.config;
}
function renderCombined(config){
 const selected=document.getElementById('printValue').value;
 const values=selected==='all'?config.values:[selected];
 const chanceHeads=Array.from({length:config.chanceCount},(_,c)=>'<th class="chance-head">'+(c+1)+'<br>'+fmt(config.chanceDescriptions?.[c]||'')+'</th>').join('');
 const sections=values.map(v=>{
 const cols='<col style="width:12%"><col style="width:40%">'+Array.from({length:config.chanceCount},()=>'<col style="width:'+(48/config.chanceCount)+'%">').join('');
 const rows=Array.from({length:config.effectCount},(_,i)=>config.effectCount-1-i).map(e=>'<tr><th class="effect-label">'+effectLabel(config,e)+'</th><td class="effect-desc">'+fmt(config.effectDescriptions?.[v]?.[e]||'')+'</td>'+Array.from({length:config.chanceCount},(_,c)=>{const r=riskById((config.riskMatrices?.[v]||config.riskMatrix)[e][c]);return '<td class="risk-cell '+r.css+'">'+esc(r.name)+'</td>';}).join('')+'</tr>').join('');
 return '<section class="value-print-section"><h2>'+esc(v)+'</h2><table class="combined-table"><colgroup>'+cols+'</colgroup><thead><tr><th>Effectklasse</th><th>Effectbeschrijving</th>'+chanceHeads+'</tr></thead><tbody>'+rows+'</tbody></table></section>';
 }).join('');
 document.getElementById('effectCriteria').innerHTML=sections;
 document.getElementById('riskMatrix').innerHTML='';
}
async function init(){
  try{
    const config=await loadConfig();
    const select=document.getElementById('printValue');select.innerHTML='<option value="all">Alle waarden</option>'+config.values.map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join('');select.addEventListener('change',()=>renderCombined(config));renderCombined(config);
    document.getElementById('printMeta').textContent=new Date().toLocaleDateString('nl-NL');
  }catch(err){document.getElementById('printSheet').innerHTML='<p class="load-error">'+esc(err.message)+'</p>';}
}
document.getElementById('printBtn').addEventListener('click',()=>window.print());
init();
