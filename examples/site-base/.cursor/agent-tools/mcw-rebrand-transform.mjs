/**
 * Field text transforms for LCMC -> MCW rebrand (Sitecore content).
 * Image/media src URLs are preserved; alt text and link URLs are updated.
 */

const MCW_SUFFIX = ' | Medical College of Wisconsin';

export function needsReplacement(value) {
  if (value == null || value === '') return false;
  const s = String(value);
  return (
    /lcmchealth\.org/i.test(s) ||
    /My LCMC Health/i.test(s) ||
    /LCMC Health/i.test(s) ||
    /\bLCMC\b/i.test(s)
  );
}

function transformText(s) {
  s = s.replace(/My LCMC Health/gi, 'MyChart');
  s = s.replace(/LCMC Health/gi, 'Medical College of Wisconsin');
  s = s.replace(/\bLCMC\b/g, 'MCW');
  s = s.replace(/\ban Medical College of Wisconsin\b/gi, 'a Medical College of Wisconsin');
  s = s.replace(/\bTalk with an Medical College\b/gi, 'Talk with a Medical College');
  return s;
}

function transformLinkUrls(s) {
  return s
    .replace(
      /(href|url)=(")https?:\/\/(?:www\.)?lcmchealth\.org([^"]*)"/gi,
      '$1=$2https://www.mcw.edu$3"'
    )
    .replace(
      /(href|url)=(")https?:\/\/careers\.lcmchealth\.org([^"]*)"/gi,
      '$1=$2https://www.mcw.edu$3"'
    );
}

function transformBody(s) {
  s = transformLinkUrls(s);
  s = transformText(s);
  return s;
}

function fixMetadataTitle(original, s, westJeffersonOnly) {
  if (!s.trim()) return s;
  const orig = String(original);

  if (westJeffersonOnly && /\|\s*LCMC/i.test(orig)) {
    return s.replace(/\s*\|\s*LCMC Health\s*$/i, MCW_SUFFIX).replace(/\s*\|\s*LCMC\s*$/i, MCW_SUFFIX);
  }

  if (westJeffersonOnly && /\|\s*West Jefferson Medical Center\s*$/i.test(s)) {
    return s;
  }

  if (/\|\s*LCMC/i.test(orig) || /\|\s*LCMC/i.test(s)) {
    return s.replace(/\s*\|\s*[^|]+$/, MCW_SUFFIX);
  }

  if (/-\s*LCMC\s*$/i.test(orig) || /-\s*MCW\s*$/i.test(s)) {
    return s.replace(/\s*-\s*[^-]+$/, MCW_SUFFIX);
  }

  if (/LCMC|lcmchealth/i.test(orig)) {
    if (s.includes('| Medical College of Wisconsin')) return s;
    if (s.includes(' | ')) {
      const head = s.split(' | ')[0].trim();
      return head + MCW_SUFFIX;
    }
    if (/^Medical College of Wisconsin\s+/i.test(s)) {
      const tail = s.replace(/^Medical College of Wisconsin\s+/i, '').trim();
      return (tail || s) + MCW_SUFFIX;
    }
    if (!s.includes('|')) return s + MCW_SUFFIX;
  }

  if (
    !westJeffersonOnly &&
    /Financial Assistance|Price Transparency|Pay Bills|New Orleans Hospitals/i.test(orig) &&
    !s.includes('| Medical College of Wisconsin')
  ) {
    const head = s.includes(' | ') ? s.split(' | ')[0].trim() : s.trim();
    return head + MCW_SUFFIX;
  }

  return s;
}

const IMAGE_FIELD_NAMES = new Set([
  'image',
  'ItemImage',
  'FeatureImage',
  'BackgroundImage',
  'pageThumbnail',
  'CenterImage',
  'ogImage',
]);

export function transformField(name, value, { westJeffersonOnly = false } = {}) {
  if (value == null || value === '') return value;
  const original = String(value);

  if (name === 'ZipSearchLink' || name === 'SpecialtySearchLink') {
    if (!/lcmchealth/i.test(original)) return original;
    return original.replace(/url="[^"]*"/i, 'url="https://www.mcw.edu/"');
  }

  if (IMAGE_FIELD_NAMES.has(name) && /src=/i.test(original)) {
    let s = original;
    s = s.replace(/alt="([^"]*)"/gi, (_, alt) => `alt="${transformText(alt)}"`);
    return s;
  }

  let s = transformBody(original);

  if (name === 'metadataTitle') {
    s = fixMetadataTitle(original, s, westJeffersonOnly);
  }

  return s;
}

export function collectFieldUpdates(fields, options = {}) {
  const updates = [];
  for (const [name, value] of Object.entries(fields || {})) {
    if (value === '' || value == null) continue;
    const str = String(value);
    const shouldTry =
      needsReplacement(value) ||
      (name === 'metadataTitle' && str.trim() && !str.includes('| Medical College of Wisconsin'));
    if (!shouldTry) continue;

    const next = transformField(name, value, options);
    if (next !== value) updates.push({ name, value: next });
  }
  return updates;
}

export function walkNodes(node, list = []) {
  if (!node) return list;
  if (node.itemId) {
    list.push({
      itemId: node.itemId,
      path: node.path,
      name: node.name,
      fields: node.fields ?? {},
    });
  }
  const children = node.children?.nodes ?? [];
  for (const child of children) {
    walkNodes(child, list);
  }
  return list;
}