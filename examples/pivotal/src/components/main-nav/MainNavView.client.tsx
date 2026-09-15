'use client';

import type React from 'react';
import { useEffect, useId, useState } from 'react';
import {
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  Text,
  useSitecore,
  type ImageField,
  type LinkField,
  type TextField,
} from '@sitecore-content-sdk/nextjs';
import { Menu, Search, ShoppingCart, User } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

import type {
  MainNavProps,
  MainNavSupportLink,
  MainNavTreeNode,
} from './main-nav.props';
import { extractNavigationRootId } from '@/lib/main-nav-utils';

function textValue(field?: { value?: unknown } | null): string {
  return typeof field?.value === 'string' ? field.value.trim() : '';
}

function gqlText(field?: { jsonValue?: TextField } | null): string {
  return textValue(field?.jsonValue);
}

function isChecked(field?: { jsonValue?: { value?: unknown } } | null): boolean {
  const value = field?.jsonValue?.value;
  return value === true || value === '1' || value === 'true';
}

function linkHasHref(field?: LinkField | null): boolean {
  return Boolean(field?.value?.href);
}

function imageHasSrc(field?: ImageField | null): boolean {
  return Boolean(field?.value?.src);
}

function parseLevel(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function nodeHref(node: MainNavTreeNode): string {
  const fromUrl = node.url?.path?.trim();
  if (fromUrl) return fromUrl.startsWith('/') ? fromUrl : `/${fromUrl}`;
  return '#';
}

function nodeTitle(node: MainNavTreeNode): string {
  return gqlText(node.navigationTitle) || gqlText(node.title) || gqlText(node.pageTitle) || node.name || '';
}

function nodeChildren(node?: MainNavTreeNode | null): MainNavTreeNode[] {
  const results = node?.children?.results;
  return Array.isArray(results) ? results.filter(Boolean) : [];
}

function sliceFromStart(nodes: MainNavTreeNode[], startLevel: number, currentLevel = 1): MainNavTreeNode[] {
  if (startLevel <= currentLevel) return nodes;
  return nodes.flatMap((node) => sliceFromStart(nodeChildren(node), startLevel, currentLevel + 1));
}

function trimToEnd(nodes: MainNavTreeNode[], remainingDepth: number): MainNavTreeNode[] {
  if (remainingDepth <= 1) {
    return nodes.map((node) => ({ ...node, children: { results: [] } }));
  }
  return nodes.map((node) => ({
    ...node,
    children: { results: trimToEnd(nodeChildren(node), remainingDepth - 1) },
  }));
}

function MainNavEmpty(): React.JSX.Element {
  return <NoDataFallback componentName="MainNav" />;
}

function UtilityLink({
  field,
  labelField,
  icon,
  isEditing,
}: {
  field?: LinkField;
  labelField?: TextField;
  icon: React.ReactNode;
  isEditing: boolean;
}): React.JSX.Element | null {
  if (!field || !linkHasHref(field)) return null;
  return (
    <ContentSdkLink
      field={field}
      prefetch={false}
      className="inline-flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:text-primary"
    >
      {icon}
      {(gqlText({ jsonValue: labelField }) || isEditing) && labelField ? (
        <Text field={labelField} tag="span" />
      ) : null}
    </ContentSdkLink>
  );
}

function MegaColumns({
  items,
  maxColumns,
  remainingDepth,
}: {
  items: MainNavTreeNode[];
  maxColumns: number;
  remainingDepth: number;
}): React.JSX.Element {
  const columns = items.slice(0, Math.max(1, maxColumns));
  return (
    <div
      className="grid gap-6"
      style={{ gridTemplateColumns: `repeat(${Math.min(columns.length, maxColumns)}, minmax(0, 1fr))` }}
    >
      {columns.map((column) => {
        const href = nodeHref(column);
        const title = nodeTitle(column);
        const nested = remainingDepth > 1 ? nodeChildren(column) : [];
        return (
          <div key={column.id || title} className="min-w-0">
            {href !== '#' ? (
              <a href={href} className="mb-2 block text-sm font-semibold text-foreground hover:text-primary">
                {title}
              </a>
            ) : (
              <p className="mb-2 text-sm font-semibold text-foreground">{title}</p>
            )}
            {nested.length > 0 && (
              <ul className="space-y-1">
                {nested.map((child) => {
                  const childHref = nodeHref(child);
                  const childTitle = nodeTitle(child);
                  const l4 = remainingDepth > 2 ? nodeChildren(child) : [];
                  return (
                    <li key={child.id || childTitle}>
                      {childHref !== '#' ? (
                        <a href={childHref} className="block py-0.5 text-sm text-muted-foreground hover:text-primary">
                          {childTitle}
                        </a>
                      ) : (
                        <span className="block py-0.5 text-sm text-muted-foreground">{childTitle}</span>
                      )}
                      {l4.length > 0 && (
                        <ul className="mt-1 space-y-1 border-l border-border pl-3">
                          {l4.map((leaf) => {
                            const leafHref = nodeHref(leaf);
                            const leafTitle = nodeTitle(leaf);
                            return (
                              <li key={leaf.id || leafTitle}>
                                {leafHref !== '#' ? (
                                  <a
                                    href={leafHref}
                                    className="block py-0.5 text-xs text-muted-foreground hover:text-primary"
                                  >
                                    {leafTitle}
                                  </a>
                                ) : (
                                  <span className="block py-0.5 text-xs text-muted-foreground">{leafTitle}</span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DesktopMegaNav({
  items,
  maxColumns,
  remainingDepth,
}: {
  items: MainNavTreeNode[];
  maxColumns: number;
  remainingDepth: number;
}): React.JSX.Element {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ul className="flex min-w-0 flex-1 list-none flex-wrap items-stretch gap-1" role="menubar">
      {items.map((item) => {
        const id = item.id || nodeTitle(item);
        const href = nodeHref(item);
        const title = nodeTitle(item);
        const children = remainingDepth > 1 ? nodeChildren(item) : [];
        const isOpen = openId === id;
        return (
          <li
            key={id}
            className="relative"
            onMouseEnter={() => children.length > 0 && setOpenId(id)}
            onMouseLeave={() => setOpenId(null)}
          >
            {children.length > 0 ? (
              <button
                type="button"
                className="inline-flex h-full items-center px-3 py-3 text-sm font-medium text-foreground hover:text-primary"
                aria-expanded={isOpen}
                aria-haspopup="true"
                onFocus={() => setOpenId(id)}
              >
                {title}
              </button>
            ) : href !== '#' ? (
              <a href={href} className="inline-flex h-full items-center px-3 py-3 text-sm font-medium text-foreground hover:text-primary">
                {title}
              </a>
            ) : (
              <span className="inline-flex h-full items-center px-3 py-3 text-sm font-medium text-foreground">{title}</span>
            )}
            {children.length > 0 && isOpen && (
              <div className="absolute left-0 top-full z-40 min-w-[36rem] rounded-2xl border border-border bg-background p-6 shadow-lg">
                <MegaColumns items={children} maxColumns={maxColumns} remainingDepth={remainingDepth - 1} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function MobileAccordionNav({
  items,
  remainingDepth,
}: {
  items: MainNavTreeNode[];
  remainingDepth: number;
}): React.JSX.Element {
  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item) => {
        const id = item.id || nodeTitle(item);
        const href = nodeHref(item);
        const title = nodeTitle(item);
        const children = remainingDepth > 1 ? nodeChildren(item) : [];
        if (children.length === 0) {
          return href !== '#' ? (
            <a key={id} href={href} className="block border-b border-border py-3 text-sm font-medium text-foreground">
              {title}
            </a>
          ) : (
            <p key={id} className="border-b border-border py-3 text-sm font-medium text-foreground">
              {title}
            </p>
          );
        }
        return (
          <AccordionItem key={id} value={id} className="border-border">
            <AccordionTrigger className="text-sm text-foreground">{title}</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 pb-2">
                {children.map((child) => {
                  const childHref = nodeHref(child);
                  const childTitle = nodeTitle(child);
                  const nested = remainingDepth > 2 ? nodeChildren(child) : [];
                  return (
                    <li key={child.id || childTitle}>
                      {childHref !== '#' ? (
                        <a href={childHref} className="block py-1 text-sm text-muted-foreground hover:text-primary">
                          {childTitle}
                        </a>
                      ) : (
                        <span className="block py-1 text-sm text-muted-foreground">{childTitle}</span>
                      )}
                      {nested.length > 0 && (
                        <ul className="mt-1 space-y-1 pl-3">
                          {nested.map((leaf) => {
                            const leafHref = nodeHref(leaf);
                            const leafTitle = nodeTitle(leaf);
                            return (
                              <li key={leaf.id || leafTitle}>
                                {leafHref !== '#' ? (
                                  <a href={leafHref} className="block py-0.5 text-xs text-muted-foreground hover:text-primary">
                                    {leafTitle}
                                  </a>
                                ) : (
                                  <span className="block py-0.5 text-xs text-muted-foreground">{leafTitle}</span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

export function MainNavView(props: MainNavProps): React.JSX.Element {
  const { fields, params } = props;
  const { page } = useSitecore() || {};
  const isEditing = Boolean(props.isPageEditing || page?.mode?.isEditing);
  const datasource = fields?.data?.datasource;
  const menuId = useId();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fetchedRoot, setFetchedRoot] = useState<MainNavTreeNode | undefined>(
    datasource?.navigationRoot?.targetItem
  );

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    const existing = datasource?.navigationRoot?.targetItem;
    if (existing?.children?.results?.length) {
      setFetchedRoot(existing);
      return;
    }
    const rootId = extractNavigationRootId(datasource?.navigationRoot);
    if (!rootId) return;
    const language =
      (page?.layout?.sitecore?.context as { language?: string } | undefined)?.language || 'en';
    const controller = new AbortController();
    fetch(`/api/main-nav?path=${encodeURIComponent(rootId)}&language=${encodeURIComponent(language)}`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : { tree: null }))
      .then((payload: { tree?: MainNavTreeNode | null }) => {
        if (payload?.tree) setFetchedRoot(payload.tree);
      })
      .catch((error: unknown) => {
        if ((error as { name?: string })?.name !== 'AbortError') {
          console.error('[MainNav] failed to load navigation tree', error);
        }
      });
    return () => controller.abort();
  }, [datasource?.navigationRoot, page?.layout?.sitecore?.context]);

  if (!datasource) {
    return <MainNavEmpty />;
  }

  const startLevel = parseLevel(params?.StartLevel, 1, 1, 4);
  const endLevel = parseLevel(params?.EndLevel, 3, startLevel, 4);
  const maxColumns = parseLevel(params?.MaxColumns, 4, 1, 6);
  const remainingDepth = endLevel - startLevel + 1;

  const rootChildren = nodeChildren(fetchedRoot);
  const navItems = trimToEnd(sliceFromStart(rootChildren, startLevel), remainingDepth);

  const logo = datasource.logo?.jsonValue;
  const logoLink = datasource.logoLink?.jsonValue;
  const searchPage = datasource.searchPage?.jsonValue;
  const searchLabel = datasource.searchLabel?.jsonValue;
  const userLink = datasource.userLink?.jsonValue;
  const userLabel = datasource.userLabel?.jsonValue;
  const cartLink = datasource.cartLink?.jsonValue;
  const cartLabel = datasource.cartLabel?.jsonValue;
  const showCart = isChecked(datasource.showCart);
  const supportResults = datasource.children?.results;
  const supportLinks = (Array.isArray(supportResults) ? supportResults : []).filter(
    (item: MainNavSupportLink) => Boolean(item?.linkUrl?.jsonValue) && linkHasHref(item.linkUrl?.jsonValue)
  );

  const showSearch = Boolean(searchPage && linkHasHref(searchPage));
  const showUser = Boolean(userLink && linkHasHref(userLink));
  const showCartLink = Boolean(showCart && cartLink && linkHasHref(cartLink));

  return (
    <header
      className={cn(
        'sticky top-0 z-30 w-full border-b border-border/30 bg-background shadow-sm',
        params?.styles
      )}
      id={params?.RenderingIdentifier}
      data-class-change
    >
      <div className="mx-auto flex w-full max-w-[100rem] flex-col">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center">
            {logo && (imageHasSrc(logo) || isEditing) ? (
              logoLink && (linkHasHref(logoLink) || isEditing) ? (
                <ContentSdkLink field={logoLink} prefetch={false} className="inline-flex items-center">
                  <ContentSdkImage
                    field={logo}
                    className="h-10 w-auto max-w-[220px] object-contain sm:h-12"
                  />
                </ContentSdkLink>
              ) : (
                <ContentSdkImage field={logo} className="h-10 w-auto max-w-[220px] object-contain sm:h-12" />
              )
            ) : null}
          </div>
          <div className="flex items-center justify-end gap-1">
            {showSearch && searchPage && (
              <UtilityLink field={searchPage} labelField={searchLabel} icon={<Search className="h-4 w-4" />} isEditing={isEditing} />
            )}
            {showUser && userLink && (
              <UtilityLink field={userLink} labelField={userLabel} icon={<User className="h-4 w-4" />} isEditing={isEditing} />
            )}
            {showCartLink && cartLink && (
              <UtilityLink field={cartLink} labelField={cartLabel} icon={<ShoppingCart className="h-4 w-4" />} isEditing={isEditing} />
            )}
            {supportLinks.map((item) =>
              item.linkUrl?.jsonValue ? (
                <ContentSdkLink
                  key={item.id}
                  field={item.linkUrl.jsonValue}
                  prefetch={false}
                  className="hidden px-2 py-2 text-sm text-foreground hover:text-primary lg:inline-flex"
                >
                  {item.linkText?.jsonValue ? <Text field={item.linkText.jsonValue} tag="span" /> : null}
                </ContentSdkLink>
              ) : null
            )}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-expanded={mobileOpen}
                  aria-controls={menuId}
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col gap-6 overflow-y-auto bg-background" id={menuId}>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <MobileAccordionNav items={navItems} remainingDepth={remainingDepth} />
                <div className="flex flex-col gap-2 border-t border-border pt-4">
                  {supportLinks.map((item) =>
                    item.linkUrl?.jsonValue ? (
                      <ContentSdkLink
                        key={item.id}
                        field={item.linkUrl.jsonValue}
                        prefetch={false}
                        className="text-sm text-foreground hover:text-primary"
                      >
                        {item.linkText?.jsonValue ? <Text field={item.linkText.jsonValue} tag="span" /> : null}
                      </ContentSdkLink>
                    ) : null
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <nav className="border-t border-border/40 px-4 sm:px-6 lg:px-8" aria-label="Primary">
          {navItems.length > 0 ? (
            <DesktopMegaNav items={navItems} maxColumns={maxColumns} remainingDepth={remainingDepth} />
          ) : isEditing ? (
            <p className="py-3 text-sm text-muted-foreground">
              No navigation items. Set NavigationRoot to Home and publish that tree to Edge.
            </p>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

