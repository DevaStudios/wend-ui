export function getIconSvg(svgStrings, name, options = {}) {
  const { size = '1em', color = 'currentColor' } = options;
  const svg = svgStrings[name];
  if (!svg) return null;

  let result = svg.replace(/width="[^"]*"/, `width="${size}"`).replace(/height="[^"]*"/, `height="${size}"`);

  if (color !== 'currentColor') {
    result = result.replace(/fill="currentColor"/g, `fill="${color}"`);
  }

  return result;
}
