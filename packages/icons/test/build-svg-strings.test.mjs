import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSvgStrings } from '../src/build-svg-strings.mjs';

test('buildSvgStrings normalizes empty fill="" to fill="currentColor"', () => {
  const result = buildSvgStrings([
    { filename: 'wend-icon-add.svg', content: '<svg fill="none"><path d="M0 0" fill=""/></svg>' }
  ]);
  assert.equal(result.add, '<svg fill="none"><path d="M0 0" fill="currentColor"/></svg>');
});

test('buildSvgStrings leaves the root fill="none" untouched', () => {
  const result = buildSvgStrings([
    { filename: 'wend-icon-house.svg', content: '<svg fill="none"><path d="M1 1" fill=""/></svg>' }
  ]);
  assert.match(result.house, /^<svg fill="none">/);
});

test('buildSvgStrings strips the wend-icon- prefix and .svg extension for keys', () => {
  const result = buildSvgStrings([{ filename: 'wend-icon-arrow-right.svg', content: '<svg></svg>' }]);
  assert.deepEqual(Object.keys(result), ['arrow-right']);
});

test('buildSvgStrings ignores non-svg entries', () => {
  const result = buildSvgStrings([
    { filename: 'wend-icon-add.svg', content: '<svg fill=""/>' },
    { filename: '.DS_Store', content: 'binary junk' }
  ]);
  assert.deepEqual(Object.keys(result), ['add']);
});

test('buildSvgStrings normalizes multiple fill="" occurrences in one file', () => {
  const result = buildSvgStrings([
    {
      filename: 'wend-icon-two-paths.svg',
      content: '<svg fill="none"><path d="a" fill=""/><path d="b" fill=""/></svg>'
    }
  ]);
  const fillCount = (result['two-paths'].match(/fill="currentColor"/g) || []).length;
  assert.equal(fillCount, 2);
});
