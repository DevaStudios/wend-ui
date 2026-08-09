export function buildIconManifest(filenames) {
  const icons = filenames
    .filter((name) => name.endsWith('.svg'))
    .map((name) => name.replace(/^wend-icon-/, '').replace(/\.svg$/, ''))
    .sort();
  return { icons };
}
