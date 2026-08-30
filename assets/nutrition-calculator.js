const componentChoices={
  grain:['овсяная каша','гречка','бурый рис','перловка','цельнозерновой хлеб'],
  breakfastProtein:['творог','натуральный йогурт','яйца','несладкий растительный йогурт'],
  protein:['птица','рыба','яйца','чечевица','фасоль','нут','тофу'],
  vegetables:['свежие овощи','овощной салат','тушёные овощи','запечённые овощи','овощи на пару'],
  fruit:['ягоды','яблоко','груша','цитрусовые','без фруктового дополнения'],
  extra:['зелень','семена','небольшая порция орехов','натуральный йогурт','без дополнения']
};
const component=(label,value,choice)=>({label,value,options:componentChoices[choice]});

const mealOptions={
  breakfast:[
    {name:'Каша, белковая часть и ягоды',why:'Зерновая основа дополнена источником белка и фруктовой частью.',components:[component('Основа','овсяная каша','grain'),component('Белковая часть','творог','breakfastProtein'),component('Фрукты или ягоды','ягоды','fruit')]},
    {name:'Гречка, йогурт и яблоко',why:'Простой вариант из крупы, кисломолочного продукта и фрукта.',components:[component('Основа','гречка','grain'),component('Белковая часть','натуральный йогурт','breakfastProtein'),component('Фрукты или ягоды','яблоко','fruit')]},
    {name:'Овощи, яйца и хлеб',why:'Несладкий завтрак с овощами, белковой частью и зерновым дополнением.',components:[component('Овощи','свежие овощи','vegetables'),component('Белковая часть','яйца','breakfastProtein'),component('Основа','цельнозерновой хлеб','grain')]},
    {name:'Творог, груша и семена',why:'Вариант без каши с белковой основой и небольшим дополнением.',components:[component('Белковая часть','творог','breakfastProtein'),component('Фрукты или ягоды','груша','fruit'),component('Дополнение','семена','extra')]},
    {name:'Тёплая крупа, яйца и овощи',why:'Сытный несладкий вариант из крупы, овощей и белковой части.',components:[component('Основа','бурый рис','grain'),component('Белковая часть','яйца','breakfastProtein'),component('Овощи','тушёные овощи','vegetables')]},
    {name:'Йогурт, овсянка и фрукт',why:'Быстрый вариант без сложного приготовления.',components:[component('Белковая часть','натуральный йогурт','breakfastProtein'),component('Основа','овсяная каша','grain'),component('Фрукты или ягоды','цитрусовые','fruit')]}
  ],
  lunch:[
    {name:'Салат, птица и овощной гарнир',why:'Овощи сочетаются с белковой частью; каждый компонент можно заменить отдельно.',components:[component('Свежая часть','овощной салат','vegetables'),component('Белковая часть','птица','protein'),component('Гарнир','тушёные овощи','vegetables')]},
    {name:'Рыба, овощи и крупа',why:'Белковая часть дополнена овощами и умеренной зерновой основой.',components:[component('Белковая часть','рыба','protein'),component('Овощи','овощи на пару','vegetables'),component('Основа','бурый рис','grain')]},
    {name:'Чечевица, салат и зелень',why:'Растительный вариант с бобовыми и овощным дополнением.',components:[component('Белковая часть','чечевица','protein'),component('Овощи','овощной салат','vegetables'),component('Дополнение','зелень','extra')]},
    {name:'Птица, гречка и запечённые овощи',why:'Знакомое сочетание с заменяемыми гарниром и белковой частью.',components:[component('Белковая часть','птица','protein'),component('Основа','гречка','grain'),component('Овощи','запечённые овощи','vegetables')]},
    {name:'Нут, овощи и цельнозерновой хлеб',why:'Бобовые служат основой растительного обеда.',components:[component('Белковая часть','нут','protein'),component('Овощи','свежие овощи','vegetables'),component('Основа','цельнозерновой хлеб','grain')]},
    {name:'Яйца, тёплый салат и перловка',why:'Вариант с доступными продуктами и отдельной овощной частью.',components:[component('Белковая часть','яйца','protein'),component('Овощи','тушёные овощи','vegetables'),component('Основа','перловка','grain')]}
  ],
  dinner:[
    {name:'Овощи и рыба',why:'Ужин строится вокруг овощей и умеренной белковой части.',components:[component('Овощи','запечённые овощи','vegetables'),component('Белковая часть','рыба','protein'),component('Дополнение','зелень','extra')]},
    {name:'Салат и птица',why:'Простой вариант без сложного многокомпонентного гарнира.',components:[component('Овощи','овощной салат','vegetables'),component('Белковая часть','птица','protein'),component('Дополнение','семена','extra')]},
    {name:'Овощи и яйца',why:'Несладкий овощной ужин с источником белка.',components:[component('Овощи','тушёные овощи','vegetables'),component('Белковая часть','яйца','protein'),component('Дополнение','зелень','extra')]},
    {name:'Тофу и овощи',why:'Растительный вариант с белковой и овощной частями.',components:[component('Белковая часть','тофу','protein'),component('Овощи','овощи на пару','vegetables'),component('Дополнение','семена','extra')]},
    {name:'Чечевица и запечённые овощи',why:'Бобовые дают основу, овощи — объём и разнообразие.',components:[component('Белковая часть','чечевица','protein'),component('Овощи','запечённые овощи','vegetables'),component('Дополнение','натуральный йогурт','extra')]},
    {name:'Рыба, салат и небольшая крупа',why:'Вариант с овощами, белковой частью и зерновым дополнением.',components:[component('Белковая часть','рыба','protein'),component('Овощи','овощной салат','vegetables'),component('Основа','гречка','grain')]}
  ]
};

const mealNames={breakfast:'Завтрак',lunch:'Обед',dinner:'Ужин'};
const selects=[...document.querySelectorAll('[data-meal]')];
const reviewInvite=document.querySelector('#reviewInvite');

function renderComponents(meal,option){
  const container=document.querySelector(`[data-meal-components="${meal}"]`);
  if(!container)return;
  container.innerHTML=option.components.map((item,index)=>`<label><span>${item.label}</span><select data-component="${meal}" data-component-index="${index}" aria-label="${item.label}: ${mealNames[meal]}">${item.options.map(value=>`<option${value===item.value?' selected':''}>${value}</option>`).join('')}</select></label>`).join('');
  container.querySelectorAll('select').forEach(select=>select.addEventListener('change',()=>{renderSummary();showReviewInvite()}));
}

function currentMeal(meal,select){
  const option=mealOptions[meal][Number(select.value)||0];
  const values=[...document.querySelectorAll(`[data-component="${meal}"]`)].map(item=>item.value);
  return {...option,values:values.length?values:option.components.map(item=>item.value)};
}

function renderMeal(meal,select,resetComponents=false){
  const option=mealOptions[meal][Number(select.value)||0];
  if(resetComponents)renderComponents(meal,option);
  const note=document.querySelector(`[data-meal-note="${meal}"]`);
  if(note)note.textContent=`Почему: ${option.why} Ниже можно заменить каждый компонент отдельно.`;
  return currentMeal(meal,select);
}

function renderSummary(){
  const chosen=selects.map(select=>({meal:select.dataset.meal,option:renderMeal(select.dataset.meal,select)}));
  const summary=document.querySelector('#mealSummary');
  if(summary)summary.innerHTML=`<strong>Ваш пример дня:</strong> ${chosen.map(item=>`${mealNames[item.meal]} — ${item.option.values.join(', ')}`).join('; ')}.`;
}

function showReviewInvite(){if(reviewInvite)reviewInvite.hidden=false}

selects.forEach(select=>{
  mealOptions[select.dataset.meal].forEach((option,index)=>select.add(new Option(option.name,String(index))));
  renderComponents(select.dataset.meal,mealOptions[select.dataset.meal][0]);
  select.addEventListener('change',()=>{renderMeal(select.dataset.meal,select,true);renderSummary();showReviewInvite()});
});
renderSummary();
