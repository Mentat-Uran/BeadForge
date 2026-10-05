const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repositoryRoot = path.resolve(__dirname, '..');
const htmlFiles = [
  'BeadForge.html',
  'dist/client/index.html',
  'dist/client/BeadForge.html',
];
const colors = [{ id: 'P01' }, { id: 'P18' }];

function loadGridApp(relativePath) {
  const html = fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
  const helperStart = html.indexOf('    function validateImportedGrid(grid) {');
  const parseStart = html.indexOf('        parseLLMOutput(content){');
  const validateStart = html.indexOf('\n        validateGrid(grid){', parseStart);
  const mockStart = html.indexOf('\n        mockPattern(', validateStart);
  assert.notEqual(helperStart, -1, `${relativePath} must define the import validator`);
  assert.notEqual(parseStart, -1, `${relativePath} must define the LLM output parser`);
  assert.notEqual(validateStart, -1, `${relativePath} must define the grid validator method`);
  assert.notEqual(mockStart, -1, `${relativePath} must close the grid validator method`);

  const helperClose = html.indexOf('\n    }', helperStart);
  assert.notEqual(helperClose, -1, `${relativePath} must close the import validator`);
  const helperSource = html.slice(helperStart, helperClose + '\n    }'.length).trim();
  const parseSource = html.slice(parseStart, validateStart).trim();
  const validateSource = html.slice(validateStart + 1, mockStart).trim();
  return vm.runInNewContext(
    `${helperSource}\n({ ${parseSource}, ${validateSource} })`,
    { PERLER_COLORS: colors },
  );
}

for (const file of htmlFiles) {
  const app = loadGridApp(file);
  const validate = app.validateGrid.bind(app);

  assert.equal(
    JSON.stringify(validate([['P01', null], ['P18', 'unknown']])),
    JSON.stringify([['P01', null], ['P18', null]]),
    `${file} should preserve valid colors and normalize unknown colors`,
  );
  assert.throws(
    () => validate([['P01', null], ['P18']]),
    /相同数量/,
    `${file} should reject rows with different widths`,
  );
  assert.throws(
    () => validate([['P01'], null]),
    /相同数量/,
    `${file} should reject non-array rows`,
  );
  assert.throws(
    () => validate([]),
    /非空二维数组/,
    `${file} should reject empty grids`,
  );
  assert.throws(
    () => app.parseLLMOutput('[["P01"],["P18","P01"]]'),
    /相同数量/,
    `${file} should not flatten malformed single-line JSON into one row`,
  );
  for (const invalidJson of ['{"grid":null}', '{"grid":false}']) {
    assert.throws(
      () => app.parseLLMOutput(invalidJson),
      /非空二维数组/,
      `${file} should reject a present but invalid grid value`,
    );
  }
  assert.equal(
    JSON.stringify(app.parseLLMOutput('[["P01","P18"],["P18","P01"]]')),
    JSON.stringify([['P01', 'P18'], ['P18', 'P01']]),
    `${file} should preserve valid single-line JSON grids`,
  );
  assert.equal(
    JSON.stringify(app.parseLLMOutput('P01, P18\nP18, P01')),
    JSON.stringify([['P01', 'P18'], ['P18', 'P01']]),
    `${file} should continue accepting plain-text grids`,
  );
}

console.log('Grid validation and LLM parsing passed for source and both deployed HTML copies.');
