const mealOptions={
  breakfast:[
    {name:'Овсяная каша и творог',why:'Спокойный завтрак с зерновым продуктом и источником белка.',swap:'Овсянку можно заменить гречкой, творог — натуральным йогуртом.'},
    {name:'Гречка и натуральный йогурт',why:'Крупа даёт основу приёма пищи, кисломолочный продукт дополняет её.',swap:'Гречку можно заменить овсянкой, йогурт — творогом.'},
    {name:'Овощи и яйца',why:'Несладкий вариант с овощами и источником белка.',swap:'Яйца можно заменить творогом, сохранив овощную часть.'}
  ],
  lunch:[
    {name:'Салат, птица и тушёные овощи',why:'Овощи сочетаются с нежирным источником белка.',swap:'Птицу можно заменить рыбой, тушёные овощи — запечёнными.'},
    {name:'Салат, рыба и овощной гарнир',why:'Рыба составляет белковую часть, овощи — основную часть гарнира.',swap:'Рыбу можно заменить птицей, салат — свежими овощами.'},
    {name:'Салат и чечевица',why:'Бобовые дают растительный вариант с овощным дополнением.',swap:'Чечевицу можно заменить фасолью или нутом при хорошей переносимости.'}
  ],
  dinner:[
    {name:'Овощи и рыба',why:'Ужин строится вокруг овощей и умеренной белковой части.',swap:'Рыбу можно заменить птицей.'},
    {name:'Салат и птица',why:'Простой вариант без тяжёлого многокомпонентного гарнира.',swap:'Птицу можно заменить рыбой, салат — запечёнными овощами.'},
    {name:'Овощи и яйца',why:'Несладкий овощной ужин с источником белка.',swap:'Яйца можно заменить творогом, если он подходит по переносимости.'}
  ]
};

const mealNames={breakfast:'Завтрак',lunch:'Обед',dinner:'Ужин'};
const selects=[...document.querySelectorAll('[data-meal]')];
const reviewInvite=document.querySelector('#reviewInvite');

function renderMeal(meal,select){
  const option=mealOptions[meal][Number(select.value)||0];
  const note=document.querySelector(`[data-meal-note="${meal}"]`);
  if(note)note.textContent=`Почему: ${option.why} Замена: ${option.swap}`;
  return option;
}

function renderSummary(){
  const chosen=selects.map(select=>({meal:select.dataset.meal,option:renderMeal(select.dataset.meal,select)}));
  const summary=document.querySelector('#mealSummary');
  if(summary)summary.innerHTML=`<strong>Ваш пример дня:</strong> ${chosen.map(item=>`${mealNames[item.meal]} — ${item.option.name}`).join('; ')}.`;
}

selects.forEach(select=>{
  mealOptions[select.dataset.meal].forEach((option,index)=>select.add(new Option(option.name,String(index))));
  select.addEventListener('change',()=>{
    renderSummary();
    if(reviewInvite)reviewInvite.hidden=false;
  });
});
renderSummary();
