const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const pages=['index.html','topics.html','validation.html','privacy.html','terms.html','reviews.html'];
for(const page of pages){
  const html=fs.readFileSync(page,'utf8');
  assert.match(html,/Content-Security-Policy/,`${page}: нет CSP`);
  assert.match(html,/meta name="referrer"/,`${page}: нет Referrer-Policy`);
  for(const value of html.matchAll(/(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"/g)){
    if(/^(?:https?:|mailto:|tel:)/.test(value[1]))continue;
    assert.ok(fs.existsSync(path.resolve(path.dirname(page),value[1])),`${page}: отсутствует ${value[1]}`);
  }
}
const index=fs.readFileSync('index.html','utf8');
const app=fs.readFileSync('assets/app.js','utf8');
assert.doesNotMatch(index,/id="accessForm"|id="paymentEmail"|id="paymentPhone"/);
assert.match(index,/id="calculateProtocol"[^>]*disabled/);
assert.match(app,/reviewMode/);
assert.match(app,/TkmProtocolUtils\.hasUrgent/);
assert.doesNotMatch(app,/localStorage/);
console.log('OK: page links, privacy and public safety gate');
