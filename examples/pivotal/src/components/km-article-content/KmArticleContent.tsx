'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { RichText, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import type { RichTextField } from '@sitecore-content-sdk/nextjs';
import { Layers2, Star, ThumbsDown, ThumbsUp } from 'lucide-react';

import {
  filterChunksByPersonaState,
  resolveVariantChunks,
  type ResolvedVariantChunk,
} from '@/components/variant-content/variant-content.fields';
import type { VariantContentFields } from '@/components/variant-content/variant-content.props';
import {
  DEMO_TAXONOMY_CHANGE_EVENT,
  getPersonaStateCode,
  readStoredDemoTaxonomy,
} from '@/lib/demo-taxonomy';
import { recordArticleView } from '@/lib/knowledge-preferences';
import { cn } from '@/lib/utils';

import { TopicIconChip } from '@/components/taxonomy/TopicIconChip';

import {
  fieldNumber,
  hasRichText,
  hasText,
  mergeKmArticleContentFields,
} from './km-article-content.fields';
import type { KmArticleContentProps } from './km-article-content.props';

type ContentBlock = {
  id: string;
  label: string;
  field?: RichTextField;
};

type SectionDef = {
  id: string;
  number: string;
  title: string;
  blocks: ContentBlock[];
};

const VARIANT_CONTENT_ANCHOR = 'variant-content';

const KmArticleContentEmpty: React.FC = () => (
  <div className="border-border bg-muted/30 text-muted-foreground mx-auto max-w-4xl rounded-2xl border border-dashed p-8 text-sm">
    Knowledge Article fields are empty. Edit page fields (Title, Purpose, workflows, etc.) to populate
    this component.
  </div>
);

function SectionNav({ sections }: { sections: { id: string; title: string; number: string }[] }) {
  if (sections.length === 0) return null;
  return (
    <nav
      aria-label="Article sections"
      className="border-border bg-muted/40 rounded-2xl border p-4"
    >
      <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
        On this page
      </p>
      <ol className="space-y-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="text-foreground/80 hover:text-primary group flex items-start gap-2 text-sm leading-snug transition-colors"
            >
              <span className="text-muted-foreground group-hover:text-primary mt-0.5 font-mono text-xs">
                {section.number}
              </span>
              <span>{section.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function VariantsExistNav({ variants }: { variants: ResolvedVariantChunk[] }) {
  if (variants.length === 0) return null;
  return (
    <nav
      aria-label="Shared content variants"
      className="rounded-2xl border border-teal-800/20 bg-gradient-to-br from-teal-50 via-cyan-50/70 to-slate-50 p-4 shadow-[0_8px_24px_-16px_rgba(15,118,110,0.4)]"
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-teal-800 text-teal-50"
          aria-hidden
        >
          <Layers2 className="size-3.5" strokeWidth={2} />
        </span>
        <p className="text-teal-900 text-xs font-semibold tracking-wide uppercase">
          Variants Exist
        </p>
      </div>
      <ul className="space-y-2">
        {variants.map((variant) => (
          <li key={variant.id}>
            <a
              href={`#${VARIANT_CONTENT_ANCHOR}`}
              className="hover:bg-teal-900/5 group flex items-start gap-2 rounded-lg px-1 py-1 text-sm leading-snug transition-colors"
            >
              {variant.stateCode ? (
                <span className="mt-0.5 inline-flex shrink-0 items-center rounded bg-teal-800 px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold tracking-wide text-teal-50">
                  {variant.stateCode}
                </span>
              ) : (
                <span className="text-teal-700/50 mt-0.5 font-mono text-[0.65rem]">—</span>
              )}
              <span className="min-w-0">
                <span className="text-teal-950 group-hover:text-teal-800 block font-medium">
                  {variant.sectionLabel !== 'Shared' ? variant.sectionLabel : variant.name}
                </span>
                {variant.sectionLabel !== 'Shared' && (
                  <span className="text-teal-800/65 block truncate text-xs">{variant.name}</span>
                )}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ArticleAside({
  sections,
  variants,
}: {
  sections: { id: string; title: string; number: string }[];
  variants: ResolvedVariantChunk[];
}) {
  if (sections.length === 0 && variants.length === 0) return null;
  return (
    <div className="sticky top-4 hidden space-y-4 lg:block">
      <SectionNav sections={sections} />
      <VariantsExistNav variants={variants} />
    </div>
  );
}

function StarRow({ average, total }: { average: number; total: number }) {
  const rounded = Math.round(average * 2) / 2;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => {
          const fill = Math.min(1, Math.max(0, rounded - i));
          return (
            <span key={i} className="relative inline-flex size-4">
              <Star className="text-muted-foreground/35 absolute inset-0 size-4" strokeWidth={1.5} />
              {fill > 0 && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                  <Star className="size-4 fill-amber-400 text-amber-400" strokeWidth={1.5} />
                </span>
              )}
            </span>
          );
        })}
      </div>
      <p className="text-foreground text-sm font-semibold tabular-nums">
        {average.toFixed(1)}
        <span className="text-muted-foreground ml-1.5 font-normal">
          · {total.toLocaleString()} {total === 1 ? 'rating' : 'ratings'}
        </span>
      </p>
    </div>
  );
}

function ArticleRatings({
  positive,
  negative,
  average,
  total,
  isEditing,
}: {
  positive?: number;
  negative?: number;
  average?: number;
  total?: number;
  isEditing: boolean;
}) {
  const hasVotes =
    (positive !== undefined && positive > 0) || (negative !== undefined && negative > 0);
  const hasStars = average !== undefined && total !== undefined && total > 0;

  if (!hasVotes && !hasStars && !isEditing) return null;

  return (
    <div className="border-border/80 mt-1 space-y-3 border-t pt-4">
      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        Advisor feedback
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
        {(hasVotes || isEditing) && (
          <div className="flex items-center gap-3" aria-label="Helpfulness votes">
            <span className="border-border bg-background text-foreground inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm tabular-nums">
              <ThumbsUp className="size-3.5 text-emerald-600" aria-hidden />
              <span className="font-semibold">{(positive ?? 0).toLocaleString()}</span>
              <span className="sr-only">positive</span>
            </span>
            <span className="border-border bg-background text-foreground inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm tabular-nums">
              <ThumbsDown className="size-3.5 text-rose-600" aria-hidden />
              <span className="font-semibold">{(negative ?? 0).toLocaleString()}</span>
              <span className="sr-only">negative</span>
            </span>
          </div>
        )}
        {(hasStars || isEditing) && (
          <div aria-label={`Average rating ${average?.toFixed(1) ?? '0'} out of 5`}>
            {hasStars && average !== undefined && total !== undefined ? (
              <StarRow average={average} total={total} />
            ) : (
              <p className="text-muted-foreground text-sm">No star ratings yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * KmArticleContent — context-only rendering of Knowledge Article page fields.
 * Sectioned layout with LOB / Peril Type icon chips and advisor ratings in the header.
 */
export const Default: React.FC<KmArticleContentProps> = (props) => {
  const { params, isPageEditing: propIsEditing } = props;
  const { page } = useSitecore();
  const isEditing = propIsEditing !== undefined ? propIsEditing : page.mode.isEditing;

  const [personaStateCode, setPersonaStateCode] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const syncPersonaState = () => {
      const persona = readStoredDemoTaxonomy();
      setPersonaStateCode(persona ? getPersonaStateCode(persona) : null);
    };

    syncPersonaState();
    window.addEventListener(DEMO_TAXONOMY_CHANGE_EVENT, syncPersonaState);
    return () => {
      window.removeEventListener(DEMO_TAXONOMY_CHANGE_EVENT, syncPersonaState);
    };
  }, []);

  useEffect(() => {
    const routeId = page?.layout?.sitecore?.route?.itemId;
    if (!isEditing && routeId) {
      recordArticleView(routeId);
    }
  }, [isEditing, page?.layout?.sitecore?.route?.itemId]);

  const fields = mergeKmArticleContentFields(props, isEditing);
  const routeFields = page?.layout?.sitecore?.route?.fields as Record<string, unknown> | undefined;
  const allVariants = resolveVariantChunks(
    props.fields as VariantContentFields | undefined,
    routeFields
  );
  const visibleVariants =
    isEditing || personaStateCode === undefined
      ? allVariants
      : filterChunksByPersonaState(allVariants, personaStateCode);

  const kbId = fields['KB-ID'];
  const title = fields.Title;
  const lob = fields.LOB || [];
  const perilTypes = fields['Peril type'] || [];

  const positiveCount = fieldNumber(fields.PositiveCount);
  const negativeCount = fieldNumber(fields.NegativeCount);
  const totalRatings = fieldNumber(fields.TotalRatings);
  const ratingsSum = fieldNumber(fields.RatingsSum);
  const averageFromField = fieldNumber(fields.AverageRating);
  const averageRating =
    averageFromField ??
    (totalRatings && totalRatings > 0 && ratingsSum !== undefined
      ? ratingsSum / totalRatings
      : undefined);

  const sections: SectionDef[] = [
    {
      id: 'purpose-and-scope',
      number: '01',
      title: 'Purpose and Scope',
      blocks: [{ id: 'purpose', label: 'Purpose', field: fields.Purpose }],
    },
    {
      id: 'fnol-workflow',
      number: '02',
      title: 'FNOL Workflow',
      blocks: [
        { id: 'intake-triggers', label: 'Intake Triggers', field: fields['Intake Triggers'] },
        {
          id: 'core-triage-questions',
          label: 'Core Triage Questions',
          field: fields['Core Triage Questions'],
        },
        {
          id: 'general-escalation-rules',
          label: 'General Escalation Rules',
          field: fields['General Escalation Rules'],
        },
      ],
    },
    {
      id: 'investigation-and-documentation',
      number: '03',
      title: 'Investigation and Documentation',
      blocks: [
        {
          id: 'site-inspection',
          label: 'Standard Site Inspection Rules',
          field: fields['Standard Site Inspection Rules'],
        },
        {
          id: 'photo-video',
          label: 'Photo / Video Standards',
          field: fields['Photo Video Standards'],
        },
        {
          id: 'general-mitigation',
          label: 'General Mitigation',
          field: fields['General Mitigation'],
        },
      ],
    },
    {
      id: 'reserving-and-payment',
      number: '04',
      title: 'Reserving and Payment',
      blocks: [
        {
          id: 'baseline-reserves',
          label: 'Baseline Reserve Guidelines',
          field: fields['Baseline Reserve Guidelines'],
        },
        {
          id: 'payment-triggers',
          label: 'General Payment Triggers',
          field: fields['General Payment Triggers'],
        },
      ],
    },
    {
      id: 'common-scenarios',
      number: '05',
      title: 'Common Scenarios',
      blocks: [
        { id: 'scenarios', label: 'Common Scenarios', field: fields['Common Scenarios'] },
      ],
    },
  ];

  const visibleSections = sections
    .map((section) => ({
      ...section,
      blocks: section.blocks.filter((block) => hasRichText(block.field) || isEditing),
    }))
    .filter((section) => section.blocks.length > 0);

  const hasRatings =
    (positiveCount !== undefined && positiveCount > 0) ||
    (negativeCount !== undefined && negativeCount > 0) ||
    (totalRatings !== undefined && totalRatings > 0);

  const hasHeader =
    hasText(kbId) ||
    hasText(title) ||
    lob.length > 0 ||
    perilTypes.length > 0 ||
    hasRatings ||
    isEditing;

  if (!hasHeader && visibleSections.length === 0) {
    return <KmArticleContentEmpty />;
  }

  const sectionId = params?.RenderingIdentifier || 'km-article-content';

  return (
    <article
      id={sectionId}
      data-component="KmArticleContent"
      className={cn('@container km-article-content w-full', params?.styles)}
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-10 xl:gap-14">
          <div className="min-w-0">
            {hasHeader && (
              <header className="border-border from-muted/50 mb-10 space-y-5 rounded-2xl border bg-gradient-to-br to-transparent p-6 sm:p-8">
                {(hasText(kbId) || isEditing) && kbId && (
                  <Text
                    tag="p"
                    field={kbId}
                    className="text-muted-foreground font-mono text-xs font-semibold tracking-[0.14em] uppercase"
                  />
                )}
                {(hasText(title) || isEditing) && title && (
                  <Text
                    tag="h1"
                    field={title}
                    className="text-foreground text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-tight"
                  />
                )}

                {(lob.length > 0 || perilTypes.length > 0 || isEditing) && (
                  <div className="flex flex-col gap-4 pt-1">
                    {(lob.length > 0 || isEditing) && (
                      <div>
                        <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                          Line of business
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {lob.length > 0 ? (
                            lob.map((topic) => (
                              <TopicIconChip key={topic.id || topic.name} topic={topic} />
                            ))
                          ) : (
                            <p className="text-muted-foreground text-sm">Select LOB topics on the page.</p>
                          )}
                        </div>
                      </div>
                    )}
                    {(perilTypes.length > 0 || isEditing) && (
                      <div>
                        <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                          Peril type
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {perilTypes.length > 0 ? (
                            perilTypes.map((topic) => (
                              <TopicIconChip key={topic.id || topic.name} topic={topic} />
                            ))
                          ) : (
                            <p className="text-muted-foreground text-sm">
                              Select peril types on the page.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <ArticleRatings
                  positive={positiveCount}
                  negative={negativeCount}
                  average={averageRating}
                  total={totalRatings}
                  isEditing={isEditing}
                />
              </header>
            )}

            <div className="space-y-10 sm:space-y-12">
              {visibleSections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-heading`}
                  className="scroll-mt-24"
                >
                  <div className="mb-5 flex items-start gap-4 border-b border-border/80 pb-4">
                    <span
                      className="bg-primary text-primary-foreground mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-semibold"
                      aria-hidden
                    >
                      {section.number}
                    </span>
                    <h2
                      id={`${section.id}-heading`}
                      className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl"
                    >
                      {section.title}
                    </h2>
                  </div>

                  <div className="space-y-8 pl-0 sm:pl-13">
                    {section.blocks.map((block) => (
                      <div key={block.id} id={block.id} className="scroll-mt-28">
                        {section.blocks.length > 1 && (
                          <h3 className="text-foreground mb-3 text-base font-semibold tracking-tight sm:text-lg">
                            {block.label}
                          </h3>
                        )}
                        {block.field && (
                          <RichText
                            field={block.field}
                            className="km-article-richtext text-muted-foreground max-w-none text-pretty text-base leading-relaxed [&_a]:text-primary [&_h2]:text-foreground [&_h3]:text-foreground [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_strong]:text-foreground [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>

          <aside className="mt-10 lg:mt-0">
            <ArticleAside
              sections={visibleSections.map(({ id, title, number }) => ({ id, title, number }))}
              variants={visibleVariants}
            />
          </aside>
        </div>
      </div>
    </article>
  );
};
