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
  });
}
