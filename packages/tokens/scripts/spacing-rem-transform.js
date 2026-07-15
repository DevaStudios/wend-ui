const BASE_PX_FONT_SIZE = 16;

/**
 * Style Dictionary's built-in size/px and size/rem transforms only fire on tokens
 * with an explicit DTCG "type": "dimension", which nothing in this repo sets — every
 * token here just bakes its unit into the value string (e.g. "4px"). Spacing tokens
 * are the one category stored as bare numbers (representing px), so they need their
 * own transform to become valid CSS/SCSS length values.
 */
const spacingRemTransform = {
  name: 'size/spacing-rem',
  type: 'value',
  filter: (token) => token.attributes?.category === 'spacing',
  transform: (token) => {
    const parsed = parseFloat(token.value);
    if (Number.isNaN(parsed)) {
      throw new Error(`Invalid spacing value for "${token.name}": ${token.value}`);
    }
    if (parsed === 0) return '0';
    return `${parseFloat((parsed / BASE_PX_FONT_SIZE).toFixed(4))}rem`;
  }
};

module.exports = { spacingRemTransform };
