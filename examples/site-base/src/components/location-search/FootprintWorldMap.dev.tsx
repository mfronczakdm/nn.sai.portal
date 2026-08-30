'use client';

import { FOOTPRINT_PIN_COLORS, latLngToMapPercent, type FootprintMapPoint } from './location-footprint.utils';

type FootprintWorldMapProps = {
  locations: FootprintMapPoint[];
};

/**
 * Street-free political globe used when Google Maps is unavailable (no API key).
 * Land/water only — pins are projected with Mercator.
 */
export const FootprintWorldMap = ({ locations }: FootprintWorldMapProps) => {
  return (
    <div
      className="relative h-full w-full overflow-hidden bg-[#b8d4e8]"
      data-testid="footprint-world-map"
    >
      <svg
        viewBox="0 0 1000 500"
        className="h-full w-full"
        aria-hidden
        preserveAspectRatio="xMidYMid slice"
      >
        <rect width="1000" height="500" fill="#b8d4e8" />
        {/* Simplified land masses (political globe, not street data) */}
        <ellipse cx="220" cy="175" rx="145" ry="95" fill="#ecece6" />
        <ellipse cx="280" cy="330" rx="55" ry="95" fill="#ecece6" />
        <ellipse cx="500" cy="195" rx="70" ry="55" fill="#ecece6" />
        <ellipse cx="535" cy="280" rx="75" ry="110" fill="#ecece6" />
        <ellipse cx="680" cy="185" rx="175" ry="100" fill="#ecece6" />
        <ellipse cx="800" cy="280" rx="70" ry="45" fill="#ecece6" />
        <ellipse cx="820" cy="370" rx="50" ry="28" fill="#ecece6" />
      </svg>
      {locations.map((location) => {
        const { leftPercent, topPercent } = latLngToMapPercent(
          location.latitude,
          location.longitude
        );

        return (
          <span
            key={location.id}
            className="absolute block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white shadow-sm md:h-3.5 md:w-3.5"
            style={{
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
              backgroundColor: FOOTPRINT_PIN_COLORS[location.pinType],
            }}
            title={location.name}
          />
        );
      })}
    </div>
  );
};
