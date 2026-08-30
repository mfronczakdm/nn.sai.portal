'use client';

import type React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { FOOTPRINT_PIN_COLORS, type FootprintMapPoint } from './location-footprint.utils';
import {
  MAP_VIEW_HEIGHT,
  MAP_VIEW_WIDTH,
  buildLandPathData,
  projectToMapView,
} from './world-map.utils';

const WATER_COLOR = '#c9dceb';
const LAND_COLOR = '#e9e9e9';
const ZOOM_LEVELS = [1, 1.75, 3, 5] as const;
const PIN_SCALE = 1.4;

type FootprintGlobalMapProps = {
  locations: FootprintMapPoint[];
  className?: string;
};

/** Teardrop marker drawn at the location, anchored on its point. */
const MapPin = ({ point, scale }: { point: FootprintMapPoint; scale: number }) => {
  const { x, y } = projectToMapView(point.latitude, point.longitude);

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <title>{point.name}</title>
      <path
        d="M0 0c-3.9-5.7-9-11.6-9-17.2C-9-22.6-5-26.6 0-26.6s9 4 9 9.4C9-11.6 3.9-5.7 0 0z"
        fill={FOOTPRINT_PIN_COLORS[point.pinType]}
      />
      <circle cx="0" cy="-17.2" r="3.1" fill="#ffffff" />
    </g>
  );
};

/**
 * Google-free world footprint map: simplified Natural Earth land outlines projected with
 * Mercator, Pacific-centred, with typed pins plus zoom and pan controls.
 */
export const FootprintGlobalMap = ({ locations, className }: FootprintGlobalMapProps) => {
  const landPathData = useMemo(() => buildLandPathData(), []);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [center, setCenter] = useState({ x: MAP_VIEW_WIDTH / 2, y: MAP_VIEW_HEIGHT / 2 });
  const dragOrigin = useRef<{
    pointerX: number;
    pointerY: number;
    centerX: number;
    centerY: number;
  } | null>(null);

  const zoom = ZOOM_LEVELS[zoomIndex];
  const viewWidth = MAP_VIEW_WIDTH / zoom;
  const viewHeight = MAP_VIEW_HEIGHT / zoom;

  const clampCenter = useCallback((x: number, y: number, activeZoom: number) => {
    const halfWidth = MAP_VIEW_WIDTH / activeZoom / 2;
    const halfHeight = MAP_VIEW_HEIGHT / activeZoom / 2;

    return {
      x: Math.max(halfWidth, Math.min(MAP_VIEW_WIDTH - halfWidth, x)),
      y: Math.max(halfHeight, Math.min(MAP_VIEW_HEIGHT - halfHeight, y)),
    };
  }, []);

  const changeZoom = (nextIndex: number) => {
    const clampedIndex = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, nextIndex));
    setZoomIndex(clampedIndex);
    setCenter((previous) => clampCenter(previous.x, previous.y, ZOOM_LEVELS[clampedIndex]));
  };

  const resetView = () => {
    setZoomIndex(0);
    setCenter({ x: MAP_VIEW_WIDTH / 2, y: MAP_VIEW_HEIGHT / 2 });
  };

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (zoom === 1) return;
    dragOrigin.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      centerX: center.x,
      centerY: center.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const origin = dragOrigin.current;
    if (!origin) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const unitsPerPixelX = viewWidth / bounds.width;
    const unitsPerPixelY = viewHeight / bounds.height;

    setCenter(
      clampCenter(
        origin.centerX - (event.clientX - origin.pointerX) * unitsPerPixelX,
        origin.centerY - (event.clientY - origin.pointerY) * unitsPerPixelY,
        zoom
      )
    );
  };

  const handlePointerUp = () => {
    dragOrigin.current = null;
  };

  const viewBox = `${center.x - viewWidth / 2} ${center.y - viewHeight / 2} ${viewWidth} ${viewHeight}`;

  return (
    <div
      className={cn('relative h-full w-full overflow-hidden', className)}
      style={{ backgroundColor: WATER_COLOR }}
      data-testid="footprint-global-map"
    >
      <svg
        viewBox={viewBox}
        className={cn('h-full w-full', zoom > 1 ? 'cursor-grab active:cursor-grabbing' : '')}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="World map of corporate headquarters, factories and customer support centers"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <rect
          x={-MAP_VIEW_WIDTH}
          y={-MAP_VIEW_HEIGHT}
          width={MAP_VIEW_WIDTH * 3}
          height={MAP_VIEW_HEIGHT * 3}
          fill={WATER_COLOR}
        />
        <path d={landPathData} fill={LAND_COLOR} />
        {locations.map((location) => (
          <MapPin key={location.id} point={location} scale={PIN_SCALE / zoom} />
        ))}
      </svg>

      <div className="absolute bottom-4 right-3 flex flex-col overflow-hidden rounded-sm bg-white shadow-md">
        <button
          type="button"
          onClick={() => changeZoom(zoomIndex + 1)}
          disabled={zoomIndex === ZOOM_LEVELS.length - 1}
          aria-label="Zoom in"
          className="h-8 w-8 text-lg leading-none text-gray-700 transition-colors hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-white"
        >
          +
        </button>
        <span className="mx-auto h-px w-5 bg-gray-200" aria-hidden />
        <button
          type="button"
          onClick={() => changeZoom(zoomIndex - 1)}
          disabled={zoomIndex === 0}
          aria-label="Zoom out"
          className="h-8 w-8 text-lg leading-none text-gray-700 transition-colors hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-white"
        >
          &minus;
        </button>
      </div>

      <button
        type="button"
        onClick={resetView}
        aria-label="Reset map view"
        className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-sm bg-white text-gray-700 shadow-md transition-colors hover:bg-gray-100"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
          <path
            d="M1 5.5V1h4.5M10.5 1H15v4.5M15 10.5V15h-4.5M5.5 15H1v-4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      </button>
    </div>
  );
};
