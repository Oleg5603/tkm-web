const componentChoices={
  grain:['овсяные хлопья долгой варки','гречка','перловка','булгур','киноа','пшено','амарант','бурый рис','дикий рис','рис басмати','цельнозерновые макароны','паста из твёрдых сортов al dente','макароны из гречки или бобовых','цельнозерновой хлеб','ржаной хлеб','белый рис','картофельное пюре'],
  breakfastProtein:['творог без добавленного сахара','натуральный йогурт','кефир без сахара','яйца','тофу','несладкий растительный йогурт'],
  protein:['курица','индейка','нежирная говядина','нежирная свинина','кролик','рыба','креветки','кальмар','мидии','яйца','чечевица','фасоль','нут','горох','тофу'],
  vegetables:['огурцы и томаты','капуста','листовой салат','болгарский перец','кабачок','баклажан','брокколи','цветная капуста','стручковая фасоль','грибы','морковь','свёкла','тыква','свежие овощи','овощной салат','тушёные овощи','запечённые овощи','овощи на пару'],
  fruit:['ягоды','яблоко','груша','апельсин или мандарин','грейпфрут','абрикос или персик','слива','киви','гранат','вишня или черешня','дыня','виноград','банан','без фруктового дополнения'],
  fat:['авокадо','оливковое масло','льняное масло','орехи','семена льна','семена чиа','кунжут','оливки'],
  extra:['зелень','лимонный сок','специи и травы','семена','небольшая порция орехов','натуральный йогурт','авокадо','без дополнения']
};

const giWarnings={
  'белый рис':'Высокий ГИ: белый рис часто быстро повышает глюкозу. Выбирайте небольшую порцию, добавляйте некрахмалистые овощи и белок; чаще заменяйте бурым, диким рисом или басмати.',
  'картофельное пюре':'Высокий ГИ: измельчённый горячий картофель усваивается быстро. Уменьшите порцию, сочетайте с овощами и белком; охлаждение после варки может увеличить долю резистентного крахмала.',
  'белый хлеб':'Высокий ГИ: рафинированная мука обычно быстро повышает глюкозу. Предпочтительнее цельнозерновой или ржаной хлеб с видимым зерном.',
  'рисовые хлебцы':'Высокий ГИ: воздушная структура ускоряет усвоение крахмала. Важны порция и сочетание с белком или овощами.',
  'кукурузные хлопья':'Высокий ГИ: сильно обработанные хлопья быстро усваиваются. Лучше заменить овсяными хлопьями долгой варки или цельной крупой.'
};

const component=(label,value,choice)=>({label,value,options:componentChoices[choice]});
const meal=(name,why,...components)=>({name,why,components});
const G=(value='гречка')=>component('Основа',value,'grain');
const B=(value='индейка')=>component('Белковая часть',value,'protein');
const BP=(value='яйца')=>component('Белковая часть',value,'breakfastProtein');
const V=(value='овощной салат')=>component('Овощи',value,'vegetables');
const F=(value='ягоды')=>component('Фрукты или ягоды',value,'fruit');
const A=(value='авокадо')=>component('Полезные жиры',value,'fat');
const E=(value='зелень')=>component('Дополнение',value,'extra');

const mealOptions={
  breakfast:[
    meal('Овсянка, творог и ягоды','Цельная зерновая основа дополнена белком и ягодами.',G('овсяные хлопья долгой варки'),BP('творог без добавленного сахара'),F()),
    meal('Гречка, йогурт и яблоко','Простой вариант из крупы, кисломолочного продукта и фрукта.',G(),BP('натуральный йогурт'),F('яблоко')),
    meal('Овощи, яйца и ржаной хлеб','Несладкий завтрак с овощами, белковой и зерновой частями.',V('огурцы и томаты'),BP(),G('ржаной хлеб')),
    meal('Творог, груша и семена','Вариант без каши с белковой основой и небольшим дополнением.',BP('творог без добавленного сахара'),F('груша'),E('семена')),
    meal('Бурый рис, яйца и овощи','Сытный несладкий вариант с нешлифованным рисом.',G('бурый рис'),BP(),V('тушёные овощи')),
    meal('Йогурт, овсянка и цитрус','Быстрый вариант без сложного приготовления.',BP('натуральный йогурт'),G('овсяные хлопья долгой варки'),F('апельсин или мандарин')),
    meal('Киноа, яйцо и авокадо','Крупа сочетается с белком и источником ненасыщенных жиров.',G('киноа'),BP(),A()),
    meal('Пшено, творог и абрикос','Ещё один вариант крупы для разнообразия недели.',G('пшено'),BP('творог без добавленного сахара'),F('абрикос или персик')),
    meal('Ржаной хлеб, яйцо и овощи','Удобный собранный завтрак без сладких добавок.',G('ржаной хлеб'),BP(),V('болгарский перец')),
    meal('Амарант, йогурт и ягоды','Альтернатива привычным кашам с несладким йогуртом.',G('амарант'),BP('натуральный йогурт'),F())
  ],
  lunch:[
    meal('Салат, индейка и овощной гарнир','Овощи сочетаются с белковой частью; каждый компонент заменяется отдельно.',V(),B(),V('тушёные овощи')),
    meal('Рыба, овощи и бурый рис','Белковая часть дополнена овощами и умеренной зерновой основой.',B('рыба'),V('овощи на пару'),G('бурый рис')),
    meal('Чечевица, салат и зелень','Растительный вариант с бобовыми и овощным дополнением.',B('чечевица'),V(),E()),
    meal('Курица, гречка и овощи','Знакомое сочетание с заменяемыми гарниром и белковой частью.',B('курица'),G(),V('запечённые овощи')),
    meal('Нут, овощи и цельнозерновой хлеб','Бобовые служат основой растительного обеда.',B('нут'),V('свежие овощи'),G('цельнозерновой хлеб')),
    meal('Яйца, тёплый салат и перловка','Вариант с доступными продуктами и отдельной овощной частью.',B('яйца'),V('тушёные овощи'),G('перловка')),
    meal('Паста al dente, рыба и овощи','Паста из твёрдых сортов al dente обычно имеет более низкий ГИ, чем разваренная.',G('паста из твёрдых сортов al dente'),B('рыба'),V('брокколи')),
    meal('Цельнозерновые макароны с индейкой','Макаронные изделия остаются частью разнообразного рациона при разумной порции.',G('цельнозерновые макароны'),B(),V()),
    meal('Дикий рис, морепродукты и овощи','Дикий рис разнообразит зерновую часть, морепродукты — белковую.',G('дикий рис'),B('креветки'),V('стручковая фасоль')),
    meal('Булгур, фасоль и авокадо','Сытный растительный вариант с клетчаткой и ненасыщенными жирами.',G('булгур'),B('фасоль'),A())
  ],
  dinner:[
    meal('Овощи и рыба','Ужин строится вокруг овощей и умеренной белковой части.',V('запечённые овощи'),B('рыба'),E()),
    meal('Салат, птица и авокадо','Овощи и белок дополнены небольшим количеством ненасыщенных жиров.',V(),B(),A()),
    meal('Овощи и яйца','Несладкий овощной ужин с источником белка.',V('тушёные овощи'),B('яйца'),E()),
    meal('Тофу и овощи','Растительный вариант с белковой и овощной частями.',B('тофу'),V('овощи на пару'),A('кунжут')),
    meal('Чечевица и запечённые овощи','Бобовые дают основу, овощи — объём и разнообразие.',B('чечевица'),V('запечённые овощи'),E('натуральный йогурт')),
    meal('Рыба, салат и киноа','Вариант с овощами, белковой частью и небольшой зерновой порцией.',B('рыба'),V(),G('киноа')),
    meal('Кальмар, капуста и зелень','Морепродукты и два разных овощных компонента.',B('кальмар'),V('капуста'),E()),
    meal('Фасоль, овощи и оливковое масло','Бобовые с некрахмалистыми овощами и небольшой жировой частью.',B('фасоль'),V('болгарский перец'),A('оливковое масло')),
    meal('Креветки, авокадо и салат','Лёгкая сборка с морепродуктами и авокадо.',B('креветки'),A(),V('листовой салат')),
    meal('Кролик, брокколи и грибы','Белковый вариант с двумя овощными компонентами.',B('кролик'),V('брокколи'),V('грибы'))
  ]
};

const mealNames={breakfast:'Завтрак',lunch:'Обед',dinner:'Ужин'};
const groupNames={grain:'Крупы, рис, хлеб и макаронные изделия',breakfastProtein:'Кисломолочные продукты и яйца',protein:'Белковые продукты',vegetables:'Овощи и грибы',fruit:'Фрукты и ягоды',fat:'Источники ненасыщенных жиров',extra:'Дополнения'};
const selects=[...document.querySelectorAll('[data-meal]')];
const reviewInvite=document.querySelector('#reviewInvite');
const warningFor=value=>giWarnings[value]||'';
const optionLabel=value=>`${warningFor(value)?'⚠ Высокий ГИ · ':''}${value}`;

function renderComponents(mealName,option){
  const container=document.querySelector(`[data-meal-components="${mealName}"]`);
  if(!container)return;
  container.innerHTML=option.components.map((item,index)=>`<label><span>${item.label}</span><select data-component="${mealName}" data-component-index="${index}" aria-label="${item.label}: ${mealNames[mealName]}">${item.options.map(value=>`<option value="${value}"${value===item.value?' selected':''}>${optionLabel(value)}</option>`).join('')}</select></label>`).join('');
  container.querySelectorAll('select').forEach(select=>select.addEventListener('change',()=>{renderSummary();showReviewInvite()}));
}

function currentMeal(mealName,select){
  const option=mealOptions[mealName][Number(select.value)||0];
  const values=[...document.querySelectorAll(`[data-component="${mealName}"]`)].map(item=>item.value);
  return {...option,values:values.length?values:option.components.map(item=>item.value)};
}

function renderMeal(mealName,select,resetComponents=false){
  const option=mealOptions[mealName][Number(select.value)||0];
  if(resetComponents)renderComponents(mealName,option);
  const note=document.querySelector(`[data-meal-note="${mealName}"]`);
  if(note)note.textContent=`Почему: ${option.why} Ниже можно заменить каждый компонент отдельно.`;
  return currentMeal(mealName,select);
}

function renderSummary(){
  const chosen=selects.map(select=>({meal:select.dataset.meal,option:renderMeal(select.dataset.meal,select)}));
  const summary=document.querySelector('#mealSummary');
  const warnings=chosen.flatMap(item=>item.option.values.map(value=>warningFor(value))).filter(Boolean);
  if(summary)summary.innerHTML=`<strong>Ваш пример дня:</strong> ${chosen.map(item=>`${mealNames[item.meal]} — ${item.option.values.join(', ')}`).join('; ')}.${warnings.length?`<div class="gi-alert"><b>⚠ Обратите внимание на высокий ГИ</b>${[...new Set(warnings)].map(text=>`<p>${text}</p>`).join('')}<small>ГИ оценивает скорость подъёма глюкозы, но не учитывает размер порции и весь состав блюда. При диабете ориентируйтесь на индивидуальные рекомендации врача.</small></div>`:''}`;
}

function renderCatalog(){
  const catalog=document.querySelector('#productCatalog');
  if(!catalog)return;
  catalog.innerHTML=Object.entries(groupNames).map(([key,title])=>`<details><summary>${title} <span>${componentChoices[key].length}</span></summary><div>${componentChoices[key].map(value=>`<span class="product-chip${warningFor(value)?' high-gi':''}"${warningFor(value)?` title="${warningFor(value)}"`:''}>${optionLabel(value)}</span>`).join('')}</div></details>`).join('');
}

function showReviewInvite(){if(reviewInvite)reviewInvite.hidden=false}
selects.forEach(select=>{
  mealOptions[select.dataset.meal].forEach((option,index)=>select.add(new Option(option.name,String(index))));
  renderComponents(select.dataset.meal,mealOptions[select.dataset.meal][0]);
  select.addEventListener('change',()=>{renderMeal(select.dataset.meal,select,true);renderSummary();showReviewInvite()});
});
renderCatalog();
renderSummary();
