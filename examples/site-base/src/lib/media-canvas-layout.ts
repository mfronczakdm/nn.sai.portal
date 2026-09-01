export type CollageShape = 'circle' | 'circle-sm' | 'pill-h' | 'pill-v';

const LAYOUTS: Record<number, CollageShape[]> = {
  1: ['pill-v'],
  2: ['pill-h', 'circle'],
  3: ['pill-h', 'circle', 'pill-v'],
  4: ['pill-h', 'circle-sm', 'circle', 'pill-v'],
  5: ['pill-h', 'circle-sm', 'circle', 'circle', 'pill-v'],
};

export function hashItemId(id: string): number {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Deterministic “random” order so SSR and hydration match. */
export function stableShuffle<T extends { id?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => hashItemId(a.id || '') - hashItemId(b.id || ''));
}

export function planCollageShapes(count: number): CollageShape[] {
  if (count <= 0) return [];
  if (count <= 5) return LAYOUTS[count];
  const extra: CollageShape[] = Array.from({ length: count - 5 }, (_, index) =>
    index % 2 === 0 ? 'circle' : 'pill-h'
  );
  return [...LAYOUTS[5], ...extra];
}

export function collageSlotClass(count: number, index: number): string {
  const layouts: Record<number, string[]> = {
    1: ['col-span-4 col-start-2 row-span-6'],
    2: ['col-span-4 row-span-3', 'col-span-3 col-start-4 row-span-3 row-start-4'],
    3: ['col-span-4 row-span-3', 'col-span-3 row-span-3 row-start-4', 'col-span-2 col-start-5 row-span-6'],
    4: [
      'col-span-4 row-span-3',
      'col-span-2 col-start-2 row-span-2 row-start-3 z-10',
      'col-span-3 row-span-3 row-start-4',
      'col-span-2 col-start-5 row-span-6',
    ],
    5: [
      'col-span-4 row-span-3',
      'col-span-2 col-start-2 row-span-2 row-start-3 z-10',
      'col-span-2 row-span-3 row-start-4',
      'col-span-2 col-start-3 row-span-3 row-start-4',
      'col-span-2 col-start-5 row-span-6',
    ],
  };
  const slots = layouts[Math.min(Math.max(count, 1), 5)];
  if (index < slots.length) return slots[index];
  return 'col-span-2 row-span-2';
}

export function collageShapeClass(shape: CollageShape): string {
  switch (shape) {
    case 'pill-h':
      return 'rounded-full aspect-[2.35/1]';
    case 'pill-v':
      return 'rounded-full h-full min-h-[12rem] aspect-[1/2.15]';
    case 'circle-sm':
      return 'rounded-full aspect-square w-[72%] justify-self-center self-center';
    default:
      return 'rounded-full aspect-square';
  }
}
