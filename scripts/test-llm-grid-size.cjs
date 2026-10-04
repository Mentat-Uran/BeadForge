const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const repositoryRoot = path.resolve(__dirname, '..');
const htmlFiles = [
  'BeadForge.html',
  'dist/client/index.html',
  'dist/client/BeadForge.html',
];

function loadGridSizeValidator(relativePath) {
  const html = fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
  const start = html.indexOf('    function validateLLMGridSize(grid) {');
  assert.notEqual(start, -1, `${relativePath} must define the LLM size validator`);

  const close = html.indexOf('\n    }', start);
  assert.notEqual(close, -1, `${relativePath} must close the LLM size validator`);
  const source = html.slice(start, close + '\n    }'.length).trim();
  const validate = vm.runInNewContext(`(${source})`);

  assert.match(
    html,
    /const g=this\.parseLLMOutput\(raw\);const \{width:w,height:h\}=validateLLMGridSize\(g\);this\.saveState\(\);this\.grid=g;/,
    `${relativePath} must validate dimensions before changing saved/editor state`,
  );

  return validate;
}

function loadTemplateDimensionNormalizer(relativePath) {
  const html = fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
  const start = html.indexOf('    function normalizeLLMGridDimension(value, fallback) {');
  assert.notEqual(start, -1, `${relativePath} must define the template dimension normalizer`);

  const close = html.indexOf('\n    }', start);
  assert.notEqual(close, -1, `${relativePath} must close the template dimension normalizer`);
  const source = html.slice(start, close + '\n    }'.length).trim();
  const normalize = vm.runInNewContext(`(${source})`);

  assert.match(
    html,
    /const w=normalizeLLMGridDimension\(document\.getElementById\('tplWidth'\)\.value,this\.width\);const h=normalizeLLMGridDimension\(document\.getElementById\('tplHeight'\)\.value,this\.height\)/,
    `${relativePath} must use bounded dimensions when building the prompt`,
  );
  assert.match(html, /id="tplWidth"[^>]*min="5"[^>]*max="200"/);
  assert.match(html, /id="tplHeight"[^>]*min="5"[^>]*max="200"/);

  return normalize;
}

function makeGrid(width, height) {
  return Array.from({ length: height }, () => Array(width).fill(null));
}

for (const file of htmlFiles) {
  test(`${file} enforces the 5–200 manual LLM grid dimensions`, () => {
    const validate = loadGridSizeValidator(file);

    const minimum = validate(makeGrid(5, 5));
    assert.equal(minimum.width, 5);
    assert.equal(minimum.height, 5);

    const maximum = validate(makeGrid(200, 200));
    assert.equal(maximum.width, 200);
    assert.equal(maximum.height, 200);

    assert.throws(() => validate(makeGrid(4, 5)), /5-200/);
    assert.throws(() => validate(makeGrid(201, 5)), /5-200/);
    assert.throws(() => validate(makeGrid(5, 4)), /5-200/);
    assert.throws(() => validate(makeGrid(5, 201)), /5-200/);
    assert.throws(() => validate(null), /5-200/);

    const ragged = makeGrid(5, 5);
    ragged[1] = Array(201).fill(null);
    assert.throws(() => validate(ragged), /相同宽度/);

    const missingRow = makeGrid(5, 5);
    missingRow[1] = null;
    assert.throws(() => validate(missingRow), /相同宽度/);
  });

  test(`${file} constrains template prompt dimensions to 5–200`, () => {
    const normalize = loadTemplateDimensionNormalizer(file);
    assert.equal(normalize('4', 29), 5);
    assert.equal(normalize('201', 29), 200);
    assert.equal(normalize('', 29), 29);
    assert.equal(normalize('32', 29), 32);
  });
}
