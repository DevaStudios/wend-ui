import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getIconSvg } from '../src/get-icon-svg.mjs';

const svgStrings = {
  add: '<svg width="24" height="24" fill="none"><path d="M0 0" fill="currentColor"/></svg>'
};

test('getIconSvg replaces width and height with the given size', () => {
  const result = getIconSvg(svgStrings, 'add', { size: '20px' });
  assert.match(result, /width="20px"/);
  assert.match(result, /height="20px"/);
});

test('getIconSvg defaults size to 1em when not provided', () => {
  const result = getIconSvg(svgStrings, 'add', {});
  assert.match(result, /width="1em"/);
  assert.match(result, /height="1em"/);
});

test('getIconSvg leaves fill="currentColor" untouched when color is the default', () => {
  const result = getIconSvg(svgStrings, 'add', {});
  assert.equal(result, '<svg width="1em" height="1em" fill="none"><path d="M0 0" fill="currentColor"/></svg>');
});

test('getIconSvg replaces fill="currentColor" with a custom color', () => {
  const result = getIconSvg(svgStrings, 'add', { color: '#ff0000' });
  assert.match(result, /<path d="M0 0" fill="#ff0000"\/>/);
});

test('getIconSvg does not touch the root fill="none" even with a custom color', () => {
  const result = getIconSvg(svgStrings, 'add', { color: '#ff0000' });
  assert.match(result, /^<svg width="1em" height="1em" fill="none">/);
});

test('getIconSvg returns null for an unknown icon name', () => {
  const result = getIconSvg(svgStrings, 'not-a-real-icon', {});
  assert.equal(result, null);
});

test('getIconSvg works with no options argument at all', () => {
  const result = getIconSvg(svgStrings, 'add');
  assert.match(result, /width="1em"/);
});
