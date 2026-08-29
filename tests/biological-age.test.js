const assert = require('node:assert/strict');
const { calculatePhenoAge, PHENOAGE_RANGES } = require('../assets/biological-age.js');

const reference = {
  age: 50,
  albumin: 45,
  creatinine: 80,
  glucose: 5,
  crp: 1,
  lymphocytes: 30,
  mcv: 90,
  rdw: 13,
  alp: 70,
  wbc: 6
};

const result = calculatePhenoAge(reference);
assert.ok(Math.abs(result.phenoAge - 41.838108630942244) < 1e-10, 'Контрольный расчёт PhenoAge не совпал с формулой');
assert.ok(Math.abs(result.difference + 8.161891369057756) < 1e-10, 'Неверно рассчитана разница возрастов');
assert.throws(() => calculatePhenoAge({ ...reference, crp: 0 }), RangeError);
assert.throws(() => calculatePhenoAge({ ...reference, age: 85 }), RangeError);
assert.deepEqual(PHENOAGE_RANGES.age, [20, 84]);

console.log(`OK: reference PhenoAge=${result.phenoAge.toFixed(1)}, difference=${result.difference.toFixed(1)}`);
