'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { RichText, useSitecore } from '@sitecore-content-sdk/nextjs';
import { Layers2 } from 'lucide-react';

import {
  DEMO_TAXONOMY_CHANGE_EVENT,
  getPersonaStateCode,
  readStoredDemoTaxonomy,
} from '@/lib/demo-taxonomy';
import { cn } from '@/lib/utils';

import {
  filterChunksByPersonaState,
  groupChunksBySection,
  hasRichText,
  resolveVariantChunks,
} from './variant-content.fields';
import type { VariantContentProps } from './variant-content.props';

const VariantContentEmpty: React.FC<{ filteredByState?: string | null }> = ({
  filteredByState,
}) => (
  <div className="border-teal-700/25 bg-teal-50/80 text-teal-900/70 mx-auto max-w-4xl rounded-2xl border border-dashed px-6 py-8 text-sm">
    {filteredByState ? (
      <>
        No shared variant content is available for licensed state{' '}
        <span className="font-semibold">{filteredByState}</span> on this Knowledge Article.
      </>
    ) : (
      <>
        No shared variant content is linked on this Knowledge Article. Add KnowledgeChunks items to
        the
        <span className="font-semibold"> sharedContent </span>
        Treelist to show state-specific callouts here.
      </>
    )}
  </div>
);

/**
 * VariantContent — context component for Knowledge Article.sharedContent Treelist.
 * Groups KnowledgeChunks by Shared Content section folder and renders Content
 * in callout cards that contrast with KmArticleContent above.
 *
 * Demo persona filter: logged-out (nationwide) shows all states; logged-in FL/NC
 * personas only see chunks for that state code.
 */
export const Default: React.FC<VariantContentProps> = (props) => {
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

  const routeFields = page?.layout?.sitecore?.route?.fields as Record<string, unknown> | undefined;
  const allChunks = resolveVariantChunks(props.fields, routeFields).filter(
    (chunk) => hasRichText(chunk.content) || isEditing
  );

  // Wait for client persona read so logged-in users do not briefly see every state.
  if (!isEditing && personaStateCode === undefined) {
    return null;
  }

  // Authors in Experience Editor always see every linked variant.
  const chunks = isEditing
    ? allChunks
    : filterChunksByPersonaState(allChunks, personaStateCode);
  const groups = groupChunksBySection(chunks);

  if (groups.length === 0) {
    if (!isEditing && allChunks.length === 0) return null;
    return (
      <VariantContentEmpty
        filteredByState={!isEditing && allChunks.length > 0 ? personaStateCode : null}
      />
    );
  }

  const sectionId = params?.RenderingIdentifier || 'variant-content';

  return (
    <section
      id={sectionId}
      data-component="VariantContent"
      className={cn('@container variant-content w-full', params?.styles)}
      aria-label="Variant shared content"
    >
      <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8 lg:pb-14">
        <div className="space-y-8">
          {groups.map((group) => (
            <div
              key={group.sectionKey}
              className="overflow-hidden rounded-2xl border border-teal-800/20 bg-gradient-to-br from-teal-50 via-cyan-50/80 to-slate-100 shadow-[0_12px_40px_-18px_rgba(15,118,110,0.45)]"
            >
              <header className="flex flex-wrap items-center gap-3 border-b border-teal-800/15 bg-teal-900 px-5 py-4 sm:px-6">
                <span
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-teal-50"
                  aria-hidden
                >
                  <Layers2 className="size-5" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.65rem] font-semibold tracking-[0.16em] text-teal-200/90 uppercase">
                    Shared content
                    {personaStateCode && !isEditing ? ` · ${personaStateCode} only` : ''}
                  </p>
                  <h2 className="text-balance text-lg font-semibold tracking-tight text-teal-50 sm:text-xl">
                    Variant Content - {group.sectionLabel}
                  </h2>
                </div>
              </header>

              <div className="space-y-4 p-4 sm:p-5 lg:p-6">
                {group.chunks.map((chunk) => (
                  <article
                    key={chunk.id}
                    className="rounded-xl border border-teal-800/15 bg-white/90 shadow-sm ring-1 ring-teal-900/5"
                  >
                    <div className="flex flex-wrap items-center gap-2 border-b border-teal-800/10 bg-teal-50/70 px-4 py-2.5 sm:px-5">
                      {chunk.stateCode && (
                        <span className="inline-flex items-center rounded-md bg-teal-800 px-2 py-0.5 font-mono text-[0.7rem] font-semibold tracking-wide text-teal-50">
                          {chunk.stateCode}
                        </span>
                      )}
                      <p className="text-teal-900/70 truncate text-xs font-medium">{chunk.name}</p>
                    </div>
                    <div className="border-l-4 border-teal-600 px-4 py-5 sm:px-5 sm:py-6">
                      {chunk.content && (hasRichText(chunk.content) || isEditing) && (
                        <RichText
                          field={chunk.content}
                          className="variant-content__richtext text-slate-700 max-w-none text-pretty text-base leading-relaxed [&_a]:text-teal-800 [&_a]:underline-offset-2 hover:[&_a]:underline [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_strong]:text-slate-900 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5"
                        />
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
