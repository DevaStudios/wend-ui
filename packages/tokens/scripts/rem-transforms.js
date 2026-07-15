const BASE_PX_FONT_SIZE = 16;

function pxToRem(value, name) {
  const parsed = parseFloat(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid px value for "${name}": ${value}`);
  }
  if (parsed === 0) return '0';
  return `${parseFloat((parsed / BASE_PX_FONT_SIZE).toFixed(4))}rem`;
}

/**
 * Style Dictionary's built-in size/px and size/rem transforms only fire on tokens
 * with an explicit DTCG "type": "dimension", which nothing in this repo sets — every
 * token here just bakes its unit into the value string (e.g. "4px"). Spacing and
 * font-size tokens are stored as bare numbers (representing px) instead, so they need
 * their own transforms to become valid CSS/SCSS length values.
 */
const spacingRemTransform = {
  name: 'size/spacing-rem',
  type: 'value',
  filter: (token) => token.attributes?.category === 'spacing',
  transform: (token) => pxToRem(token.value, token.name)
};

const fontSizeRemTransform = {
  name: 'size/font-size-rem',
  type: 'value',
  filter: (token) => token.attributes?.category === 'font' && token.attributes?.type === 'size',
  transform: (token) => pxToRem(token.value, token.name)
};

module.exports = { spacingRemTransform, fontSizeRemTransform };
