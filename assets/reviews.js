const form=document.querySelector('#reviewForm');
const details=document.querySelector('#reviewDetails');
const status=document.querySelector('#reviewStatus');
const success=document.querySelector('#reviewSuccess');
const fallback=document.querySelector('#reviewFallback');
const params=new URLSearchParams(location.search);
const topic=params.get('topic')==='malakhova'?'Материалы о системе Татьяны Малаховой':'Сайт ТКМ';
const source=(params.get('source')||'прямая ссылка').slice(0,80);
const visitorName=(params.get('name')||'').trim().slice(0,80);

document.querySelector('#reviewTopic').value=topic;
document.querySelector('#reviewSource').value=source;
if(visitorName){
  document.querySelector('#reviewName').value=visitorName;
  document.querySelector('#reviewGreeting').textContent=`${visitorName}, спасибо, что заглянули.`;
}

const ratingLabels=[...document.querySelectorAll('.rating-options label')];
ratingLabels.forEach((label,index)=>{
  label.querySelector('input').addEventListener('change',()=>{
    ratingLabels.forEach((item,itemIndex)=>item.classList.toggle('is-active',itemIndex<=index));
    details.hidden=false;
    document.querySelector('#reviewText').focus({preventScroll:true});
  });
});

function fallbackHref(){
  const data=new FormData(form);
  const lines=[
    `Оценка: ${data.get('Оценка')||'—'} из 5`,
    `Раздел: ${topic}`,
    `Имя: ${data.get('Имя')||'—'}`,
    `Отзыв: ${data.get('Отзыв')||'—'}`,
    `Можно публиковать: ${data.get('Разрешение на публикацию')==='Да'?'да':'нет'}`
  ];
  return `mailto:ogp56@bk.ru?subject=${encodeURIComponent('Отзыв о сайте ТКМ')}&body=${encodeURIComponent(lines.join('\n'))}`;
}

form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  const button=form.querySelector('[type="submit"]');
  button.disabled=true;
  status.classList.remove('is-error');
  status.textContent='Отправляем отзыв…';
  fallback.hidden=true;
  try{
    const payload=Object.fromEntries(new FormData(form).entries());
    const response=await fetch('https://formsubmit.co/ajax/ogp56@bk.ru',{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(payload)
    });
    const result=await response.json().catch(()=>({}));
    if(!response.ok||result.success===false)throw new Error(result.message||'Не удалось отправить форму');
    form.hidden=true;
    success.hidden=false;
    success.focus();
  }catch(error){
    status.classList.add('is-error');
    status.textContent='Сервис доставки сейчас не ответил. Можно отправить тот же отзыв обычным письмом.';
    fallback.href=fallbackHref();
    fallback.hidden=false;
    button.disabled=false;
  }
});

if(params.get('sent')==='1'){
  form.hidden=true;
  success.hidden=false;
}

const builder=document.querySelector('#requestBuilder');
if(params.get('admin')==='1'){
  builder.hidden=false;
  const nameInput=document.querySelector('#inviteName');
  const linkInput=document.querySelector('#inviteLink');
  const messageInput=document.querySelector('#inviteMessage');
  const builderStatus=document.querySelector('#builderStatus');
  const updateInvite=()=>{
    const name=nameInput.value.trim();
    const url=new URL('reviews.html',location.href);
    url.searchParams.set('topic','malakhova');
    url.searchParams.set('source','personal-invite');
    if(name)url.searchParams.set('name',name);
    linkInput.value=url.href;
    messageInput.value=`${name?`${name}, с`:'С'}пасибо, что познакомились с материалами ТКМ. Поделитесь впечатлением — это займёт около минуты: ${url.href}`;
  };
  nameInput.addEventListener('input',updateInvite);
  updateInvite();
  document.querySelector('#copyInvite').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(messageInput.value);builderStatus.textContent='Приглашение скопировано.'}catch{messageInput.select();builderStatus.textContent='Текст выделен — нажмите Ctrl+C.'}
  });
  const shareButton=document.querySelector('#shareInvite');
  if(!navigator.share)shareButton.hidden=true;
  shareButton.addEventListener('click',async()=>{try{await navigator.share({title:'Отзыв о ТКМ',text:messageInput.value,url:linkInput.value})}catch{}});
}
