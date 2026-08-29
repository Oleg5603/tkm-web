const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');
const validation = fs.readFileSync('validation.html', 'utf8');
const topics = fs.readFileSync('topics.html', 'utf8');
const accessibility = fs.readFileSync('assets/accessibility.css', 'utf8');
const css = fs.readFileSync('assets/landing.css', 'utf8');
const wideCss = fs.readFileSync('assets/layout-wide.css', 'utf8');
const app = fs.readFileSync('assets/app.js', 'utf8');
const nutrition = fs.readFileSync('assets/nutrition-calculator.js', 'utf8');
const data = JSON.parse(fs.readFileSync('assets/tkm-engine-data.json', 'utf8'));
const diagnoses = JSON.parse(fs.readFileSync('assets/diagnoses-data.json', 'utf8'));
const privacy = fs.readFileSync('privacy.html', 'utf8');
const terms = fs.readFileSync('terms.html', 'utf8');
const bioage = fs.readFileSync('biological-age.html', 'utf8');
const bioageJs = fs.readFileSync('assets/biological-age.js', 'utf8');

assert.match(html, /data-mode="diagnosis"/);
assert.doesNotMatch(html, /data-mode="diagnosis"[^>]*disabled/);
assert.match(html, /id="diagnosisSearch"/);
assert.match(html, /Выбранные диагнозы/);
assert.match(html, /href="validation\.html">Экспертная проверка/);
assert.match(html, /href="topics\.html">Материалы/);
assert.match(html, /class="topic-preview wrap"/);
assert.match(html, /id="ask-gavrik"/);
assert.match(html, /id="gavrikForm"/);
assert.match(html, /id="pickerStoriesTitle"/);
assert.equal((html.match(/class="picker-story-card"/g) || []).length, 3, 'У подбора точек должно быть три пользовательских сценария');
assert.match(html, /Имена условные/);
assert.doesNotMatch(html, /Демонстрационный отзыв/);
assert.match(html, /href="#about-me">Обо мне/);
assert.match(html, /Обо мне/);
assert.match(html, /Олег Палкин/);
assert.match(html, /понятный список точек/);
assert.match(html, /class="hero-result-demo"/);
assert.equal((html.match(/class="hero-point-list"/g) || []).length, 1, 'В hero должен быть один понятный пример списка точек');
assert.doesNotMatch(html, /class="body-map"/);
assert.match(html, /Защищённая подписка будет подключена через некоторое время/);
assert.match(html, /Подбирайте точки без подписки/);
assert.match(html, /Загружаем справочные данные/);
assert.match(html, /assets\/app\.js\?v=20260830-2/);
assert.match(html, /href="biological-age\.html"/);
assert.match(html, /простой расчёт без лаборатории/);
assert.match(html, /Быстрее разобраться/);
assert.match(app, /const gavrikAnswers=/);
assert.doesNotMatch(app, /Публичный расчёт закрыт/);
assert.doesNotMatch(app, /if\(!reviewMode\)/);
assert.match(app, /\$\('#calculateProtocol'\)\.disabled=false/);
assert.match(app, /Рассчитать список точек/);
assert.match(app, /\$\('#redFlags'\)\.checked\|\|TkmProtocolUtils\.hasUrgent/);
assert.match(wideCss, /\.topic\.wrap/);
assert.doesNotMatch(wideCss, /\.topic,\s*\n\.topic-inner/);
for (const id of ['tcm','methods','water','nutrition','movement']) assert.match(html, new RegExp(`href="topics\\.html#${id}"`));
for (const id of ['tcm','methods','water','nutrition','movement']) assert.match(topics, new RegExp(`id="${id}"`));
assert.match(topics, /Система Татьяны Малаховой/);
assert.match(topics, /id="readerStoriesTitle"/);
assert.equal((topics.match(/class="review-card(?: review-card-weight)?"/g) || []).length, 5, 'В разделе Малаховой должно быть пять отзывов');
assert.equal((topics.match(/class="review-card review-card-weight"/g) || []).length, 1, 'Отзыв о снижении веса должен быть один');
assert.match(topics, /личный опыт отдельных читателей/);
const salesUrl = 'https://oleg5603.github.io/tkm-acupuncture/?v=5b3c863';
assert.ok(html.includes(salesUrl), 'На главной ТКМ нет ссылки на сайт продажи приложения');
assert.ok(topics.includes(salesUrl), 'В разделе Малаховой нет ссылки на сайт продажи приложения');
assert.match(html, /Купить приложение ТКМ/);
assert.match(html, /Сайт продажи приложения ТКМ/);
assert.match(topics, /Перейти на сайт приложения ТКМ/);
assert.match(topics, /Личный выбор автора/);
assert.match(topics, /clck\.ru\/3LBSQJ/);
assert.match(topics, /Соберите пример дневного рациона за минуту/);
assert.match(topics, /Питание, с которым можно жить каждый день/);
assert.match(topics, /assets\/nutrition-calculator\.js/);
assert.match(topics, /data-meal="breakfast"/);
assert.match(topics, /не учитывает аллергии, лекарства и заболевания/);
assert.match(nutrition, /const mealOptions=/);
for (const meal of ['breakfast','lunch','dinner']) assert.match(nutrition, new RegExp(`${meal}:\\[`));
assert.match(topics, /Три занятия в неделю/);
assert.match(topics, /150–300 минут/);
for (const method of ['Акупрессура','Электропунктура по методу Леднёва','Шарики, семена','Лазерное воздействие','Воздействие полынной сигарой']) assert.match(topics, new RegExp(method));
for (const page of [html, validation, topics]) {
  assert.match(page, /class="skip-link" href="#mainContent"/);
  assert.match(page, /id="mainContent"/);
  assert.match(page, /assets\/accessibility\.css/);
}
assert.match(privacy, /Конфиденциальность/);
assert.match(privacy, /Показатели PhenoAge и простого расчёта выносливости обрабатываются локально, не сохраняются/);
assert.match(terms, /Условия использования/);
assert.match(terms, /исследовательскую оценку фенотипического возраста/);
assert.match(terms, /публичный расчёт формирует справочный список/);
assert.match(accessibility, /prefers-reduced-motion: reduce/);
assert.match(accessibility, /:focus-visible/);
assert.equal(Object.keys(diagnoses).length, 64);
assert.deepEqual(diagnoses['Гипертония'], {F: 6, R: 4, VB: 3});
assert.match(app, /state\.diagnosisIndex=buildSearchIndex\(diagnoses\)/);
assert.match(app, /diagnoses:\[\]/);
assert.match(app, /function analyzeDiagnoses\(selected\)/);
assert.match(app, /data-remove-diagnosis/);
assert.match(app, /setTimeout\(render,80\)/);
assert.match(app, /const pointAtlas=/);
assert.match(app, /assets\/point-atlas\/\$\{image\}\.webp/);
assert.match(css, /\.point-image img[\s\S]*object-fit:\s*contain/);
assert.match(css, /\.point-image img\.rotate-90\s*\{[^}]*rotate:\s*90deg[^}]*scale:\s*\.72/);
assert.match(css, /\.detail-image-frame \.detail-image\.rotate-90\s*\{[^}]*rotate:\s*90deg[^}]*scale:\s*\.72/);
assert.match(css, /\.detail-image-frame \.detail-image\s*\{[^}]*width:\s*100%[^}]*max-width:\s*100%[^}]*height:\s*360px[^}]*object-fit:\s*contain/);
assert.doesNotMatch(app, /rotate-neg-90/, 'Атлас не должен поворачиваться против часовой стрелки');
assert.match(css, /\.point-visual,\s*\.point-image\s*\{[^}]*overflow:\s*hidden/);
assert.match(css, /\.protocol-body\s*\{[^}]*z-index:\s*1[^}]*min-width:\s*0[^}]*overflow:\s*hidden/);
assert.match(css, /\.point-focus-label\s*\{[^}]*background:\s*#b7352d/);
assert.match(app, /class="point-focus-label"/);
assert.match(app, /const atlasRotation=/);
assert.match(app, /GI11:'arm-outer'/);
assert.match(app, /P9:'p9-wrist\.png'/);
assert.match(css, /\.point-image img\.scale-85\s*\{[^}]*scale:\s*\.85/);
assert.ok(fs.existsSync('assets/point-atlas/p9-wrist.png'), 'Нет отдельной фотографии запястья для P9');
assert.equal(data.symptoms['Псориаз'], undefined, 'Псориаз не должен отображаться как жалоба');
assert.ok(diagnoses['Псориаз'], 'Псориаз должен оставаться в списке диагнозов');
const auditedAtlasPairs = {
  C6:'arm-inner',C7:'arm-inner',C9:'hand-back',
  E41:'foot-top',E45:'foot-top',F2:'foot-top',F8:'leg-inner',
  GI11:'arm-outer',GI2:'hand-back',GI7:'hand-back',
  IG3:'hand-back',IG6:'hand-back',IG8:'arm-outer',
  MC4:'arm-inner',MC7:'arm-inner',MC9:'hand-back',
  P5:'arm-inner',P6:'arm-inner',P9:'p9-wrist.png',RP8:'leg-inner',
  TR3:'hand-back',V63:'foot-side',V65:'foot-side',V67:'foot-side',
  VB36:'leg-front',VB43:'foot-top'
};
for (const [code,image] of Object.entries(auditedAtlasPairs)) assert.match(app, new RegExp(`${code}:'${image.replace('.', '\\.')}'`));
for (const unsupported of ['E34','F6','R1','R5','R7','RP2','RP5','TR10','TR7','VB38']) assert.doesNotMatch(app, new RegExp(`${unsupported}:'`));
assert.match(validation, /id="reviewProgress"/);
assert.match(validation, /id="reviewState"/);
assert.match(validation, /Проверка завершена/);
assert.match(validation, /Скачать итог оценки/);
assert.match(validation, /id="exportReview"/);
assert.match(validation, /id="resetReview"/);
assert.match(validation, /tkm-expert-review-v1/);
assert.match(validation, /localStorage\.removeItem\(storageKey\)/);
assert.match(validation, /href="index\.html\?review=1#picker"/);
assert.doesNotMatch(validation, /href="index\.html#calculator"/);
for (const page of [html, validation, topics, privacy, terms, bioage, bioageJs, app]) {
  assert.doesNotMatch(page, /специалист/iu, 'Слово «специалист» не должно оставаться в публичных текстах');
  assert.doesNotMatch(page, /черновик/iu, 'Слово «черновик» нужно заменить словом «список»');
}
assert.match(bioage, /id="bioageForm"/);
assert.match(bioage, /Значения не сохраняются и не отправляются на сервер/);
assert.match(bioage, /pubmed\.ncbi\.nlm\.nih\.gov\/29676998/);
assert.match(bioage, /pubmed\.ncbi\.nlm\.nih\.gov\/34725754/);
assert.equal((bioage.match(/name="(?:age|albumin|creatinine|glucose|crp|lymphocytes|mcv|rdw|alp|wbc)"/g) || []).length, 10, 'Для PhenoAge нужны возраст и девять показателей');
assert.match(bioage, /id="fitnessAgeForm"/);
assert.match(bioage, /id="fitnessAgeResult"/);
assert.equal((bioage.match(/name="(?:sex|fitnessAgeChronological|waist|restingHeartRate|activityIndex)"/g) || []).length, 5, 'Для простого расчёта нужны пять доступных параметров');
assert.match(bioage, /pubmed\.ncbi\.nlm\.nih\.gov\/21502897/);
assert.match(bioageJs, /Math\.log\(clean\.crp \/ 10\)/);
assert.match(bioageJs, /-19\.90667/);
assert.match(bioageJs, /0\.08035356 \* clean\.age/);
assert.match(bioageJs, /100\.27 - 0\.296 \* age/);
assert.match(bioageJs, /74\.74 - 0\.247 \* age/);
assert.match(fs.readFileSync('assets/biological-age.css', 'utf8'), /\.bioage-result\[hidden\]\{display:none\}/);
assert.match(css, /\.landing-page \.doctor-about\{order:8\}/);

const requiredAtlasImages = ['arm-inner','hand-back','leg-inner','foot-top','arm-outer','leg-front','knee-side','foot-side'];
for (const name of requiredAtlasImages) assert.ok(fs.existsSync(`assets/point-atlas/${name}.webp`), `Нет оптимизированной фотографии ${name}.webp`);

const normalize = value => String(value ?? '').toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').replace(/[-–—.]/g, ' ').replace(/\s+/g, ' ').trim();
const started = performance.now();
const index = Object.keys(data.symptoms).map(name => ({name, search: normalize(name)}));
for (let i = 0; i < 1000; i += 1) index.filter(item => item.search.includes('бол'));
const elapsed = performance.now() - started;
assert.ok(elapsed / 1000 < 1.5, `Один поиск слишком медленный: ${(elapsed / 1000).toFixed(3)} мс`);

console.log(`OK: diagnoses=${Object.keys(diagnoses).length}, symptoms=${index.length}, search1000=${elapsed.toFixed(1)}ms`);
