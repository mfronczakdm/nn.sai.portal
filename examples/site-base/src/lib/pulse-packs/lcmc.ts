import type { PulseSource } from '@/lib/pulse-types';

import { composeLcmcPulseAnswer, retrieveLcmcPulseSources } from './lcmc-care';
import type { PulseSitePack } from './types';

function page(
  id: string,
  title: string,
  url: string,
  path: string,
  excerpt: string,
  type: PulseSource['type'] = 'other'
): Omit<PulseSource, 'score'> {
  return { id, title, url, path, excerpt, type };
}

const HOME = '/sitecore/content/lcmc/lcmc/Home';

/**
 * LCMC Health Pulse pack — find a provider + book an appointment.
 * Isolated from Quanex / Pillsbury / Amkor Default Pulse copy.
 */
export const lcmcPulsePack: PulseSitePack = {
  siteName: 'lcmc',
  brandName: 'LCMC Health',
  homePath: HOME,
  homeRootId: '{194F8944-6400-40DD-BDCB-931686A42643}',
  enableStatePersona: false,
  typeLabels: {
    'people-and-teams': 'Provider',
    'knowledge-article': 'Resource',
    product: 'Service',
    'shared-content': 'Related',
    other: 'Page',
    default: 'Page',
  },
  widgetCopy: {
    subtitle: 'Find a provider and book an appointment',
    emptyState:
      'Ask about a symptom, specialty, or hospital. Pulse matches published LCMC Health physicians and can deep-link Patient Appointments. Pregunte en inglés o español — Pulse replies in the language of your question.',
    placeholder: 'Ask Pulse… / Pregúntele a Pulse…',
    searching: 'Looking up published providers…',
  },
  starterPrompts: [
    'I need someone for sinus problems near West Jefferson',
    'Find a heart doctor at East Jefferson',
    'How do I book an appointment?',
    'Necesito un especialista de oído, nariz y garganta en West Jefferson',
  ],
  retrieveExtraSources: retrieveLcmcPulseSources,
  composeAnswer: composeLcmcPulseAnswer,
  citationFallbacks: {
    '{BAE717F7-D99D-4722-8FAF-CED2581DF809}': page(
      '{BAE717F7-D99D-4722-8FAF-CED2581DF809}',
      'Find a Provider',
      '/Find-a-Provider',
      `${HOME}/Find a Provider`,
      'Search published LCMC Health physicians by specialty and location.'
    ),
    '{96B478C7-15AA-47E2-9457-722E6BCC9D92}': page(
      '{96B478C7-15AA-47E2-9457-722E6BCC9D92}',
      'Patient Appointments',
      '/For-Patients/Patient-Appointments',
      `${HOME}/For Patients/Patient Appointments`,
      'Book a visit. Filters can pre-select specialty, location, and provider.'
    ),
    '{87C759FA-EFED-4FAE-80EA-5CD10A4C0046}': page(
      '{87C759FA-EFED-4FAE-80EA-5CD10A4C0046}',
      'Ears, Nose and Throat Care',
      '/Our-Services/Ears-Nose-and-Throat-Care',
      `${HOME}/Our Services/Ears Nose and Throat Care`,
      'ENT / otolaryngology services across LCMC Health.'
    ),
    '{130578E9-32C7-474B-9C19-E452C5DD0215}': page(
      '{130578E9-32C7-474B-9C19-E452C5DD0215}',
      'West Jefferson Medical Center',
      '/Our-Locations/West-Jefferson-Medical-Center',
      `${HOME}/Our Locations/West Jefferson Medical Center`,
      'West Jefferson Medical Center hospital location.'
    ),
    '{C2445C30-B8EB-4E7C-AB4D-7B1CD7CDBEEA}': page(
      '{C2445C30-B8EB-4E7C-AB4D-7B1CD7CDBEEA}',
      'Heart and Vascular Care',
      '/Our-Services/Heart-and-Vascular-Care',
      `${HOME}/Our Services/Heart and Vascular Care`,
      'Heart and vascular care across LCMC Health.'
    ),
  },
  intents: [
    {
      id: 'find-provider',
      matchAny: [
        ['doctor'],
        ['physician'],
        ['provider'],
        ['specialist'],
        ['medico'],
        ['especialista'],
        ['someone'],
      ],
      citationItemIds: [
        '{BAE717F7-D99D-4722-8FAF-CED2581DF809}',
        '{96B478C7-15AA-47E2-9457-722E6BCC9D92}',
      ],
    },
    {
      id: 'book-appointment',
      matchAny: [['book'], ['appointment'], ['schedule'], ['cita'], ['reservar'], ['agendar']],
      citationItemIds: [
        '{96B478C7-15AA-47E2-9457-722E6BCC9D92}',
        '{BAE717F7-D99D-4722-8FAF-CED2581DF809}',
      ],
    },
    {
      id: 'ent-care',
      matchAny: [
        ['sinus'],
        ['hearing'],
        ['tonsil'],
        ['sore', 'throat'],
        ['otolaryngolog'],
        ['otorrino'],
        ['oido'],
        ['garganta'],
        ['senos'],
        ['nariz'],
        ['ent', 'doctor'],
        ['ent', 'specialist'],
      ],
      citationItemIds: [
        '{87C759FA-EFED-4FAE-80EA-5CD10A4C0046}',
        '{BAE717F7-D99D-4722-8FAF-CED2581DF809}',
        '{96B478C7-15AA-47E2-9457-722E6BCC9D92}',
        '{130578E9-32C7-474B-9C19-E452C5DD0215}',
      ],
    },
    {
      id: 'west-jefferson',
      matchAny: [['west', 'jefferson'], ['wjmc']],
      citationItemIds: [
        '{130578E9-32C7-474B-9C19-E452C5DD0215}',
        '{BAE717F7-D99D-4722-8FAF-CED2581DF809}',
        '{96B478C7-15AA-47E2-9457-722E6BCC9D92}',
      ],
    },
    {
      id: 'heart-care',
      matchAny: [['heart'], ['cardio'], ['cardiolog'], ['corazon'], ['cardiologo']],
      citationItemIds: [
        '{C2445C30-B8EB-4E7C-AB4D-7B1CD7CDBEEA}',
        '{BAE717F7-D99D-4722-8FAF-CED2581DF809}',
        '{96B478C7-15AA-47E2-9457-722E6BCC9D92}',
      ],
    },
  ],
};
