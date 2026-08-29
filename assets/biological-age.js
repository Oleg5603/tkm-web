'use strict';

const PHENOAGE_RANGES = Object.freeze({
  age: [20, 84],
  albumin: [10, 70],
  creatinine: [20, 1500],
  glucose: [1, 40],
  crp: [0.01, 500],
  lymphocytes: [1, 80],
  mcv: [50, 130],
  rdw: [5, 40],
  alp: [5, 1000],
  wbc: [0.5, 100]
});

const FITNESS_AGE_RANGES = Object.freeze({
  fitnessAgeChronological: [20, 84],
  waist: [45, 180],
  restingHeartRate: [35, 130],
  activityIndex: [0, 8.3]
});

const FITNESS_REFERENCE = Object.freeze({
  female: Object.freeze([[25, 43], [35, 40], [45, 38], [55, 34], [65, 31], [75, 27]]),
  male: Object.freeze([[25, 54], [35, 49], [45, 47], [55, 42], [65, 39], [75, 34]])
});

function calculatePhenoAge(values) {
  const clean = {};
  for (const [name, range] of Object.entries(PHENOAGE_RANGES)) {
    const value = Number(values[name]);
    if (!Number.isFinite(value) || value < range[0] || value > range[1]) {
      throw new RangeError(`Invalid PhenoAge value: ${name}`);
    }
    clean[name] = value;
  }

  // Published Levine formula expects CRP in mg/dL. Russian laboratory forms
  // usually report mg/L, so the form value is divided by 10 before ln(CRP).
  const lnCrpMgDl = Math.log(clean.crp / 10);
  const xb = -19.90667
    - 0.03359355 * clean.albumin
    + 0.009506491 * clean.creatinine
    + 0.1953192 * clean.glucose
    + 0.09536762 * lnCrpMgDl
    - 0.01199984 * clean.lymphocytes
    + 0.02676401 * clean.mcv
    + 0.3306156 * clean.rdw
    + 0.001868778 * clean.alp
    + 0.05542406 * clean.wbc
    + 0.08035356 * clean.age;

  // Algebraically equivalent to the published Gompertz conversion, written
  // through cumulative hazard to remain stable at extreme valid inputs.
  const cumulativeHazard = (1.51714 * Math.exp(xb)) / 0.007692696;
  const phenoAge = Math.log(0.0055305 * cumulativeHazard) / 0.090165 + 141.50225;
  if (!Number.isFinite(phenoAge)) throw new RangeError('Unable to calculate PhenoAge');

  return { phenoAge, difference: phenoAge - clean.age };
}

function fitnessAgeFromVo2(sex, vo2) {
  const points = FITNESS_REFERENCE[sex];
  if (!points || !Number.isFinite(vo2)) throw new RangeError('Invalid fitness age input');

  if (vo2 >= points[0][1]) {
    const slope = (points[0][1] - points[1][1]) / 10;
    return Math.max(18, points[0][0] - (vo2 - points[0][1]) / slope);
  }
  const last = points.length - 1;
  if (vo2 <= points[last][1]) {
    const slope = (points[last - 1][1] - points[last][1]) / 10;
    return Math.min(90, points[last][0] + (points[last][1] - vo2) / slope);
  }
  for (let index = 0; index < last; index += 1) {
    const younger = points[index];
    const older = points[index + 1];
    if (vo2 <= younger[1] && vo2 >= older[1]) {
      const fraction = (younger[1] - vo2) / (younger[1] - older[1]);
      return younger[0] + fraction * (older[0] - younger[0]);
    }
  }
  throw new RangeError('Unable to derive fitness age');
}

function calculateFitnessAge(values) {
  const sex = values.sex;
  if (sex !== 'female' && sex !== 'male') throw new RangeError('Invalid sex value');

  const clean = {};
  for (const [name, range] of Object.entries(FITNESS_AGE_RANGES)) {
    const value = Number(values[name]);
    if (!Number.isFinite(value) || value < range[0] || value > range[1]) {
      throw new RangeError(`Invalid fitness age value: ${name}`);
    }
    clean[name] = value;
  }

  const { fitnessAgeChronological: age, waist, restingHeartRate: pulse, activityIndex } = clean;
  const vo2 = sex === 'male'
    ? 100.27 - 0.296 * age - 0.369 * waist - 0.155 * pulse + 0.226 * activityIndex
    : 74.74 - 0.247 * age - 0.259 * waist - 0.114 * pulse + 0.198 * activityIndex;
  if (!Number.isFinite(vo2) || vo2 <= 0) throw new RangeError('Unable to calculate fitness age');

  const fitnessAge = fitnessAgeFromVo2(sex, vo2);
  return { vo2, fitnessAge, difference: fitnessAge - age };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculatePhenoAge, calculateFitnessAge, fitnessAgeFromVo2, PHENOAGE_RANGES, FITNESS_AGE_RANGES };
}

if (typeof document !== 'undefined') {
  const form = document.getElementById('bioageForm');
  const result = document.getElementById('bioageResult');
  const error = document.getElementById('bioageError');
  const fillExample = document.getElementById('fillExample');
  const ageValue = document.getElementById('phenoAgeValue');
  const deltaValue = document.getElementById('phenoAgeDelta');
  const meaning = document.getElementById('phenoAgeMeaning');
  const labels = {
    age: 'Укажите возраст от 20 до 84 лет', albumin: 'Проверьте значение альбумина',
    creatinine: 'Проверьте значение креатинина', glucose: 'Проверьте значение глюкозы',
    crp: 'СРБ должен быть больше нуля', lymphocytes: 'Укажите лимфоциты в процентах',
    mcv: 'Проверьте значение MCV', rdw: 'Укажите RDW-CV в процентах',
    alp: 'Проверьте значение щелочной фосфатазы', wbc: 'Проверьте значение лейкоцитов'
  };

  function formValues() {
    return Object.fromEntries(new FormData(form).entries());
  }

  function clearValidity() {
    form.querySelectorAll('input').forEach(input => input.removeAttribute('aria-invalid'));
    error.hidden = true;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    clearValidity();
    const values = formValues();
    const invalid = Object.entries(PHENOAGE_RANGES).find(([name, [min, max]]) => {
      const value = Number(values[name]);
      return !Number.isFinite(value) || values[name] === '' || value < min || value > max;
    });
    if (invalid) {
      const input = form.elements[invalid[0]];
      input.setAttribute('aria-invalid', 'true');
      error.textContent = `${labels[invalid[0]]}. Допустимый диапазон: ${invalid[1][0]}–${invalid[1][1]}.`;
      error.hidden = false;
      input.focus();
      result.hidden = true;
      return;
    }

    try {
      const calculated = calculatePhenoAge(values);
      const roundedAge = calculated.phenoAge.toFixed(1).replace('.', ',');
      const roundedDifference = Math.abs(calculated.difference).toFixed(1).replace('.', ',');
      ageValue.textContent = roundedAge;
      if (Math.abs(calculated.difference) < 0.05) {
        deltaValue.textContent = '≈ 0 лет';
        meaning.textContent = 'В этой модели результат практически совпадает с паспортным возрастом.';
      } else if (calculated.difference > 0) {
        deltaValue.textContent = `+${roundedDifference} года`;
        meaning.textContent = 'В этой модели набор показателей соответствует более старшему возрасту.';
      } else {
        deltaValue.textContent = `−${roundedDifference} года`;
        meaning.textContent = 'В этой модели набор показателей соответствует более молодому возрасту.';
      }
      result.hidden = false;
      result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch {
      error.textContent = 'Не удалось выполнить расчёт. Проверьте введённые значения и единицы измерения.';
      error.hidden = false;
      result.hidden = true;
    }
  });

  fillExample.addEventListener('click', () => {
    const example = { age: 50, albumin: 45, creatinine: 80, glucose: 5, crp: 1, lymphocytes: 30, mcv: 90, rdw: 13, alp: 70, wbc: 6 };
    Object.entries(example).forEach(([name, value]) => { form.elements[name].value = value; });
    clearValidity();
    result.hidden = true;
  });

  form.addEventListener('reset', () => {
    clearValidity();
    result.hidden = true;
  });

  const fitnessForm = document.getElementById('fitnessAgeForm');
  const fitnessResult = document.getElementById('fitnessAgeResult');
  const fitnessError = document.getElementById('fitnessAgeError');
  const fitnessAgeValue = document.getElementById('fitnessAgeValue');
  const fitnessVo2Value = document.getElementById('fitnessVo2Value');
  const fitnessMeaning = document.getElementById('fitnessAgeMeaning');
  const fitnessLabels = {
    fitnessAgeChronological: 'Укажите возраст от 20 до 84 лет',
    waist: 'Проверьте окружность талии в сантиметрах',
    restingHeartRate: 'Проверьте пульс покоя',
    activityIndex: 'Выберите обычный уровень активности'
  };

  function clearFitnessValidity() {
    fitnessForm.querySelectorAll('input, select').forEach(control => control.removeAttribute('aria-invalid'));
    fitnessError.hidden = true;
  }

  fitnessForm.addEventListener('submit', event => {
    event.preventDefault();
    clearFitnessValidity();
    const values = Object.fromEntries(new FormData(fitnessForm).entries());
    if (values.sex !== 'female' && values.sex !== 'male') {
      fitnessForm.elements.sex.setAttribute('aria-invalid', 'true');
      fitnessError.textContent = 'Выберите пол, указанный при рождении.';
      fitnessError.hidden = false;
      fitnessForm.elements.sex.focus();
      fitnessResult.hidden = true;
      return;
    }
    const invalid = Object.entries(FITNESS_AGE_RANGES).find(([name, [min, max]]) => {
      const value = Number(values[name]);
      return values[name] === '' || !Number.isFinite(value) || value < min || value > max;
    });
    if (invalid) {
      const control = fitnessForm.elements[invalid[0]];
      control.setAttribute('aria-invalid', 'true');
      fitnessError.textContent = `${fitnessLabels[invalid[0]]}. Допустимый диапазон: ${invalid[1][0]}–${invalid[1][1]}.`;
      fitnessError.hidden = false;
      control.focus();
      fitnessResult.hidden = true;
      return;
    }

    try {
      const calculated = calculateFitnessAge(values);
      fitnessAgeValue.textContent = calculated.fitnessAge.toFixed(1).replace('.', ',');
      fitnessVo2Value.textContent = calculated.vo2.toFixed(1).replace('.', ',');
      const years = Math.abs(calculated.difference).toFixed(1).replace('.', ',');
      if (Math.abs(calculated.difference) < 1) {
        fitnessMeaning.textContent = 'Расчёт близок к средней выносливости для вашего возраста.';
      } else if (calculated.difference > 0) {
        fitnessMeaning.textContent = `Ориентировочно на ${years} года старше паспортного возраста. Это повод обратить внимание на посильную регулярную активность, а не медицинский диагноз.`;
      } else {
        fitnessMeaning.textContent = `Ориентировочно на ${years} года моложе паспортного возраста по уровню выносливости.`;
      }
      fitnessResult.hidden = false;
      fitnessResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch {
      fitnessError.textContent = 'Не удалось выполнить расчёт. Проверьте введённые значения.';
      fitnessError.hidden = false;
      fitnessResult.hidden = true;
    }
  });

  fitnessForm.addEventListener('reset', () => {
    clearFitnessValidity();
    fitnessResult.hidden = true;
  });
}
