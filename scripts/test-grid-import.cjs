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

function loadGridValidator(relativePath) {
  const html = fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
  const start = html.indexOf('    function validateImportedGrid(grid) {');
  assert.notEqual(start, -1, `${relativePath} must define the import validator`);

  const close = html.indexOf('\n    }', start);
  assert.notEqual(close, -1, `${relativePath} must close the import validator`);
  const source = html.slice(start, close + '\n    }'.length).trim();
  return vm.runInNewContext(`(${source})`, { PERLER_COLORS: colors });
}

for (const file of htmlFiles) {
  const validate = loadGridValidator(file);

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
}

console.log('Grid import validation passed for source and both deployed HTML copies.');
