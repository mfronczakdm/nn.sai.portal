import type { PulseAskResponse, PulseSource, PulseStateCode } from '@/lib/pulse-types';

const TYPE_LABEL: Record<PulseSource['type'], string> = {
  'knowledge-article': 'Insight',
  'people-and-teams': 'Lawyer',
  product: 'Capability',
  'shared-content': 'Related',
  other: 'Career',
};

const STATE_NAME: Record<PulseStateCode, string> = {
  FL: 'Florida',
  NC: 'North Carolina',
};

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
  return /webinar|podcast|cle|checklist|alert|white.?paper|presentation|guide|who.to.talk/i.test(
    hay
  );
}

function isCareerSource(source: PulseSource): boolean {
  const hay = `${source.title} ${source.url} ${source.path || ''}`.toLowerCase();
  return (
    source.type === 'other' ||
    /\/careers/i.test(hay) ||
    /career|open role|summer associate|how to apply|legal operations|lateral partner/i.test(hay)
  );
}

/**
 * Build a demoworthy, citation-backed answer from retrieved sources only.
 * Prefers lawyer bios for Pillsbury visitor demos; surfaces webinars and related
 * learning assets when the playbook includes them. Career intents use openings-first framing.
 */
export function composePulseAnswer(
  question: string,
  sources: PulseSource[],
  stateCode?: PulseStateCode | null
): PulseAskResponse {
  const personaState = stateCode ?? null;

  if (!sources.length) {
    return {
      answer:
        `I searched indexed Pillsbury content for “${question.trim()}” and didn’t find a strong match. ` +
        `Try describing the situation (industry, geography, or risk), or open site search for a broader look.`,
      sources: [],
      stateCallout: null,
      personaState,
    };
  }

  const careerHits = sources.filter(isCareerSource);
  const isCareerJourney = careerHits.length >= 2 || (careerHits.length >= 1 && careerHits[0] === sources[0]);

  if (isCareerJourney) {
    return composeCareerAnswer(question, sources, personaState);
  }

  const peopleHits = sources.filter((s) => s.type === 'people-and-teams');
  const insightHits = sources.filter((s) => s.type === 'knowledge-article');
  const learningHits = insightHits.filter(isLearningAsset);
  const otherInsightHits = insightHits.filter((s) => !isLearningAsset(s));
  const stateHits = personaState
    ? sources.filter((s) => s.stateCode === personaState)
    : [];

  const primary = peopleHits[0] || insightHits[0] || stateHits[0] || sources[0];
  const otherPeople = peopleHits.filter((s) => s.id !== primary.id);

  const lines: string[] = [];

  lines.push(
    `Here’s who I’d start with for “${question.trim()}” — based on indexed lawyer bios and related site content.`
  );

  const primaryBit = sentenceFromExcerpt(primary.excerpt);
  lines.push(
    primaryBit
      ? `**${primary.title}** (${TYPE_LABEL[primary.type]}). ${primaryBit}`
      : `**${primary.title}** (${TYPE_LABEL[primary.type]}) is the strongest match in the citations below.`
  );

  if (otherPeople.length) {
    const names = otherPeople
      .slice(0, 3)
      .map((s) => `**${s.title}** (${TYPE_LABEL[s.type]})`)
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
    lines.push(
      `To brief the business side before intake, use these learning assets: ${assetNames}.`
    );
    const webinar = learningHits.find((s) => /webinar/i.test(s.title));
    if (webinar) {
      const bit = sentenceFromExcerpt(webinar.excerpt);
      if (bit) lines.push(bit);
    }
  } else if (otherInsightHits.length) {
    const names = otherInsightHits
      .slice(0, 3)
      .map((s) => `**${s.title}** (${TYPE_LABEL[s.type]})`)
      .join('; ');
    lines.push(`Related indexed insights: ${names}.`);
  }

  lines.push(
    learningHits.length
      ? 'Keyword search rarely surfaces this people + webinar + guide path together — open the citation cards below for bios and learning assets.'
      : 'Keyword search is weaker for multi-factor asks like this — Pulse can connect practice, geography, and situation in one step. Open a citation card to view the full bio.'
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
    ...learningHits,
    ...otherInsightHits,
    ...sources.filter((s) => s.type !== 'people-and-teams' && s.type !== 'knowledge-article'),
  ].filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i);

  return {
    answer: lines.join('\n\n'),
    sources: ordered,
    stateCallout,
    personaState,
  };
}

function composeCareerAnswer(
  question: string,
  sources: PulseSource[],
  personaState: PulseStateCode | null
): PulseAskResponse {
  const openings = sources.filter(
    (s) =>
      isCareerSource(s) &&
      !/how to apply/i.test(s.title) &&
      !/^careers at pillsbury$/i.test(s.title.trim())
  );
  const hub = sources.find((s) => /^careers at pillsbury$/i.test(s.title.trim()));
  const howToApply = sources.find((s) => /how to apply/i.test(s.title));
  const people = sources.filter((s) => s.type === 'people-and-teams');
  const primary = openings[0] || hub || sources[0];
  const otherOpenings = openings.filter((s) => s.id !== primary.id);

  const lines: string[] = [];

  lines.push(
    `Here’s how I’d find openings for “${question.trim()}” — based on indexed career listings and apply guidance.`
  );

  const primaryBit = sentenceFromExcerpt(primary.excerpt);
  lines.push(
    primaryBit
      ? `**${primary.title}** (${TYPE_LABEL[primary.type] || 'Career'}). ${primaryBit}`
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
        : `Next step: open **${howToApply.title}** for resume and cover-letter guidance.`
    );
  } else if (hub) {
    lines.push(`Start from **${hub.title}** to browse every open track.`);
  }

  if (people.length) {
    const names = people
      .slice(0, 2)
      .map((s) => `**${s.title}**`)
      .join('; ');
    lines.push(`Optional practice contact while you explore: ${names}.`);
  }

  lines.push(
    'Describing the career you want beats hunting keywords alone — Pulse and site search surface the same openings in one step. Open a citation card to view the role.'
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
