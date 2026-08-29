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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculatePhenoAge, PHENOAGE_RANGES };
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
}
