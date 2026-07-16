#!/usr/bin/env node
// Enforces the color token naming taxonomy documented in README.md's "Color token naming"
// section: color-{scope}-{variant}-{property}[-{state}].
//
// Run as part of `npm run build` so a token JSON edit that breaks the taxonomy fails the
// build immediately, instead of silently producing a token name nobody agreed to.

const fs = require('fs');
const path = require('path');

const TOKENS_DIR = path.join(__dirname, '..', 'tokens');
const PROPERTY_NAMES = ['background', 'foreground', 'border'];
const PROPERTY_PATTERN = new RegExp(`^(${PROPERTY_NAMES.join('|')})(-[a-z]+)?$`);

// Semantic categories where the category name already says which CSS property the token
// feeds (text-color, background-color, border-color) — no property segment is added.
// Add a new category here only if it is similarly self-evident.
const SELF_EVIDENT_CATEGORIES = ['text', 'surface', 'border'];

// Semantic categories that are role-based, not property-based (the category name alone
// doesn't say whether a variant is a background, foreground, or border color) — these
// require an explicit property segment. Add a new category here if it has the same
// ambiguity.
const ROLE_BASED_CATEGORIES = ['action', 'feedback'];

const errors = [];

function isLeafToken(node) {
  return node && typeof node === 'object' && 'value' in node;
}

function fail(file, pointer, message) {
  errors.push(`${file}: ${pointer} — ${message}`);
}

function validateSelfEvidentCategory(file, category, node) {
  for (const [variant, value] of Object.entries(node)) {
    const pointer = `color.${category}.${variant}`;
    if (!isLeafToken(value)) {
      fail(
        file,
        pointer,
        `expected a leaf token ({ "value": ... }) — "${category}" is a self-evident category, ` +
          `variants should not nest further. If this needs a property/state split, move it to ` +
          `ROLE_BASED_CATEGORIES in validate-color-taxonomy.js first.`
      );
    }
  }
}

function validateRoleBasedCategory(file, category, node) {
  for (const [variant, variantNode] of Object.entries(node)) {
    const variantPointer = `color.${category}.${variant}`;
    if (isLeafToken(variantNode)) {
      fail(
        file,
        variantPointer,
        `expected an object of properties, not a leaf token — "${category}" is role-based, ` +
          `every variant needs an explicit property segment (${PROPERTY_NAMES.join('/')}), ` +
          `e.g. color.${category}.${variant}.background.`
      );
      continue;
    }
    for (const [property, propertyValue] of Object.entries(variantNode)) {
      const propertyPointer = `${variantPointer}.${property}`;
      if (!PROPERTY_PATTERN.test(property)) {
        fail(
          file,
          propertyPointer,
          `property segment "${property}" must be one of ${PROPERTY_NAMES.join('/')}, ` +
            `optionally suffixed with "-<state>" for a non-default state (e.g. "background-hover"). ` +
            `Do not suffix the default state with "-default" at the semantic tier.`
        );
        continue;
      }
      if (property.endsWith('-default')) {
        fail(
          file,
          propertyPointer,
          `semantic-tier tokens omit "-default" — the base case has no state suffix ` +
            `(use "${property.replace('-default', '')}", not "${property}").`
        );
      }
      if (!isLeafToken(propertyValue)) {
        fail(file, propertyPointer, `expected a leaf token ({ "value": ... }).`);
      }
    }
  }
}

function validateSemanticColorTree(file, colorNode) {
  for (const [category, categoryNode] of Object.entries(colorNode)) {
    if (SELF_EVIDENT_CATEGORIES.includes(category)) {
      validateSelfEvidentCategory(file, category, categoryNode);
    } else if (ROLE_BASED_CATEGORIES.includes(category)) {
      validateRoleBasedCategory(file, category, categoryNode);
    } else {
      fail(
        file,
        `color.${category}`,
        `unknown category — add "${category}" to SELF_EVIDENT_CATEGORIES or ` +
          `ROLE_BASED_CATEGORIES in validate-color-taxonomy.js (whichever fits), or fix the typo.`
      );
    }
  }
}

function validateComponentColorTree(file, componentName, componentColorNode) {
  for (const [variant, variantNode] of Object.entries(componentColorNode)) {
    const variantPointer = `color.${componentName}.${variant}`;
    if (isLeafToken(variantNode)) {
      fail(
        file,
        variantPointer,
        `expected an object of properties, not a leaf token — component-tier tokens need an ` +
          `explicit property segment, e.g. color.${componentName}.${variant}.background.`
      );
      continue;
    }
    for (const [property, propertyNode] of Object.entries(variantNode)) {
      const propertyPointer = `${variantPointer}.${property}`;
      if (!PROPERTY_NAMES.includes(property)) {
        fail(
          file,
          propertyPointer,
          `property segment "${property}" must be one of ${PROPERTY_NAMES.join('/')} ` +
            `(component-tier property names never carry a state suffix — state is its own segment).`
        );
        continue;
      }
      if (isLeafToken(propertyNode)) {
        fail(
          file,
          propertyPointer,
          `expected an object of states, not a leaf token — component-tier tokens always have an ` +
            `explicit state segment, even for the default case: color.${componentName}.${variant}.${property}.default.`
        );
        continue;
      }
      if (!('default' in propertyNode)) {
        fail(
          file,
          propertyPointer,
          `missing a "default" state — component-tier tokens require it even when no other state exists.`
        );
      }
      for (const [state, stateValue] of Object.entries(propertyNode)) {
        if (!isLeafToken(stateValue)) {
          fail(file, `${propertyPointer}.${state}`, `expected a leaf token ({ "value": ... }).`);
        }
      }
    }
  }
}

function validateFile(filePath, kind) {
  const relPath = path.relative(path.join(__dirname, '..'), filePath);
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (kind === 'semantic') {
    if (json.color) validateSemanticColorTree(relPath, json.color);
    return;
  }

  // kind === 'component': the "color" top-level key (if present) holds this file's
  // color tokens, nested one level under the component name so kebab output starts with
  // "color-<component>-...". Any other top-level key is non-color and out of scope here.
  if (!json.color) return;
  for (const [componentName, componentColorNode] of Object.entries(json.color)) {
    validateComponentColorTree(relPath, componentName, componentColorNode);
  }
}

validateFile(path.join(TOKENS_DIR, 'semantic', 'color.json'), 'semantic');
validateFile(path.join(TOKENS_DIR, 'semantic', 'color.dark.json'), 'semantic');

const componentDir = path.join(TOKENS_DIR, 'component');
for (const entry of fs.readdirSync(componentDir)) {
  if (entry.endsWith('.json')) {
    validateFile(path.join(componentDir, entry), 'component');
  }
}

if (errors.length > 0) {
  console.error('\nColor token taxonomy violations:\n');
  for (const error of errors) console.error(`  ✗ ${error}`);
  console.error(
    `\nSee packages/tokens/README.md's "Color token naming" section for the taxonomy rules.\n`
  );
  process.exit(1);
}

console.log('✔︎ Color token taxonomy');
