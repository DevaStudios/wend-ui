import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildIconManifest } from '../src/build-manifest.mjs';

test('buildIconManifest strips the wend-icon- prefix and .svg extension, sorted alphabetically', () => {
  const result = buildIconManifest(['wend-icon-star.svg', 'wend-icon-add.svg', 'wend-icon-add-circle.svg']);
  assert.deepEqual(result, { icons: ['add', 'add-circle', 'star'] });
});

test('buildIconManifest ignores non-svg files', () => {
  const result = buildIconManifest(['wend-icon-add.svg', '.DS_Store', 'README.md']);
  assert.deepEqual(result, { icons: ['add'] });
});

test('buildIconManifest returns an empty list for no files', () => {
  const result = buildIconManifest([]);
  assert.deepEqual(result, { icons: [] });
});
