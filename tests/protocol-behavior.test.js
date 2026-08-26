const assert=require('node:assert/strict');
const utils=require('../assets/protocol-utils.js');

const ordinary=Array.from({length:7},(_,index)=>({code:`P${index+1}`}));
const limited=utils.limitPoints([...ordinary,{code:'XI'}],5,7);
assert.equal(limited.length,5);
assert.equal(limited.at(-1).code,'XI','Xi-точка должна сохраняться внутри лимита');
assert.equal(utils.hasUrgent(['Боль в груди']),true);
assert.equal(utils.hasUrgent(['Острые маточные кровотечения']),true);
assert.equal(utils.hasUrgent(['Бессонница']),false);
console.log('OK: protocol limits and urgent triage');
