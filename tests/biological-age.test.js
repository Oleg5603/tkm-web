const assert = require('node:assert/strict');
const { calculatePhenoAge, calculateFitnessAge, PHENOAGE_RANGES, FITNESS_AGE_RANGES } = require('../assets/biological-age.js');

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

const fitnessResult = calculateFitnessAge({
  sex: 'female',
  fitnessAgeChronological: 50,
  waist: 80,
  restingHeartRate: 65,
  activityIndex: 5
});
assert.ok(Math.abs(fitnessResult.vo2 - 35.25) < 1e-10, 'Контрольный расчёт HUNT VO2peak не совпал с формулой');
assert.ok(Math.abs(fitnessResult.fitnessAge - 51.875) < 1e-10, 'Неверно рассчитан возраст выносливости');
assert.throws(() => calculateFitnessAge({ sex: 'female', fitnessAgeChronological: 50, waist: 80, restingHeartRate: 0, activityIndex: 5 }), RangeError);
assert.throws(() => calculateFitnessAge({ sex: '', fitnessAgeChronological: 50, waist: 80, restingHeartRate: 65, activityIndex: 5 }), RangeError);
assert.deepEqual(FITNESS_AGE_RANGES.waist, [45, 180]);

console.log(`OK: PhenoAge=${result.phenoAge.toFixed(1)}, fitness VO2peak=${fitnessResult.vo2.toFixed(1)}, fitness age=${fitnessResult.fitnessAge.toFixed(1)}`);
