import type {
  PulseAskResponse,
  PulseSource,
  PulseSourceType,
  PulseStateCode,
} from '@/lib/pulse-types';
import type { PulseSitePack, PulseTypeLabels } from '@/lib/pulse-packs';

const DEFAULT_TYPE_LABELS: Record<PulseSourceType, string> = {
  'knowledge-article': 'Resource',
  'people-and-teams': 'Expert',
  product: 'Product',
  'shared-content': 'Related',
  other: 'Page',
};

const STATE_NAME: Record<PulseStateCode, string> = {
  FL: 'Florida',
  NC: 'North Carolina',
};

export type ComposePulseAnswerOptions = {
  stateCode?: PulseStateCode | null;
  pack?: PulseSitePack | null;
  brandName?: string;
  typeLabels?: PulseTypeLabels;
  enableStatePersona?: boolean;
};

function resolveBrandName(options?: ComposePulseAnswerOptions): string {
  return options?.pack?.brandName || options?.brandName || 'this site';
}

function resolveTypeLabels(options?: ComposePulseAnswerOptions): PulseTypeLabels {
  return options?.pack?.typeLabels || options?.typeLabels || DEFAULT_TYPE_LABELS;
}

function typeLabel(type: PulseSourceType, labels: PulseTypeLabels): string {
  return labels[type] || labels.default || DEFAULT_TYPE_LABELS[type];
}

function sentenceFromExcerpt(excerpt?: string): string {
  if (!excerpt?.trim()) return '';
  const cleaned = excerpt.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 180) return cleaned;
  const cut = cleaned.slice(0, 180);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function isLearningAsset(source: PulseSource): boolean {
  if (source.type !== 'knowledge-article') return false;
  const hay = `${source.title} ${source.url} ${source.path || ''}`.toLowerCase();
  return /webinar|podcast|cle|checklist|alert|white.?paper|presentation|guide|who.to.talk|technical/i.test(
    hay
  );
}

function isCareerSource(source: PulseSource): boolean {
  const hay = `${source.title} ${source.url} ${source.path || ''}`.toLowerCase();
  return (
    /\/careers/i.test(hay) ||
    /career|open role|summer associate|how to apply|legal operations|lateral partner|job opening/i.test(
      hay
    )
  );
}

function isProductLike(source: PulseSource): boolean {
  if (source.type === 'product') return true;
  const hay = `${source.path || ''} ${source.url}`.toLowerCase();
  return (
    /\/products?\//i.test(hay) ||
    /\/capabilities\//i.test(hay) ||
    /\/practices\//i.test(hay) ||
    /\/industries\//i.test(hay) ||
    /\/window/i.test(hay) ||
    /\/door/i.test(hay) ||
    /\/weatherseal/i.test(hay) ||
    /\/extrusion/i.test(hay) ||
    /\/hardware/i.test(hay)
  );
}

/**
 * Build a citation-backed answer from retrieved sources only.
 * Brand-agnostic templates; inject brandName / typeLabels from the active site pack.
 */
export function composePulseAnswer(
  question: string,
  sources: PulseSource[],
  options?: ComposePulseAnswerOptions | PulseStateCode | null
): PulseAskResponse {
  // Back-compat: composePulseAnswer(q, sources, stateCode)
  const opts: ComposePulseAnswerOptions =
    typeof options === 'string' || options === null || options === undefined
      ? { stateCode: options ?? null }
      : options;

  const brandName = resolveBrandName(opts);
  const labels = resolveTypeLabels(opts);
  const enableStatePersona = opts.enableStatePersona ?? opts.pack?.enableStatePersona ?? false;
  const personaState = enableStatePersona ? (opts.stateCode ?? null) : null;

  if (!sources.length) {
    return {
      answer:
        `I searched published ${brandName} content for “${question.trim()}” and didn’t find a strong match. ` +
        `Try another product, category, or topic — or open site search for a broader look. ` +
        `(Pulse uses the same Experience Edge content as the live site; unpublished items will not appear.)`,
      sources: [],
      stateCallout: null,
      personaState,
    };
  }

  const careerHits = sources.filter(isCareerSource);
  const isCareerJourney =
    careerHits.length >= 2 || (careerHits.length >= 1 && careerHits[0] === sources[0]);

  if (isCareerJourney) {
    return composeCareerAnswer(question, sources, personaState, brandName, labels);
  }

  const peopleHits = sources.filter((s) => s.type === 'people-and-teams');
  const productHits = sources.filter(isProductLike);
  const insightHits = sources.filter((s) => s.type === 'knowledge-article');
  const learningHits = insightHits.filter(isLearningAsset);
  const otherInsightHits = insightHits.filter((s) => !isLearningAsset(s));
  const stateHits = personaState
    ? sources.filter((s) => s.stateCode === personaState)
    : [];

  // Product / category journey (manufacturing brands)
  if (productHits.length >= 1 && peopleHits.length === 0) {
    return composeProductAnswer(
      question,
      sources,
      productHits,
      otherInsightHits.concat(learningHits),
      personaState,
      brandName,
      labels
    );
  }

  const primary = peopleHits[0] || productHits[0] || insightHits[0] || stateHits[0] || sources[0];
  const otherPeople = peopleHits.filter((s) => s.id !== primary.id);

  const lines: string[] = [];

  lines.push(
    peopleHits.length
      ? `Here’s who I’d start with for “${question.trim()}” — based on published ${brandName} bios and related site content.`
      : `Here’s what I’d start with for “${question.trim()}” — based on published ${brandName} site content.`
  );

  const primaryBit = sentenceFromExcerpt(primary.excerpt);
  lines.push(
    primaryBit
      ? `**${primary.title}** (${typeLabel(primary.type, labels)}). ${primaryBit}`
      : `**${primary.title}** (${typeLabel(primary.type, labels)}) is the strongest match in the citations below.`
  );

  if (otherPeople.length) {
    const names = otherPeople
      .slice(0, 3)
      .map((s) => `**${s.title}** (${typeLabel(s.type, labels)})`)
      .join('; ');
    lines.push(`Also bring in: ${names}.`);
    for (const extra of otherPeople.slice(0, 2)) {
      const bit = sentenceFromExcerpt(extra.excerpt);
      if (bit) lines.push(bit);
    }
  }

  if (learningHits.length) {
    const assetNames = learningHits
      .slice(0, 5)
      .map((s) => `**${s.title}**`)
      .join('; ');
    lines.push(`Related learning assets: ${assetNames}.`);
    const webinar = learningHits.find((s) => /webinar/i.test(s.title));
    if (webinar) {
      const bit = sentenceFromExcerpt(webinar.excerpt);
      if (bit) lines.push(bit);
    }
  } else if (otherInsightHits.length) {
    const names = otherInsightHits
      .slice(0, 3)
      .map((s) => `**${s.title}** (${typeLabel(s.type, labels)})`)
      .join('; ');
    lines.push(`Related resources: ${names}.`);
  }

  lines.push(
    'Open a citation card below to view the full page. Pulse connects multi-factor asks that keyword search alone often misses.'
  );

  if (personaState && stateHits.length) {
    lines.push(
      `Context note: results were also weighted toward ${STATE_NAME[personaState]} where applicable.`
    );
  }

  let stateCallout: string | null = null;
  if (personaState && stateHits.length) {
    stateCallout = `Highlighted for ${STATE_NAME[personaState]}`;
  }

  const ordered = [
    ...peopleHits,
    ...productHits,
    ...learningHits,
    ...otherInsightHits,
    ...sources.filter(
      (s) =>
        s.type !== 'people-and-teams' &&
        s.type !== 'knowledge-article' &&
        !isProductLike(s)
    ),
  ].filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i);

  return {
    answer: lines.join('\n\n'),
    sources: ordered,
    stateCallout,
    personaState,
  };
}

function composeProductAnswer(
  question: string,
  sources: PulseSource[],
  productHits: PulseSource[],
  resourceHits: PulseSource[],
  personaState: PulseStateCode | null,
  brandName: string,
  labels: PulseTypeLabels
): PulseAskResponse {
  const primary = productHits[0] || sources[0];
  const others = productHits.filter((s) => s.id !== primary.id);

  const lines: string[] = [];
  lines.push(
    `Here’s where I’d start for “${question.trim()}” — based on published ${brandName} product and category pages.`
  );

  const primaryBit = sentenceFromExcerpt(primary.excerpt);
  lines.push(
    primaryBit
      ? `**${primary.title}** (${typeLabel(primary.type, labels)}). ${primaryBit}`
      : `**${primary.title}** (${typeLabel(primary.type, labels)}) is the strongest match in the citations below.`
  );

  if (others.length) {
    const names = others
      .slice(0, 4)
      .map((s) => `**${s.title}** (${typeLabel(s.type, labels)})`)
      .join('; ');
    lines.push(`Also explore: ${names}.`);
  }

  if (resourceHits.length) {
    const names = resourceHits
      .slice(0, 3)
      .map((s) => `**${s.title}**`)
      .join('; ');
    lines.push(`Related resources: ${names}.`);
  }

  lines.push(
    'Citation cards link to live routes under this site. Unpublished Edge content will not appear.'
  );

  const ordered = [...productHits, ...resourceHits, ...sources].filter(
    (s, i, arr) => arr.findIndex((x) => x.id === s.id) === i
  );

  return {
    answer: lines.join('\n\n'),
    sources: ordered,
    stateCallout: null,
    personaState,
  };
}

function composeCareerAnswer(
  question: string,
  sources: PulseSource[],
  personaState: PulseStateCode | null,
  brandName: string,
  labels: PulseTypeLabels
): PulseAskResponse {
  const openings = sources.filter(
    (s) =>
      isCareerSource(s) &&
      !/how to apply/i.test(s.title) &&
      !new RegExp(`^careers at ${brandName}$`, 'i').test(s.title.trim())
  );
  const hub = sources.find((s) => new RegExp(`^careers at ${brandName}$`, 'i').test(s.title.trim()));
  const howToApply = sources.find((s) => /how to apply/i.test(s.title));
  const people = sources.filter((s) => s.type === 'people-and-teams');
  const primary = openings[0] || hub || sources[0];
  const otherOpenings = openings.filter((s) => s.id !== primary.id);

  const lines: string[] = [];

  lines.push(
    `Here’s how I’d find openings for “${question.trim()}” — based on published ${brandName} career pages.`
  );

  const primaryBit = sentenceFromExcerpt(primary.excerpt);
  lines.push(
    primaryBit
      ? `**${primary.title}** (${typeLabel(primary.type, labels)}). ${primaryBit}`
      : `**${primary.title}** is the strongest career match in the citations below.`
  );

  if (otherOpenings.length) {
    const names = otherOpenings
      .slice(0, 4)
      .map((s) => `**${s.title}**`)
      .join('; ');
    lines.push(`Also browse: ${names}.`);
  }

  if (howToApply) {
    const bit = sentenceFromExcerpt(howToApply.excerpt);
    lines.push(
      bit
        ? `Next step: **${howToApply.title}**. ${bit}`
        : `Next step: open **${howToApply.title}** for application guidance.`
    );
  } else if (hub) {
    lines.push(`Start from **${hub.title}** to browse every open track.`);
  }

  if (people.length) {
    const names = people
      .slice(0, 2)
      .map((s) => `**${s.title}**`)
      .join('; ');
    lines.push(`Optional contact while you explore: ${names}.`);
  }

  lines.push(
    'Describing the role you want beats hunting keywords alone — open a citation card to view the page.'
  );

  const ordered = [
    ...openings,
    ...(hub ? [hub] : []),
    ...(howToApply ? [howToApply] : []),
    ...people,
    ...sources,
  ].filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i);

  return {
    answer: lines.join('\n\n'),
    sources: ordered,
    stateCallout: 'Demo journey: career ask → openings + how to apply.',
    personaState,
  };
}
