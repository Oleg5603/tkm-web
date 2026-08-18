const state={engine:null,atlas:[],selected:[],protocol:[],scores:[]};
const $=selector=>document.querySelector(selector);
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const normalize=value=>String(value??'').toLocaleLowerCase('ru-RU').replace(/ё/g,'е').replace(/[-–—.]/g,' ').replace(/\s+/g,' ').trim();
const clean=value=>String(value??'').replace(/www\.eledia\.ru/gi,'').replace(/^\s*\d+\s*/,'').replace(/\s+/g,' ').trim();

function symptomNames(){return state.engine?Object.keys(state.engine.symptoms):[]}

function renderSuggestions(){
  const query=normalize($('#symptomSearch').value);
  const selected=new Set(state.selected);
  let names=symptomNames().filter(name=>!selected.has(name));
  if(query)names=names.filter(name=>normalize(name).includes(query));
  else{
    const popular=['Бессонница','Головная боль в висках','Боль в пояснице','Вздутие живота','Боль в колене','Тревога','Хроническая усталость','Высокое давление'];
    names=popular.filter(name=>names.includes(name));
  }
  $('#symptomSuggestions').innerHTML=names.slice(0,12).map(name=>`<button type="button" data-add-symptom="${escapeHtml(name)}">+ ${escapeHtml(name)}</button>`).join('')||'<small>Совпадений не найдено. Попробуйте сократить запрос.</small>';
}

function renderSelected(){
  $('#selectedSymptoms').innerHTML=state.selected.length?state.selected.map(name=>`<button type="button" data-remove-symptom="${escapeHtml(name)}">${escapeHtml(name)} <span>×</span></button>`).join(''):'<small>Пока ничего не выбрано</small>';
  renderSuggestions();
}

function analyzeSymptoms(selected){
  const scores=new Map();
  selected.forEach(symptom=>{
    Object.entries(state.engine.symptoms[symptom]||{}).forEach(([meridian,weight])=>scores.set(meridian,(scores.get(meridian)||0)+weight));
  });
  return [...scores.entries()].sort((a,b)=>b[1]-a[1]);
}

function elementMeridians(element){
  return Object.entries(state.engine.meridians).filter(([,item])=>item.element===element).map(([code])=>code);
}

function inverseCycle(cycle,target){
  return Object.entries(cycle).find(([,value])=>value===target)?.[0]||null;
}

function parsePoint(value){
  const match=String(value).match(/^([^\s(]+)\s*(?:\((.*?)\))?/);
  return {code:match?.[1]||String(value),name:match?.[2]||''};
}

function buildProtocol(scores,acutePain,pointLimit){
  if(!scores.length)return [];
  const points=[],seen=new Set();
  const add=(meridian,rawPoint,action,rule,score)=>{
    const point=parsePoint(rawPoint);if(!point.code||seen.has(point.code))return;
    seen.add(point.code);
    const [pointType,pointDescription]=state.engine.point_types[point.code]||['Справочная точка','Описание типа точки уточняется'];
    points.push({meridian,meridianName:state.engine.meridians[meridian]?.name||meridian,code:point.code,name:point.name,action,rule,score,pointType,pointDescription});
  };
  const ranked=pointLimit===0?scores.slice(0,2):scores;
  ranked.forEach(([code,score],index)=>{
    const meridian=state.engine.meridians[code],toning=state.engine.toning_sedating[code];
    if(!meridian||!toning)return;
    add(code,toning['тонизация'],'тонизация',`Мать–сын: недостаток ${meridian.name} — тонизация`,score);
    const motherElement=inverseCycle(state.engine.sheng_cycle,meridian.element);
    if(motherElement){
      const mother=elementMeridians(motherElement)[0];
      if(mother)add(mother,state.engine.toning_sedating[mother]['тонизация'],'тонизация',`Мать–сын: укрепляем «мать» ${motherElement} → ${meridian.name}`,score);
    }
    if(index!==0)return;
    const controllingElement=inverseCycle(state.engine.ko_cycle,meridian.element);
    if(controllingElement){
      const controlling=elementMeridians(controllingElement)[0];
      if(controlling)add(controlling,state.engine.toning_sedating[controlling]['седация'],'седация',`Муж–жена: снимаем избыток «мужа» ${controllingElement} → освобождаем ${meridian.name}`,score);
    }
    if(score>=5){
      const antagonist=state.engine.midnight_noon[code];
      if(antagonist)add(antagonist,state.engine.toning_sedating[antagonist]['тонизация'],'тонизация',`Полдень–полночь: антагонист ${meridian.name}`,score);
    }
  });
  if(acutePain&&ranked.length){
    const [code,score]=ranked[0],xi=state.engine.xi_points[code];
    if(xi)add(code,xi,'обезболивание',`Xi-точка: острая боль / спазм — ${state.engine.meridians[code].name}`,score);
  }
  return pointLimit==null?points:points.slice(0,pointLimit===0?5:pointLimit);
}

function comparable(value){return String(value).toUpperCase().replace(/[РСЕ]/g,char=>({Р:'P',С:'C',Е:'E'}[char])).replace(/([A-Z]+)\s*[.·-]\s*(\d+)/g,'$1$2')}
function atlasMatch(code){
  const needle=comparable(code).replace(/[^A-Z0-9]/g,'');
  const pattern=new RegExp(`(^|[^A-Z])${needle}(?!\\d)`);
  return state.atlas.find(item=>pattern.test(comparable(`${item.title} ${item.description}`)))||null;
}

function calculate(){
  if(!state.selected.length){alert('Выберите хотя бы одну жалобу.');return}
  state.scores=analyzeSymptoms(state.selected);
  const value=$('#pointLimit').value;
  const limit=value==='all'?null:Number(value);
  state.protocol=buildProtocol(state.scores,$('#acutePain').checked,limit);
  renderProtocol();
}

function renderProtocol(){
  const top=state.scores.slice(0,3);
  $('#prioritySummary').innerHTML=`<div><span>Выбрано жалоб</span><b>${state.selected.length}</b></div>${top.map(([code,score],index)=>`<div><span>${index===0?'Ведущий меридиан':`Приоритет ${index+1}`}</span><b>${escapeHtml(state.engine.meridians[code]?.name||code)} · ${score}</b></div>`).join('')}`;
  $('#protocolGrid').innerHTML=state.protocol.map((point,index)=>{
    const atlas=atlasMatch(point.code);
    return `<article class="protocol-card"><div class="protocol-number">${String(index+1).padStart(2,'0')}</div>${atlas?`<button type="button" class="point-image" data-point-detail="${index}"><img src="${escapeHtml(atlas.image)}" alt="Расположение точки ${escapeHtml(point.code)} по Атласу Леднёва" loading="lazy"></button>`:'<div class="point-image placeholder">Схема локализации уточняется</div>'}<div class="protocol-body"><span>${escapeHtml(point.meridianName)} · балл ${point.score}</span><h3>${escapeHtml(point.code)}${point.name?` · ${escapeHtml(point.name)}`:''}</h3><p class="action ${point.action}">${escapeHtml(point.action)}</p><p>${escapeHtml(point.rule)}</p><button type="button" data-point-detail="${index}">Почему выбрана →</button></div></article>`;
  }).join('')||'<div class="empty">Для выбранных данных точки не сформированы.</div>';
  $('#protocolResult').hidden=false;
  $('#protocolResult').scrollIntoView({behavior:'smooth',block:'start'});
}

function showPoint(index){
  const point=state.protocol[index];if(!point)return;
  const atlas=atlasMatch(point.code);
  $('#dialogContent').innerHTML=`<p class="eyebrow dark">${escapeHtml(point.meridianName)} · ${escapeHtml(point.pointType)}</p><h2>${escapeHtml(point.code)}${point.name?` · ${escapeHtml(point.name)}`:''}</h2>${atlas?`<img class="detail-image" src="${escapeHtml(atlas.image)}" alt="Локализация точки ${escapeHtml(point.code)}"><p class="source-note">Иллюстрация: Атлас Леднёва, страница ${atlas.page}</p>`:''}<h3>Почему точка в черновике</h3><p>${escapeHtml(point.rule)}</p><h3>Справочное описание</h3><p class="detail-text">${escapeHtml(point.pointDescription)}</p>`;
  $('#detailDialog').showModal();
}

function reportText(){
  const priorities=state.scores.slice(0,5).map(([code,score])=>`${state.engine.meridians[code]?.name||code}: ${score}`).join(', ');
  return `ЧЕРНОВИК ПРОТОКОЛА ТКМ\n\nСправочно-расчётный результат. Требует проверки квалифицированным специалистом.\n\nЖалобы: ${state.selected.join(', ')}\nПриоритетные меридианы: ${priorities}\n\n${state.protocol.map((p,i)=>`${i+1}. ${p.code}${p.name?` (${p.name})`:''}\nМеридиан: ${p.meridianName}\nДействие: ${p.action}\nПравило: ${p.rule}\nТип: ${p.pointType}\nОписание: ${p.pointDescription}`).join('\n\n')}`;
}
function download(name,type,content){const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([content],{type}));link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000)}
function exportProtocol(kind){
  if(!state.protocol.length)return;
  const text=reportText();
  if(kind==='txt')download('chernovik-tkm.txt','text/plain;charset=utf-8',text);
  if(kind==='word')download('chernovik-tkm.doc','application/msword;charset=utf-8',`<!doctype html><meta charset="utf-8"><body><pre style="white-space:pre-wrap;font-family:Arial">${escapeHtml(text)}</pre></body>`);
  if(kind==='pdf'){const win=open('','_blank');win.document.write(`<!doctype html><meta charset="utf-8"><title>Черновик ТКМ</title><style>body{font-family:Arial;max-width:800px;margin:40px auto;white-space:pre-wrap}</style>${escapeHtml(text)}`);win.document.close();setTimeout(()=>win.print(),500)}
  $('#exportDialog').close();
}

$('#symptomSearch').addEventListener('input',renderSuggestions);
$('#clearSymptoms').addEventListener('click',()=>{state.selected=[];renderSelected();$('#protocolResult').hidden=true});
$('#calculateProtocol').addEventListener('click',calculate);
document.addEventListener('click',event=>{
  const add=event.target.closest('[data-add-symptom]');if(add&&!state.selected.includes(add.dataset.addSymptom)){state.selected.push(add.dataset.addSymptom);$('#symptomSearch').value='';renderSelected()}
  const remove=event.target.closest('[data-remove-symptom]');if(remove){state.selected=state.selected.filter(item=>item!==remove.dataset.removeSymptom);renderSelected()}
  const detail=event.target.closest('[data-point-detail]');if(detail)showPoint(Number(detail.dataset.pointDetail));
  if(event.target.closest('[data-open-export]'))$('#exportDialog').showModal();
  if(event.target.closest('[data-close-dialog]'))event.target.closest('dialog').close();
  const exportButton=event.target.closest('[data-export]');if(exportButton)exportProtocol(exportButton.dataset.export);
});
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()}));

const metricKey='tkm_lednev_visits';const visits=Number(localStorage.getItem(metricKey)||0)+1;localStorage.setItem(metricKey,String(visits));$('#localVisits').textContent=visits;
const started=Date.now();setInterval(()=>{const seconds=Math.floor((Date.now()-started)/1000);$('#sessionTime').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`},1000);

Promise.all([
  fetch('assets/tkm-engine-data.json').then(response=>{if(!response.ok)throw new Error(`Engine HTTP ${response.status}`);return response.json()}),
  fetch('assets/atlas-data.json').then(response=>{if(!response.ok)throw new Error(`Atlas HTTP ${response.status}`);return response.json()})
]).then(([engine,atlas])=>{state.engine=engine;state.atlas=atlas.items||[];renderSelected()}).catch(()=>{$('#symptomSuggestions').innerHTML='<small>Не удалось загрузить расчётные данные. Обновите страницу.</small>';$('#calculateProtocol').disabled=true});
