import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validateComponentSchema, createPropsValidator } from '../src/validate.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(here, '../schemas/components/wend-button.schema.json');
const buttonSchema = JSON.parse(readFileSync(schemaPath, 'utf8'));

test('wend-button.schema.json is a well-formed component schema', () => {
  const result = validateComponentSchema(buttonSchema);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("wend-button.schema.json declares the current implementation's props", () => {
  assert.deepEqual(Object.keys(buttonSchema.properties).sort(), ['disabled', 'variant']);
  assert.deepEqual(buttonSchema.properties.variant.enum, [
    'primary',
    'secondary',
    'tertiary',
    'destructive-primary',
    'destructive-secondary',
    'destructive-tertiary'
  ]);
});

const validateButtonProps = createPropsValidator(buttonSchema);

test('a valid button props object passes', () => {
  const result = validateButtonProps({ variant: 'primary', disabled: false });
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('an unknown variant value fails', () => {
  const result = validateButtonProps({ variant: 'quaternary' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.instancePath === '/variant'));
});

test('an undeclared prop fails because additionalProperties is false', () => {
  const result = validateButtonProps({ variant: 'primary', color: 'red' });
  assert.equal(result.valid, false);
});
