export function buildSvgStrings(entries) {
  const strings = {};
  for (const { filename, content } of entries) {
    if (!filename.endsWith('.svg')) continue;
    const name = filename.replace(/^wend-icon-/, '').replace(/\.svg$/, '');
    strings[name] = content.replace(/fill=""/g, 'fill="currentColor"');
  }
  return strings;
}
