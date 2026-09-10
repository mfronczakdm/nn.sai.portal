'use client';

import type { Dictionary } from '@/lib/i18n/dictionary';

type LobbyDirectionsMapProps = {
  dictionary: Dictionary;
  clinicLabel: string;
};

export function LobbyDirectionsMap({ dictionary, clinicLabel }: LobbyDirectionsMapProps) {
  const destination = clinicLabel || dictionary.clinic;

  return (
    <svg
      viewBox="0 0 1100 620"
      className="h-auto w-full"
      role="img"
      aria-label={`${dictionary.directionsTitle}: ${dictionary.youAreHere} → ${destination}`}
    >
      <rect width="1100" height="620" rx="28" fill="#0A3D62" />
      <rect x="16" y="16" width="1068" height="588" rx="20" fill="#F4F7F8" />

      <rect x="40" y="48" width="280" height="524" rx="16" fill="#d9e6ec" />
      <text x="180" y="88" textAnchor="middle" fill="#0A3D62" fontSize="22" fontWeight="700">
        {dictionary.mainLobby}
      </text>

      <rect x="70" y="420" width="220" height="120" rx="12" fill="#0E8A8A" />
      <text x="180" y="478" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="700">
        {dictionary.youAreHere}
      </text>
      <text x="180" y="508" textAnchor="middle" fill="#d7f6f6" fontSize="16">
        {dictionary.kioskLabel}
      </text>

      <rect x="88" y="140" width="184" height="88" rx="12" fill="#ffffff" stroke="#0A3D62" strokeWidth="3" />
      <text x="180" y="192" textAnchor="middle" fill="#0A3D62" fontSize="18" fontWeight="600">
        {dictionary.informationDesk}
      </text>

      <rect x="360" y="48" width="420" height="524" rx="16" fill="#eef4f6" />
      <rect x="390" y="80" width="360" height="70" rx="12" fill="#ffffff" stroke="#4A5C64" strokeWidth="2" />
      <text x="570" y="124" textAnchor="middle" fill="#4A5C64" fontSize="18">
        Café
      </text>

      <rect x="390" y="390" width="160" height="150" rx="12" fill="#ffffff" stroke="#0A3D62" strokeWidth="3" />
      <text x="470" y="475" textAnchor="middle" fill="#0A3D62" fontSize="18" fontWeight="600">
        {dictionary.elevators}
      </text>

      <rect x="580" y="390" width="160" height="150" rx="12" fill="#ffffff" stroke="#4A5C64" strokeWidth="2" />
      <text x="660" y="475" textAnchor="middle" fill="#4A5C64" fontSize="18">
        Imaging
      </text>

      <rect x="820" y="48" width="240" height="524" rx="16" fill="#d5efe8" />
      <rect x="848" y="210" width="184" height="200" rx="16" fill="#00A74D" />
      <text x="940" y="292" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="700">
        {dictionary.destinationLabel}
      </text>
      <foreignObject x="860" y="310" width="160" height="80">
        <p className="m-0 text-center text-base font-semibold leading-snug text-white">{destination}</p>
      </foreignObject>

      <path
        className="kiosk-route-path"
        d="M180 420 V 250 H 470 V 465 H 820 V 310"
        fill="none"
        stroke="#00A74D"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g className="kiosk-pin-pulse">
        <circle cx="180" cy="420" r="22" fill="#0A3D62" />
        <circle cx="180" cy="420" r="10" fill="#ffffff" />
      </g>
      <circle cx="940" cy="310" r="22" fill="#06263D" />
      <circle cx="940" cy="310" r="10" fill="#ffffff" />
    </svg>
  );
}
