const state={engine:null,mode:'symptoms',selected:[],diagnoses:[],protocol:[],scores:[],symptomIndex:[],diagnosisIndex:[],searchTimer:null};
const $=selector=>document.querySelector(selector);
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const normalize=value=>String(value??'').toLocaleLowerCase('ru-RU').replace(/ё/g,'е').replace(/[-–—.]/g,' ').replace(/\s+/g,' ').trim();
const reviewMode=new URLSearchParams(location.search).get('review')==='1';

function requireSafeContext(){
  if(!state.engine){alert('Расчётные данные ещё не загружены.');return false}
  if($('#redFlags').checked||TkmProtocolUtils.hasUrgent([...state.selected,...state.diagnoses])){
    alert('При тревожных или острых симптомах расчёт точек не выполняется. Обратитесь за медицинской помощью; при угрозе жизни вызовите экстренную службу.');return false;
  }
  return true;
}
function pointVisual(point){
  const code=escapeHtml(point.code);
  return `<div class="point-visual" role="img" aria-label="Справочная карточка точки ${code}"><svg viewBox="0 0 180 210" aria-hidden="true"><path d="M90 19c-20 0-31 15-31 34 0 13 6 22 13 30l-10 39-20 69m48-108v108m18-108 10 39 20 69"/><circle cx="90" cy="50" r="23"/><circle cx="90" cy="112" r="9"/><path d="M55 104h70"/><text x="90" y="116">${code}</text></svg><strong>${code}</strong><small>Справочная схема. Точную локализацию сверяйте по учебному атласу.</small></div>`;
}

function buildSearchIndex(items){return Object.keys(items||{}).map(name=>({name,search:normalize(name)}))}

function renderSuggestions(){
  const query=normalize($('#symptomSearch').value);
  const selected=new Set(state.selected);
  let names=state.symptomIndex.filter(item=>!selected.has(item.name));
  if(query)names=names.filter(item=>item.search.includes(query));
  else{
    const popular=['Бессонница','Головная боль в висках','Боль в пояснице','Вздутие живота','Боль в колене','Тревога','Хроническая усталость','Высокое давление'];
    const available=new Set(names.map(item=>item.name));
    names=popular.filter(name=>available.has(name)).map(name=>({name}));
  }
  $('#symptomSuggestions').innerHTML=names.slice(0,12).map(item=>`<button type="button" data-add-symptom="${escapeHtml(item.name)}">+ ${escapeHtml(item.name)}</button>`).join('')||'<small>Совпадений не найдено. Попробуйте сократить запрос.</small>';
}

function renderDiagnosisSuggestions(){
  const query=normalize($('#diagnosisSearch').value);
  const selected=new Set(state.diagnoses);
  let names=state.diagnosisIndex.filter(item=>!selected.has(item.name));
  if(query)names=names.filter(item=>item.search.includes(query));
  $('#diagnosisSuggestions').innerHTML=names.slice(0,12).map(item=>`<button type="button" data-select-diagnosis="${escapeHtml(item.name)}">${escapeHtml(item.name)}</button>`).join('')||'<small>Совпадений не найдено. Попробуйте сократить запрос.</small>';
}

function scheduleSearch(render){
  clearTimeout(state.searchTimer);
  state.searchTimer=setTimeout(render,80);
}

function renderSelected(){
  $('#selectedSymptoms').innerHTML=state.selected.length?state.selected.map(name=>`<button type="button" data-remove-symptom="${escapeHtml(name)}">${escapeHtml(name)} <span>×</span></button>`).join(''):'<small>Пока ничего не выбрано</small>';
  renderSuggestions();
}

function renderSelectedDiagnosis(){
  $('#selectedDiagnosis').innerHTML=state.diagnoses.length?state.diagnoses.map(name=>`<button type="button" data-remove-diagnosis="${escapeHtml(name)}">${escapeHtml(name)} <span>×</span></button>`).join(''):'<small>Пока ничего не выбрано</small>';
  renderDiagnosisSuggestions();
}

function setMode(mode){
  state.mode=mode;
  document.querySelectorAll('[data-mode]').forEach(button=>{
    const active=button.dataset.mode===mode;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  $('.symptom-panel').hidden=mode!=='symptoms';
  $('.diagnosis-panel').hidden=mode!=='diagnosis';
  $('#protocolResult').hidden=true;
  (mode==='symptoms'?$('#symptomSearch'):$('#diagnosisSearch')).focus();
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

const pointAtlas={
  C6:'arm-inner',C7:'arm-inner',C9:'hand-back',
  E41:'foot-top',E45:'foot-top',
  F2:'foot-top',F8:'leg-inner',
  GI11:'arm-outer',GI2:'hand-back',GI7:'hand-back',
  IG3:'hand-back',IG6:'hand-back',IG8:'arm-outer',
  MC4:'arm-inner',MC7:'arm-inner',MC9:'hand-back',
  P5:'arm-inner',P6:'arm-inner',P9:'p9-wrist.png',
  R7:'leg-inner',RP8:'leg-inner',
  TR3:'hand-back',
  V63:'foot-side',V65:'foot-side',V67:'foot-side',
  VB36:'leg-front',VB43:'foot-top'
};

const atlasRotation={
  'arm-inner':'rotate-90','foot-side':'rotate-180','foot-top':'rotate-90',
  'knee-side':'rotate-90','leg-front':'rotate-90'
};

function atlasPhoto(code){
  const image=pointAtlas[code];
  if(!image)return null;
  const src=image.includes('.')?`assets/point-atlas/${image}`:`assets/point-atlas/${image}.webp`;
  return {src,orientation:code==='P9'?'scale-85':atlasRotation[image]||''};
}

function analyzeDiagnoses(selected){
  const scores=new Map();
  selected.forEach(diagnosis=>Object.entries(state.engine.diagnoses[diagnosis]||{}).forEach(([meridian,weight])=>scores.set(meridian,(scores.get(meridian)||0)+weight)));
  return [...scores.entries()].sort((a,b)=>b[1]-a[1]);
}

function buildProtocol(scores,acutePain,pointLimit){
  if(!scores.length)return [];
  const points=[],seen=new Set();let protectedIndex=-1;
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
    if(xi){
      const before=points.length;
      add(code,xi,'требует проверки','Xi-точка: применяется только после медицинской оценки причины острой боли',score);
      if(points.length>before)protectedIndex=points.length-1;
    }
  }
  return TkmProtocolUtils.limitPoints(points,pointLimit,protectedIndex);
}

function calculate(){
  if(!requireSafeContext())return;
  if(state.mode==='symptoms'&&!state.selected.length){alert('Выберите хотя бы одну жалобу.');return}
  if(state.mode==='diagnosis'&&!state.diagnoses.length){alert('Выберите хотя бы один диагноз.');return}
  state.scores=state.mode==='diagnosis'
    ?analyzeDiagnoses(state.diagnoses)
    :analyzeSymptoms(state.selected);
  const value=$('#pointLimit').value;
  const limit=value==='all'?null:Number(value);
  state.protocol=buildProtocol(state.scores,false,limit);
  renderProtocol();
}

function renderProtocol(){
  const top=state.scores.slice(0,3);
  const source=state.mode==='diagnosis'?`<div><span>Выбрано диагнозов</span><b>${state.diagnoses.length}</b></div>`:`<div><span>Выбрано жалоб</span><b>${state.selected.length}</b></div>`;
  $('#prioritySummary').innerHTML=`${source}${top.map(([code,score],index)=>`<div><span>${index===0?'Ведущий меридиан':`Приоритет ${index+1}`}</span><b>${escapeHtml(state.engine.meridians[code]?.name||code)} · ${score}</b></div>`).join('')}`;
  $('#protocolGrid').innerHTML=state.protocol.map((point,index)=>{
    const photo=atlasPhoto(point.code);
    const visual=photo?`<button type="button" class="point-image" data-point-detail="${index}" aria-label="Открыть схему точки ${escapeHtml(point.code)}"><img class="${photo.orientation}" src="${photo.src}" alt="Схема области точки ${escapeHtml(point.code)}" loading="lazy"><strong class="point-focus-label">${escapeHtml(point.code)}</strong></button>`:'<div class="point-image placeholder">Проверенная схема именно этой точки пока не добавлена</div>';
    return `<article class="protocol-card"><div class="protocol-number">${String(index+1).padStart(2,'0')}</div>${visual}<div class="protocol-body"><span>${escapeHtml(point.meridianName)} · балл ${point.score}</span><h3>${escapeHtml(point.code)}${point.name?` · ${escapeHtml(point.name)}`:''}</h3><p class="action ${point.action}">${escapeHtml(point.action)}</p><p>${escapeHtml(point.rule)}</p><button type="button" data-point-detail="${index}">Почему выбрана →</button></div></article>`;
  }).join('')||'<div class="empty">Для выбранных данных точки не сформированы.</div>';
  $('#protocolResult').hidden=false;
  $('#protocolResult').scrollIntoView({behavior:'smooth',block:'start'});
}

function showPoint(index){
  const point=state.protocol[index];if(!point)return;
  const photo=atlasPhoto(point.code);
  $('#dialogContent').innerHTML=`<p class="eyebrow dark">${escapeHtml(point.meridianName)} · ${escapeHtml(point.pointType)}</p><h2>${escapeHtml(point.code)}${point.name?` · ${escapeHtml(point.name)}`:''}</h2>${photo?`<div class="detail-image-frame"><img class="detail-image ${photo.orientation}" src="${photo.src}" alt="Схема области точки ${escapeHtml(point.code)}"><strong class="point-focus-label">${escapeHtml(point.code)}</strong></div>`:''}<p class="source-note">Фото из личного учебного архива пользователя. Цветная метка показывает выбранный код; точную локализацию и обозначение сверяйте с исходной схемой.</p><h3>Почему точка в списке</h3><p>${escapeHtml(point.rule)}</p><h3>Справочное описание</h3><p class="detail-text">${escapeHtml(point.pointDescription)}</p>`;
  $('#detailDialog').showModal();
}

function reportText(){
  const priorities=state.scores.slice(0,5).map(([code,score])=>`${state.engine.meridians[code]?.name||code}: ${score}`).join(', ');
  const source=state.mode==='diagnosis'?`Диагнозы: ${state.diagnoses.join(', ')}`:`Жалобы: ${state.selected.join(', ')}`;
  return `СПИСОК ТОЧЕК ТКМ\n\nСправочно-расчётный результат. Перед применением перепроверьте точки и противопоказания.\n\n${source}\nПриоритетные меридианы: ${priorities}\n\n${state.protocol.map((p,i)=>`${i+1}. ${p.code}${p.name?` (${p.name})`:''}\nМеридиан: ${p.meridianName}\nДействие: ${p.action}\nПравило: ${p.rule}\nТип: ${p.pointType}\nОписание: ${p.pointDescription}`).join('\n\n')}`;
}
function download(name,type,content){const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([content],{type}));link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000)}
function exportProtocol(kind){
  if(!state.protocol.length)return;
  const text=reportText();
  if(kind==='txt')download('protokol-tkm.txt','text/plain;charset=utf-8',text);
  if(kind==='word')download('protokol-tkm.doc','application/msword;charset=utf-8',`<!doctype html><meta charset="utf-8"><body><pre style="white-space:pre-wrap;font-family:Arial">${escapeHtml(text)}</pre></body>`);
  if(kind==='pdf'){const win=open('','_blank');win.document.write(`<!doctype html><meta charset="utf-8"><title>Предварительный протокол ТКМ</title><style>body{font-family:Arial;max-width:800px;margin:40px auto;white-space:pre-wrap}</style>${escapeHtml(text)}`);win.document.close();setTimeout(()=>win.print(),500)}
  $('#exportDialog').close();
}

$('#symptomSearch').addEventListener('input',()=>scheduleSearch(renderSuggestions));
$('#diagnosisSearch').addEventListener('input',()=>scheduleSearch(renderDiagnosisSuggestions));
$('#clearSymptoms').addEventListener('click',()=>{state.selected=[];renderSelected();$('#protocolResult').hidden=true});
$('#clearDiagnosis').addEventListener('click',()=>{state.diagnoses=[];renderSelectedDiagnosis();$('#protocolResult').hidden=true});
$('#calculateProtocol').addEventListener('click',calculate);
document.addEventListener('click',event=>{
  const mode=event.target.closest('[data-mode]');if(mode)setMode(mode.dataset.mode);
  const add=event.target.closest('[data-add-symptom]');if(add&&!state.selected.includes(add.dataset.addSymptom)){state.selected.push(add.dataset.addSymptom);$('#symptomSearch').value='';renderSelected()}
  const remove=event.target.closest('[data-remove-symptom]');if(remove){state.selected=state.selected.filter(item=>item!==remove.dataset.removeSymptom);renderSelected()}
  const diagnosis=event.target.closest('[data-select-diagnosis]');if(diagnosis&&!state.diagnoses.includes(diagnosis.dataset.selectDiagnosis)){state.diagnoses.push(diagnosis.dataset.selectDiagnosis);$('#diagnosisSearch').value='';renderSelectedDiagnosis()}
  const removeDiagnosis=event.target.closest('[data-remove-diagnosis]');if(removeDiagnosis){state.diagnoses=state.diagnoses.filter(item=>item!==removeDiagnosis.dataset.removeDiagnosis);renderSelectedDiagnosis()}
  const detail=event.target.closest('[data-point-detail]');if(detail)showPoint(Number(detail.dataset.pointDetail));
  if(event.target.closest('[data-open-export]'))$('#exportDialog').showModal();
  if(event.target.closest('[data-close-dialog]'))event.target.closest('dialog').close();
  const exportButton=event.target.closest('[data-export]');if(exportButton)exportProtocol(exportButton.dataset.export);
});
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog&&!dialog.hasAttribute('data-static-dialog'))dialog.close()}));
const started=Date.now();setInterval(()=>{const seconds=Math.floor((Date.now()-started)/1000);$('#sessionTime').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`},1000);

Promise.all(['assets/tkm-engine-data.json','assets/diagnoses-data.json'].map(url=>fetch(url).then(response=>{if(!response.ok)throw new Error(`Engine HTTP ${response.status}`);return response.json()})))
  .then(([engine,diagnoses])=>{
    state.engine={...engine,diagnoses};state.symptomIndex=buildSearchIndex(engine.symptoms);state.diagnosisIndex=buildSearchIndex(diagnoses);renderSelected();renderSelectedDiagnosis();
    $('#calculateProtocol').disabled=false;
    $('#calculateProtocol').textContent=reviewMode?'Сформировать экспертный список':'Рассчитать список точек';
    $('#engineStatus').textContent=reviewMode?'Экспертный режим: проверьте логику, точки и противопоказания.':'Справочный расчёт доступен. Результат не является диагнозом или назначением; перепроверьте точки и противопоказания.';
  })
  .catch(()=>{
    const message='<small>Не удалось загрузить расчётные данные. Обновите страницу.</small>';
    $('#symptomSuggestions').innerHTML=message;$('#diagnosisSuggestions').innerHTML=message;$('#engineStatus').textContent='Ошибка загрузки данных.';$('#calculateProtocol').disabled=true;
  });

const gavrikForm=document.querySelector('#gavrikForm');
const gavrikAnswers=[
  [/питан|малахов/i,'В разделе «Материалы» собраны принципы системы Татьяны Малаховой и общие ориентиры здорового питания. Индивидуальные ограничения лучше согласовать с врачом.'],
  [/точк|меридиан|протокол/i,'Выберите жалобу или диагноз в приложении. ТКМ ранжирует связанные меридианы, предлагает предварительный список точек и объясняет логику выбора. Перед применением перепроверьте результат.'],
  [/диагноз/i,'Диагноз устанавливает врач. На сайте диагноз используется только как исходное условие для справочного расчёта, а не как медицинское заключение.'],
  [/боль|сроч|ухудш|температур/i,'При выраженной боли, резком ухудшении или тревожных симптомах не полагайтесь на сайт — обратитесь за очной медицинской помощью.'],
  [/кто|автор|олег|врач/i,'Автор проекта — Олег Палкин, врач, выпускник ПГМИ; специализация: рефлексотерапия и детская неврология.'],
];
gavrikForm?.addEventListener('submit',event=>{
  event.preventDefault();
  const question=document.querySelector('#gavrikQuestion').value.trim();
  const found=gavrikAnswers.find(([pattern])=>pattern.test(question));
  document.querySelector('#gavrikAnswer').textContent=found?found[1]:'Я пока отвечаю по материалам этого сайта. Уточните, пожалуйста: вас интересуют точки, меридианы, диагноз, питание по Малаховой или безопасность применения?';
});
