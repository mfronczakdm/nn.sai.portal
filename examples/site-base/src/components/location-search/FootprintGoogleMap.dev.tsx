'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect, useState } from 'react';
import {
  createFootprintPinIcon,
  type FootprintMapPoint,
} from './location-footprint.utils';

declare global {
  interface Window {
    google: any;
    initFootprintMap: () => void;
  }
}

export type FootprintGoogleMapProps = {
  apiKey: string;
  locations: FootprintMapPoint[];
};

export const FootprintGoogleMap = ({ apiKey, locations }: FootprintGoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (window.google) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initFootprintMap`;
    script.async = true;
    script.defer = true;

    window.initFootprintMap = () => {
      setIsLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      window.initFootprintMap = () => {};
      document.head.removeChild(script);
    };
  }, [apiKey]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const mapOptions = {
      center: { lat: 20, lng: 10 },
      zoom: 2,
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'administrative',
          elementType: 'all',
          stylers: [{ saturation: '-100' }],
        },
        {
          featureType: 'landscape',
          elementType: 'all',
          stylers: [{ saturation: -100 }, { lightness: 65 }, { visibility: 'on' }],
        },
        {
          featureType: 'poi',
          elementType: 'all',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'road',
          elementType: 'all',
          stylers: [{ saturation: '-100' }],
        },
        {
          featureType: 'transit',
          elementType: 'all',
          stylers: [{ saturation: -100 }, { visibility: 'simplified' }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ hue: '#ffff00' }, { lightness: -25 }, { saturation: -97 }],
        },
      ],
    };

    const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
    setMap(newMap);
  }, [isLoaded]);

  useEffect(() => {
    if (!map || locations.length === 0) return;

    const markers = locations.map((location) => {
      const marker = new window.google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map,
        title: location.name,
        icon: {
          url: createFootprintPinIcon(location.pinType),
          scaledSize: new window.google.maps.Size(28, 36),
          anchor: new window.google.maps.Point(14, 36),
        },
      });

      return marker;
    });

    return () => {
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [map, locations]);

  return (
    <div ref={mapRef} className="h-full w-full">
      {!isLoaded && (
        <div className="flex h-full w-full items-center justify-center bg-gray-100">
          <div className="text-lg font-medium text-gray-600">Loading map...</div>
        </div>
      )}
    </div>
  );
};
