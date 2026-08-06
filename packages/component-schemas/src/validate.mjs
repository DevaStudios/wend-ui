import Ajv2020 from 'ajv/dist/2020.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const metaSchemaPath = path.resolve(here, '../schemas/meta/component.schema.json');
const metaSchema = JSON.parse(readFileSync(metaSchemaPath, 'utf8'));

export function validateComponentSchema(schema) {
  const ajv = new Ajv2020({ strict: false });
  const validate = ajv.compile(metaSchema);
  const valid = validate(schema);
  return { valid, errors: validate.errors ?? [] };
}
