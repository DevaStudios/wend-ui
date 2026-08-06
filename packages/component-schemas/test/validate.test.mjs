import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateComponentSchema } from '../src/validate.mjs';

test('validateComponentSchema accepts a well-formed component schema', () => {
  const schema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://schemas.wend-ui.dev/components/wend-test.schema.json',
    title: 'WendTest',
    description: 'A test component.',
    type: 'object',
    'x-wend-component': 'wend-test',
    'x-wend-slots': [{ name: 'default', description: 'Content.' }],
    'x-wend-tokens': [],
    properties: {
      size: { type: 'string', enum: ['small', 'large'], default: 'small', description: 'Size of the thing.' }
    },
    additionalProperties: false
  };

  const result = validateComponentSchema(schema);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('validateComponentSchema rejects a schema missing required x-wend-* metadata', () => {
  const schema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://schemas.wend-ui.dev/components/wend-test.schema.json',
    title: 'WendTest',
    description: 'A test component.',
    type: 'object',
    properties: {},
    additionalProperties: false
  };

  const result = validateComponentSchema(schema);
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});

test('validateComponentSchema rejects a property definition missing a description', () => {
  const schema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://schemas.wend-ui.dev/components/wend-test.schema.json',
    title: 'WendTest',
    description: 'A test component.',
    type: 'object',
    'x-wend-component': 'wend-test',
    'x-wend-slots': [],
    'x-wend-tokens': [],
    properties: {
      size: { type: 'string' }
    },
    additionalProperties: false
  };

  const result = validateComponentSchema(schema);
  assert.equal(result.valid, false);
});
