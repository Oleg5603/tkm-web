const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');
const validation = fs.readFileSync('validation.html', 'utf8');
const topics = fs.readFileSync('topics.html', 'utf8');
const accessibility = fs.readFileSync('assets/accessibility.css', 'utf8');
const css = fs.readFileSync('assets/landing.css', 'utf8');
const app = fs.readFileSync('assets/app.js', 'utf8');
const nutrition = fs.readFileSync('assets/nutrition-calculator.js', 'utf8');
const data = JSON.parse(fs.readFileSync('assets/tkm-engine-data.json', 'utf8'));
const diagnoses = JSON.parse(fs.readFileSync('assets/diagnoses-data.json', 'utf8'));

assert.match(html, /data-mode="diagnosis"/);
assert.doesNotMatch(html, /data-mode="diagnosis"[^>]*disabled/);
assert.match(html, /id="diagnosisSearch"/);
assert.match(html, /Выбранные диагнозы/);
assert.match(html, /href="validation\.html">Экспертная проверка/);
assert.match(html, /href="topics\.html">Материалы/);
assert.match(html, /class="topic-preview wrap"/);
for (const id of ['tcm','methods','water','nutrition','movement']) assert.match(html, new RegExp(`href="topics\\.html#${id}"`));
for (const id of ['tcm','methods','water','nutrition','movement']) assert.match(topics, new RegExp(`id="${id}"`));
assert.match(topics, /Система Татьяны Малаховой/);
assert.match(topics, /Личный выбор автора/);
assert.match(topics, /clck\.ru\/3LBSQJ/);
assert.match(topics, /Соберите пример дневного рациона/);
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
assert.match(accessibility, /prefers-reduced-motion: reduce/);
assert.match(accessibility, /:focus-visible/);
assert.equal(Object.keys(diagnoses).length, 63);
assert.deepEqual(diagnoses['Гипертония'], {F: 6, R: 4, VB: 3});
assert.match(app, /state\.diagnosisIndex=buildSearchIndex\(diagnoses\)/);
assert.match(app, /diagnoses:\[\]/);
assert.match(app, /function analyzeDiagnoses\(selected\)/);
assert.match(app, /data-remove-diagnosis/);
assert.match(app, /setTimeout\(render,80\)/);
assert.match(app, /const pointAtlas=/);
assert.match(app, /assets\/point-atlas\/\$\{image\}\.png/);
assert.match(css, /\.point-image img[\s\S]*object-fit:\s*cover/);
assert.doesNotMatch(css, /\.point-image img\.rotate-90\s*\{[^}]*scale:\s*\.62/);
assert.match(css, /\.point-visual,\s*\.point-image\s*\{[^}]*overflow:\s*hidden/);
assert.match(css, /\.protocol-body\s*\{[^}]*z-index:\s*1[^}]*min-width:\s*0[^}]*overflow:\s*hidden/);
assert.match(css, /\.point-focus-label\s*\{[^}]*background:\s*#b7352d/);
assert.match(app, /class="point-focus-label"/);
assert.match(app, /const atlasRotation=/);
assert.match(app, /GI11:'arm-outer'/);
for (const unsupported of ['E34','F6','R1','R5','R7','RP2','RP5','TR10','TR7','VB38']) assert.doesNotMatch(app, new RegExp(`${unsupported}:'`));
assert.match(validation, /id="reviewProgress"/);
assert.match(validation, /id="exportReview"/);
assert.match(validation, /id="resetReview"/);
assert.match(validation, /tkm-expert-review-v1/);
assert.match(validation, /localStorage\.removeItem\(storageKey\)/);
assert.match(validation, /href="index\.html#picker"/);
assert.doesNotMatch(validation, /href="index\.html#calculator"/);

const requiredAtlasImages = ['arm-inner','hand-back','leg-inner','foot-top','arm-outer','leg-front','knee-side','foot-side'];
for (const name of requiredAtlasImages) assert.ok(fs.existsSync(`assets/point-atlas/${name}.png`), `Нет обработанной фотографии ${name}.png`);

const normalize = value => String(value ?? '').toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').replace(/[-–—.]/g, ' ').replace(/\s+/g, ' ').trim();
const started = performance.now();
const index = Object.keys(data.symptoms).map(name => ({name, search: normalize(name)}));
for (let i = 0; i < 1000; i += 1) index.filter(item => item.search.includes('бол'));
const elapsed = performance.now() - started;
assert.ok(elapsed / 1000 < 1.5, `Один поиск слишком медленный: ${(elapsed / 1000).toFixed(3)} мс`);

console.log(`OK: diagnoses=63, symptoms=${index.length}, search1000=${elapsed.toFixed(1)}ms`);
