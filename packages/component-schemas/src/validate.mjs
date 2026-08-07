import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const metaSchemaPath = path.resolve(here, '../schemas/meta/component.schema.json');
const metaSchema = JSON.parse(readFileSync(metaSchemaPath, 'utf8'));

const metaAjv = new Ajv2020({ strict: false });
addFormats(metaAjv);
const validateMetaSchema = metaAjv.compile(metaSchema);

export function validateComponentSchema(schema) {
  const valid = validateMetaSchema(schema);
  return { valid, errors: validateMetaSchema.errors ?? [] };
}

export function createPropsValidator(schema) {
  const ajv = new Ajv2020({ strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  return (props) => {
    const valid = validate(props);
    return { valid, errors: validate.errors ?? [] };
  };
}
