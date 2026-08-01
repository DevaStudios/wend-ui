/**
 * Style Dictionary's built-in size/px transform only fires on tokens with an explicit
 * DTCG "type": "dimension", which nothing in this repo sets. Radius tokens are stored as
 * bare numbers (representing px), so they need their own transform to become valid
 * CSS/SCSS length values.
 */
const radiusPxTransform = {
  name: 'size/radius-px',
  type: 'value',
  filter: (token) => token.attributes?.category === 'radius',
  transform: (token) => {
    const parsed = parseFloat(token.value);
    if (Number.isNaN(parsed)) {
      throw new Error(`Invalid radius value for "${token.name}": ${token.value}`);
    }
    if (parsed === 0) return '0';
    return `${parsed}px`;
  }
};

module.exports = { radiusPxTransform };
