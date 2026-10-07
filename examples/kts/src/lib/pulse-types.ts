export type PulseStateCode = 'FL' | 'NC';

export type PulseSourceType =
  | 'knowledge-article'
  | 'people-and-teams'
  | 'product'
  | 'shared-content'
  | 'other';

export type PulseSource = {
  id: string;
  title: string;
  url: string;
  path?: string;
  excerpt?: string;
  type: PulseSourceType;
  stateCode?: string;
  score: number;
};

export type PulseAskRequest = {
  question: string;
  /** Site key matching theme packs (cooley). */
  siteName?: string | null;
  stateCode?: PulseStateCode | null;
};

export type PulseAskResponse = {
  answer: string;
  sources: PulseSource[];
  stateCallout?: string | null;
  personaState?: PulseStateCode | null;
};

export type PulseRetrieveOptions = {
  siteName?: string | null;
  stateCode?: PulseStateCode | null;
  language?: string;
};
