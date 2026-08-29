'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileMenu } from './MobileMenuWrapper';

export type CascadeLinkItem = {
  id: string;
  text: string;
  href: string;
  external?: boolean;
};

export type CascadeSecondaryGroup = {
  title: string;
  links: CascadeLinkItem[];
};

export type CascadeL1Item = {
  id: string;
  title: string;
  href?: string;
  primaryLinks: CascadeLinkItem[];
  secondaryGroups: CascadeSecondaryGroup[];
};

type MegaMenuCascadeContextValue = {
  enabled: boolean;
  registerL1: (item: Pick<CascadeL1Item, 'id' | 'title' | 'href'>) => void;
  unregisterL1: (id: string) => void;
  setL1PrimaryLinks: (l1Id: string, links: CascadeLinkItem[]) => void;
  addL1SecondaryGroup: (l1Id: string, group: CascadeSecondaryGroup) => void;
};

const MegaMenuCascadeContext = createContext<MegaMenuCascadeContextValue | null>(null);
const CascadeL1ScopeContext = createContext<string | null>(null);

export function useMegaMenuCascade() {
  return useContext(MegaMenuCascadeContext);
}

export function useMegaMenuCascadeL1Scope() {
  return useContext(CascadeL1ScopeContext);
}

export function MegaMenuCascadeProvider({
  children,
  enabled = true,
}: {
  children: ReactNode;
  enabled?: boolean;
}) {
  const [l1Map, setL1Map] = useState<Map<string, CascadeL1Item>>(new Map());

  const registerL1 = useCallback((item: Pick<CascadeL1Item, 'id' | 'title' | 'href'>) => {
    setL1Map((prev) => {
      const next = new Map(prev);
      const existing = next.get(item.id);
      next.set(item.id, {
        id: item.id,
        title: item.title,
        href: item.href,
        primaryLinks: existing?.primaryLinks ?? [],
        secondaryGroups: existing?.secondaryGroups ?? [],
      });
      return next;
    });
  }, []);

  const upsertL1Links = useCallback(
    (
      l1Id: string,
      updater: (existing: CascadeL1Item | undefined) => Partial<
        Pick<CascadeL1Item, 'primaryLinks' | 'secondaryGroups'>
      >
    ) => {
      setL1Map((prev) => {
        const existing = prev.get(l1Id);
        const patch = updater(existing);
        const next = new Map(prev);
        next.set(l1Id, {
          id: l1Id,
          title: existing?.title ?? '',
          href: existing?.href,
          primaryLinks: patch.primaryLinks ?? existing?.primaryLinks ?? [],
          secondaryGroups: patch.secondaryGroups ?? existing?.secondaryGroups ?? [],
        });
        return next;
      });
    },
    []
  );

  const unregisterL1 = useCallback((id: string) => {
    setL1Map((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const setL1PrimaryLinks = useCallback(
    (l1Id: string, links: CascadeLinkItem[]) => {
      upsertL1Links(l1Id, () => ({ primaryLinks: links }));
    },
    [upsertL1Links]
  );

  const addL1SecondaryGroup = useCallback(
    (l1Id: string, group: CascadeSecondaryGroup) => {
      upsertL1Links(l1Id, (existing) => {
        const filtered = (existing?.secondaryGroups ?? []).filter((g) => g.title !== group.title);
        return { secondaryGroups: [...filtered, group] };
      });
    },
    [upsertL1Links]
  );

  const value = useMemo(
    () => ({
      enabled,
      registerL1,
      unregisterL1,
      setL1PrimaryLinks,
      addL1SecondaryGroup,
    }),
    [enabled, registerL1, unregisterL1, setL1PrimaryLinks, addL1SecondaryGroup]
  );

  return (
    <MegaMenuCascadeContext.Provider value={value}>
      {children}
      {enabled ? <MegaMenuCascadePanel l1Map={l1Map} /> : null}
    </MegaMenuCascadeContext.Provider>
  );
}

export function MegaMenuCascadeL1Scope({
  id,
  title,
  href,
  isPageEditing = false,
  children,
}: {
  id: string;
  title: string;
  href?: string;
  isPageEditing?: boolean;
  children: ReactNode;
}) {
  const cascade = useMegaMenuCascade();

  useEffect(() => {
    if (!cascade?.enabled) return;
    cascade.registerL1({ id, title, href });
    return () => cascade.unregisterL1(id);
  }, [cascade, id, title, href]);

  if (!cascade?.enabled) {
    return <>{children}</>;
  }

  return (
    <CascadeL1ScopeContext.Provider value={id}>
      <div
        data-mega-cascade-l1={id}
        className={cn(
          isPageEditing
            ? 'border border-dashed border-white/25 p-2 [&_ul]:m-0 [&_ul]:list-none [&_ul]:p-0'
            : 'hidden'
        )}
        aria-hidden={!isPageEditing}
      >
        {children}
      </div>
    </CascadeL1ScopeContext.Provider>
  );
}

const cascadeLinkClass =
  'flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[0.9375rem] font-normal tracking-[0.02em] text-[color:var(--color-header-foreground,var(--color-background))] hover:bg-white/10';

function CascadeNavLink({
  item,
  className,
  onNavigate,
}: {
  item: CascadeLinkItem;
  className?: string;
  onNavigate?: () => void;
}) {
  const linkClass = cn(cascadeLinkClass, className);

  if (item.external || /^https?:\/\//i.test(item.href)) {
    return (
      <a
        href={item.href}
        className={linkClass}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
      >
        <span>{item.text}</span>
      </a>
    );
  }

  return (
    <Link href={item.href} prefetch={false} className={linkClass} onClick={onNavigate}>
      <span>{item.text}</span>
    </Link>
  );
}

function MegaMenuCascadePanel({ l1Map }: { l1Map: Map<string, CascadeL1Item> }) {
  const mobileMenu = useMobileMenu();
  const [activeL1Id, setActiveL1Id] = useState<string | null>(null);
  const [activeL2Key, setActiveL2Key] = useState<string | null>(null);

  const l1Items = useMemo(() => Array.from(l1Map.values()), [l1Map]);
  const activeL1 = activeL1Id ? l1Map.get(activeL1Id) : undefined;

  useEffect(() => {
    if (!mobileMenu?.isVisible) {
      setActiveL1Id(null);
      setActiveL2Key(null);
    }
  }, [mobileMenu?.isVisible]);

  useEffect(() => {
    setActiveL2Key(null);
  }, [activeL1Id]);

  if (!mobileMenu?.isVisible) {
    return null;
  }

  const closeMenu = () => mobileMenu.setIsVisible(false);

  const findSecondaryGroup = (l1: CascadeL1Item, l2Text: string) =>
    l1.secondaryGroups.find(
      (group) => group.title.trim().toLowerCase() === l2Text.trim().toLowerCase()
    );

  const activeL3Group =
    activeL1 && activeL2Key ? findSecondaryGroup(activeL1, activeL2Key) : undefined;

  const l3Split =
    activeL3Group && activeL3Group.links.length > 6
      ? {
          left: activeL3Group.links.slice(0, Math.ceil(activeL3Group.links.length / 2)),
          right: activeL3Group.links.slice(Math.ceil(activeL3Group.links.length / 2)),
        }
      : null;

  return (
    <div
      data-mega-cascade-panel
      className="absolute inset-0 z-10 flex flex-col bg-[color-mix(in_srgb,var(--color-header-background,var(--color-foreground))_92%,black)] text-[color:var(--color-header-foreground,var(--color-background))]"
    >
      <div className="flex items-center justify-end px-4 py-3">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-[color:var(--color-header-foreground,var(--color-background))] hover:bg-white/10"
          aria-label="Close menu"
          onClick={closeMenu}
        >
          <X className="h-5 w-5" strokeWidth={2} aria-hidden />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 overflow-x-auto overflow-y-auto">
        <nav aria-label="Primary navigation" className="min-w-[12rem] shrink-0 border-r border-white/10">
          <ul className="m-0 list-none p-0">
            {l1Items.map((item) => {
              const hasChildren = item.primaryLinks.length > 0;
              const isActive = activeL1Id === item.id;

              return (
                <li key={item.id}>
                  {hasChildren ? (
                    <button
                      type="button"
                      className={cn(
                        cascadeLinkClass,
                        'w-full',
                        isActive && 'bg-white/10 font-semibold'
                      )}
                      aria-expanded={isActive}
                      onClick={() => setActiveL1Id(item.id)}
                    >
                      <span>{item.title}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                    </button>
                  ) : item.href ? (
                    <CascadeNavLink
                      item={{
                        id: item.id,
                        text: item.title,
                        href: item.href,
                      }}
                      onNavigate={closeMenu}
                    />
                  ) : (
                    <span className={cn(cascadeLinkClass, 'opacity-60')}>{item.title}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {activeL1 && activeL1.primaryLinks.length > 0 ? (
          <nav aria-label={`${activeL1.title} navigation`} className="min-w-[14rem] shrink-0 border-r border-white/10">
            <ul className="m-0 list-none p-0">
              {activeL1.primaryLinks.map((link) => {
                const secondary = findSecondaryGroup(activeL1, link.text);
                const isActive = activeL2Key === link.text;

                if (secondary) {
                  return (
                    <li key={link.id}>
                      <button
                        type="button"
                        className={cn(
                          cascadeLinkClass,
                          'w-full',
                          isActive && 'bg-white/10 font-semibold'
                        )}
                        aria-expanded={isActive}
                        onClick={() => setActiveL2Key(link.text)}
                      >
                        <span>{link.text}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={link.id}>
                    <CascadeNavLink item={link} onNavigate={closeMenu} />
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}

        {activeL3Group ? (
          <nav
            aria-label={`${activeL2Key} navigation`}
            className="min-w-[14rem] shrink-0"
          >
            {l3Split ? (
              <div className="flex min-w-[28rem]">
                <ul className="m-0 min-w-[14rem] list-none p-0">
                  {l3Split.left.map((link) => (
                    <li key={link.id}>
                      <CascadeNavLink item={link} onNavigate={closeMenu} />
                    </li>
                  ))}
                </ul>
                <ul className="m-0 min-w-[14rem] list-none p-0">
                  {l3Split.right.map((link) => (
                    <li key={link.id}>
                      <CascadeNavLink item={link} onNavigate={closeMenu} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ul className="m-0 list-none p-0">
                {activeL3Group.links.map((link) => (
                  <li key={link.id}>
                    <CascadeNavLink item={link} onNavigate={closeMenu} />
                  </li>
                ))}
              </ul>
            )}
          </nav>
        ) : null}
      </div>
    </div>
  );
}
