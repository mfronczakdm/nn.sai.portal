'use client';

import type React from 'react';
import { Text, useSitecore } from '@sitecore-content-sdk/nextjs';

import { EditableButton as Button } from '@/components/button-component/ButtonComponent';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

import type { FAQListingProps, FaqItemReferenceField } from './faq-listing.props';

function resolveFaqItems(fields: FAQListingProps['fields']): FaqItemReferenceField[] {
  const raw = fields?.FeaturedFaq ?? fields?.featuredFaq;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [];
}

/**
 * FAQListing — accordion of selected AIFAQ items (Question / Answer).
 * Pattern mirrors ArticleListing: datasource with Treelist of referenced items.
 */
export const Default: React.FC<FAQListingProps> = (props) => {
  const { fields, params, isPageEditing: propIsEditing } = props;
  const { page } = useSitecore();
  const isPageEditing = propIsEditing !== undefined ? propIsEditing : page.mode.isEditing;

  if (!fields) {
    return <NoDataFallback componentName="FAQListing" />;
  }

  const { titleOptional, descriptionOptional, linkOptional } = fields;
  const faqItems = resolveFaqItems(fields);
  const sectionId = params?.RenderingIdentifier || 'faq-listing-section';

  return (
    <section
      id={sectionId}
      data-component="FAQListing"
      className={cn('@container', params?.styles)}
      {...(titleOptional?.value ? { 'aria-labelledby': `${sectionId}-title` } : {})}
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {(titleOptional || descriptionOptional || linkOptional?.value?.href || isPageEditing) && (
          <div className="@md:flex-row @md:items-end @md:justify-between mb-8 flex flex-col gap-4">
            <div className="min-w-0 flex-1">
              {(titleOptional?.value || isPageEditing) && (
                <Text
                  tag="h2"
                  id={`${sectionId}-title`}
                  field={titleOptional}
                  className="text-foreground text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
                />
              )}
              {(descriptionOptional?.value || isPageEditing) && (
                <Text
                  tag="p"
                  field={descriptionOptional}
                  className="text-muted-foreground mt-3 max-w-2xl text-pretty text-base leading-relaxed sm:text-lg"
                />
              )}
            </div>
            {(linkOptional?.value?.href || isPageEditing) && (
              <div className="shrink-0">
                <Button
                  buttonLink={
                    linkOptional || {
                      value: {
                        href: '',
                        text: 'Add link',
                        linktype: 'external',
                        url: '',
                        anchor: '',
                        target: '',
                      },
                    }
                  }
                  isPageEditing={isPageEditing}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                />
              </div>
            )}
          </div>
        )}

        {faqItems.length === 0 && !isPageEditing ? (
          <p className="text-muted-foreground text-sm">No FAQ items selected.</p>
        ) : faqItems.length === 0 && isPageEditing ? (
          <div className="border-border bg-muted/30 text-muted-foreground rounded-2xl border border-dashed p-6 text-sm">
            Select AIFAQ items in the Featured FAQ Treelist to populate this accordion.
          </div>
        ) : (
          <Accordion type="multiple" className="border-border w-full rounded-2xl border px-4 sm:px-6">
            {faqItems.map((item, index) => {
              const id = item.id || `faq-${index}`;
              const question = item.fields?.Question;
              const answer = item.fields?.Answer;
              const hasQuestion = Boolean(question?.value?.trim());
              const hasAnswer = Boolean(answer?.value?.trim());

              if (!hasQuestion && !hasAnswer && !isPageEditing) {
                return null;
              }

              return (
                <AccordionItem key={id} value={id} className="border-border">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <Text
                      tag="span"
                      field={question}
                      className="text-foreground pr-4 text-base font-medium leading-snug sm:text-lg"
                    />
                  </AccordionTrigger>
                  <AccordionContent>
                    <Text
                      tag="div"
                      field={answer}
                      className="text-muted-foreground whitespace-pre-wrap text-pretty text-base leading-relaxed"
                    />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </section>
  );
};
