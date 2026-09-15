'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ArrowRight, Clock3, Star } from 'lucide-react';

import { TopicIconChip } from '@/components/taxonomy/TopicIconChip';
import {
  isFavoriteArticle,
  KNOWLEDGE_PREFERENCES_CHANGE_EVENT,
  toggleFavoriteArticle,
} from '@/lib/knowledge-preferences';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

import {
  fetchListingArticles,
  resolveDatasource,
  resolveDescription,
  resolveListingMode,
  resolveMaxItems,
  resolveTitle,
  type ResolvedKnowledgeArticle,
} from './knowledge-listing.fields';
import type { KnowledgeListingMode, KnowledgeListingProps } from './knowledge-listing.props';

type ViewKind = 'card' | 'list' | 'detail';

const KnowledgeListingEmpty: React.FC<{ mode: KnowledgeListingMode; isEditing: boolean }> = ({
  mode,
  isEditing,
}) => {
  const message =
    mode === 'Favorites'
      ? 'No highly rated knowledge articles were found yet.'
      : mode === 'Recently Viewed'
        ? 'Open a knowledge article, then return here to see your viewing history.'
        : 'No recently updated knowledge articles were found.';

  return (
    <div className="border-border bg-muted/30 text-muted-foreground rounded-2xl border border-dashed p-6 text-sm">
      {isEditing
        ? 'This listing is dynamic. Set Listing Mode and Max Items — articles are selected automatically from Knowledge Articles.'
        : message}
    </div>
  );
};

function ModeBadge({ mode }: { mode: KnowledgeListingMode }) {
  const label = mode === 'Favorites' ? 'Top rated' : mode;
  return (
    <span className="border-border bg-muted/50 text-muted-foreground inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium tracking-wide">
      {mode === 'Recently Updated' ? (
        <Clock3 className="size-3.5" aria-hidden />
      ) : (
        <Star className="size-3.5" aria-hidden />
      )}
      {label}
    </span>
  );
}

function FavoriteButton({
  articleId,
  className,
}: {
  articleId: string;
  className?: string;
}) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    const sync = () => setFav(isFavoriteArticle(articleId));
    sync();
    window.addEventListener(KNOWLEDGE_PREFERENCES_CHANGE_EVENT, sync);
    return () => window.removeEventListener(KNOWLEDGE_PREFERENCES_CHANGE_EVENT, sync);
  }, [articleId]);

  return (
    <button
      type="button"
      className={cn(
        'text-muted-foreground hover:text-primary inline-flex size-9 items-center justify-center rounded-lg transition-colors',
        fav && 'text-primary',
        className
      )}
      aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={fav}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setFav(toggleFavoriteArticle(articleId));
      }}
    >
      <Star className={cn('size-4', fav && 'fill-current')} aria-hidden />
    </button>
  );
}

function TopicRow({ article }: { article: ResolvedKnowledgeArticle }) {
  if (article.lob.length === 0 && article.perilTypes.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {article.lob.map((topic) => (
        <TopicIconChip key={topic.id || topic.name} topic={topic} size="sm" />
      ))}
      {article.perilTypes.map((topic) => (
        <TopicIconChip key={topic.id || topic.name} topic={topic} size="sm" />
      ))}
    </div>
  );
}

function CardItem({ article }: { article: ResolvedKnowledgeArticle }) {
  return (
    <article className="border-border bg-background group relative flex h-full flex-col gap-4 rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {article.kbId ? (
            <p className="text-muted-foreground mb-1 font-mono text-xs tracking-wide">{article.kbId}</p>
          ) : null}
          <h3 className="text-foreground text-lg font-semibold leading-snug tracking-tight">
            <Link
              href={article.href}
              prefetch={false}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {article.title}
            </Link>
          </h3>
        </div>
        <FavoriteButton articleId={article.id} className="relative z-10 shrink-0" />
      </div>
      <TopicRow article={article} />
      {article.purposePlain ? (
        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
          {article.purposePlain}
        </p>
      ) : null}
      <div className="text-primary mt-auto inline-flex items-center gap-1 text-sm font-medium">
        Open article
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </div>
    </article>
  );
}

function ListItem({ article }: { article: ResolvedKnowledgeArticle }) {
  return (
    <li className="border-border relative flex flex-col gap-3 border-b py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {article.kbId ? (
            <span className="text-muted-foreground font-mono text-xs">{article.kbId}</span>
          ) : null}
        </div>
        <Link
          href={article.href}
          prefetch={false}
          className="text-foreground hover:text-primary text-base font-semibold tracking-tight transition-colors"
        >
          {article.title}
        </Link>
        <div className="mt-2">
          <TopicRow article={article} />
        </div>
      </div>
      <FavoriteButton articleId={article.id} className="self-start" />
    </li>
  );
}

function DetailItem({ article }: { article: ResolvedKnowledgeArticle }) {
  return (
    <article className="border-border bg-background rounded-2xl border p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {article.kbId ? (
            <p className="text-muted-foreground mb-1 font-mono text-xs tracking-wide">{article.kbId}</p>
          ) : null}
          <h3 className="text-foreground text-xl font-semibold tracking-tight">
            <Link href={article.href} prefetch={false} className="hover:text-primary transition-colors">
              {article.title}
            </Link>
          </h3>
        </div>
        <FavoriteButton articleId={article.id} />
      </div>
      <div className="mt-4">
        <TopicRow article={article} />
      </div>
      {article.purposeHtml ? (
        <div
          className="text-muted-foreground prose prose-sm mt-4 max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.purposeHtml }}
        />
      ) : null}
      <Link
        href={article.href}
        prefetch={false}
        className="text-primary mt-5 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
      >
        View full article
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </article>
  );
}

function KnowledgeListingView({
  props,
  view,
}: {
  props: KnowledgeListingProps;
  view: ViewKind;
}) {
  const { params, isPageEditing: propIsEditing } = props;
  const { page } = useSitecore();
  const isEditing = propIsEditing !== undefined ? propIsEditing : page.mode.isEditing;
  const usePreviewEdge = Boolean(isEditing || page.mode.isPreview);

  const datasource = resolveDatasource(props);
  const [prefTick, setPrefTick] = useState(0);
  const [articles, setArticles] = useState<ResolvedKnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = () => setPrefTick((n) => n + 1);
    window.addEventListener(KNOWLEDGE_PREFERENCES_CHANGE_EVENT, sync);
    return () => window.removeEventListener(KNOWLEDGE_PREFERENCES_CHANGE_EVENT, sync);
  }, []);

  const mode = resolveListingMode(datasource);
  const maxItems = resolveMaxItems(datasource);
  const titleField = resolveTitle(datasource);
  const descriptionField = resolveDescription(datasource);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchListingArticles({ mode, maxItems, preview: usePreviewEdge })
      .then((rows) => {
        if (!cancelled) setArticles(rows);
      })
      .catch(() => {
        if (!cancelled) setArticles([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, maxItems, prefTick, usePreviewEdge]);

  if (!datasource && !isEditing) {
    return <NoDataFallback componentName="KnowledgeListing" />;
  }

  const sectionId = params?.RenderingIdentifier || 'knowledge-listing';

  return (
    <section
      id={sectionId}
      data-component="KnowledgeListing"
      data-view={view}
      data-listing-mode={mode}
      className={cn('@container', params?.styles)}
      {...(titleField?.value ? { 'aria-labelledby': `${sectionId}-title` } : {})}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            {(titleField?.value || isEditing) && (
              <Text
                tag="h2"
                id={`${sectionId}-title`}
                field={titleField || { value: '' }}
                className="text-foreground text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
              />
            )}
            {(descriptionField?.value || isEditing) && (
              <Text
                tag="p"
                field={descriptionField || { value: '' }}
                className="text-muted-foreground mt-3 max-w-2xl text-pretty text-base leading-relaxed"
              />
            )}
          </div>
          <ModeBadge mode={mode} />
        </div>

        {loading ? (
          <div className="border-border bg-muted/20 text-muted-foreground rounded-2xl border border-dashed p-6 text-sm">
            Loading knowledge articles…
          </div>
        ) : articles.length === 0 ? (
          <KnowledgeListingEmpty mode={mode} isEditing={isEditing} />
        ) : view === 'card' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <CardItem key={article.id} article={article} />
            ))}
          </div>
        ) : view === 'list' ? (
          <ul className="border-border divide-border rounded-2xl border px-4 sm:px-6">
            {articles.map((article) => (
              <ListItem key={article.id} article={article} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col gap-4">
            {articles.map((article) => (
              <DetailItem key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** Default = Card View */
export const Default: React.FC<KnowledgeListingProps> = (props) => (
  <KnowledgeListingView props={props} view="card" />
);

export const ListView: React.FC<KnowledgeListingProps> = (props) => (
  <KnowledgeListingView props={props} view="list" />
);

export const DetailView: React.FC<KnowledgeListingProps> = (props) => (
  <KnowledgeListingView props={props} view="detail" />
);
