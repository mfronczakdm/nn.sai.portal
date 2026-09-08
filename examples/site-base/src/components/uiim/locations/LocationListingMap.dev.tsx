'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import {
  buildOsmView,
  osmTileUrl,
  OSM_TILE_SIZE,
  type GeoPoint,
} from '@/lib/location-listing-map.utils';

export type LocationListingMapItem = GeoPoint & {
  name: string;
  locationType: string;
  address: string;
  href: string;
};

type LocationListingMapProps = {
  locations: LocationListingMapItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
};

const MAP_HEIGHT = 420;

export function LocationListingMap({ locations, selectedId, onSelect }: LocationListingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateWidth = () => {
      setWidth(Math.max(1, Math.round(element.clientWidth)));
    };
    updateWidth();

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const view = useMemo(
    () => buildOsmView(locations, width, MAP_HEIGHT),
    [locations, width]
  );
  const selected = locations.find((location) => location.id === selectedId);
  const selectedPin = view?.pins.find((pin) => pin.id === selectedId);

  if (!locations.length) {
    return (
      <div
        className="bg-muted text-muted-foreground flex h-[280px] items-center justify-center rounded-2xl border text-sm md:h-[420px]"
        data-testid="location-listing-map-empty"
      >
        No mapped locations with latitude and longitude.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-[280px] w-full overflow-hidden rounded-2xl border bg-[#c9dceb] shadow-sm md:h-[420px]"
      data-testid="location-listing-map"
    >
      {view && (
        <div className="absolute inset-0" style={{ width: view.width, height: view.height }}>
          {view.tiles.map((tile) => (
            <img
              key={`${tile.z}-${tile.x}-${tile.y}-${tile.left}-${tile.top}`}
              src={osmTileUrl(tile.z, tile.x, tile.y)}
              alt=""
              width={OSM_TILE_SIZE}
              height={OSM_TILE_SIZE}
              draggable={false}
              className="pointer-events-none absolute max-w-none"
              style={{ left: tile.left, top: tile.top }}
            />
          ))}
          {view.pins.map((pin) => {
            const location = locations.find((item) => item.id === pin.id);
            const isSelected = pin.id === selectedId;
            const isUrgent = (location?.locationType || '').toLowerCase().includes('urgent');
            return (
              <button
                key={pin.id}
                type="button"
                aria-label={location?.name || 'Location'}
                aria-pressed={isSelected}
                onClick={() => onSelect(pin.id)}
                className="absolute -translate-x-1/2 -translate-y-full"
                style={{ left: pin.left, top: pin.top }}
              >
                <span
                  className={cn(
                    'block h-7 w-5 drop-shadow-md transition-transform',
                    isSelected && 'scale-125'
                  )}
                  aria-hidden
                >
                  <svg viewBox="0 0 20 28" className="h-7 w-5">
                    <path
                      d="M10 27C7 22.5 2 16 2 10.5A8 8 0 1 1 18 10.5C18 16 13 22.5 10 27z"
                      fill={isUrgent ? '#0f766e' : '#1d4ed8'}
                      stroke="#ffffff"
                      strokeWidth="1.4"
                    />
                    <circle cx="10" cy="10.5" r="3" fill="#ffffff" />
                  </svg>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {selected && selectedPin && (
        <div
          className="bg-background absolute z-10 max-w-[16rem] rounded-lg border p-3 text-left shadow-lg"
          style={{
            left: Math.min(Math.max(selectedPin.left, 88), width - 88),
            top: Math.max(selectedPin.top - 8, 12),
            transform: 'translate(-50%, -100%)',
          }}
          data-testid="location-listing-map-popup"
        >
          <p className="text-foreground text-sm font-semibold">{selected.name}</p>
          {selected.locationType && (
            <p className="text-muted-foreground text-xs">{selected.locationType}</p>
          )}
          {selected.address && <p className="text-muted-foreground mt-1 text-xs">{selected.address}</p>}
          {selected.href && (
            <a href={selected.href} className="text-primary mt-2 inline-block text-xs font-medium hover:underline">
              View location
            </a>
          )}
        </div>
      )}

      <p className="bg-background/90 text-muted-foreground absolute bottom-2 left-2 rounded px-2 py-1 text-[10px]">
        ©{' '}
        <a
          href="https://www.openstreetmap.org/copyright"
          className="underline"
          target="_blank"
          rel="noreferrer"
        >
          OpenStreetMap
        </a>{' '}
        contributors
      </p>
    </div>
  );
}
