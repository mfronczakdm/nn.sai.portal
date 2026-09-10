import 'server-only';

import physiciansJson from './physicians.json';
import locationsJson from './locations.json';
import departmentsJson from './departments.json';
import type { DepartmentItem, LocationItem, PhysicianItem } from '../schemas';
import { DEPARTMENT_ES_OVERLAY, LOCATION_ES_OVERLAY, PHYSICIAN_ES_OVERLAY } from './overlays-es-co';
import { normalizeId } from '../../utils';
import type { KioskLocale } from '@/lib/i18n/config';

type QueryShape<T> = { item: { children: { results: T[] } } };

const englishPhysicians = physiciansJson as QueryShape<PhysicianItem>;
const englishLocations = locationsJson as QueryShape<LocationItem>;
const englishDepartments = departmentsJson as QueryShape<DepartmentItem>;

function overlayFields<T extends Record<string, unknown>>(
  item: T,
  overlay: Record<string, string> | undefined,
  aliases: Record<string, string>
): T {
  if (!overlay) return item;
  const next = { ...item };
  for (const [fieldName, value] of Object.entries(overlay)) {
    const alias = aliases[fieldName];
    if (!alias) continue;
    (next as Record<string, unknown>)[alias] = { value };
  }
  return next;
}

function overlayList<T extends { id: string }>(
  items: T[],
  overlays: Record<string, Record<string, string>>,
  aliases: Record<string, string>
): T[] {
  return items.map((item) => overlayFields(item, overlays[normalizeId(item.id)], aliases));
}

const PHYSICIAN_ALIASES = {
  PhysicianFullName: 'physicianFullName',
  Credentials: 'credentials',
  Specialty: 'specialty',
  PhysicianBio: 'physicianBio',
};

const LOCATION_ALIASES = {
  LocationTitle: 'locationTitle',
  LocationShortName: 'locationShortName',
  LocationDescription: 'locationDescription',
  HoursText: 'hoursText',
  ParkingInfo: 'parkingInfo',
  VisitorInfo: 'visitorInfo',
  LocationType: 'locationType',
  City: 'city',
};

const DEPARTMENT_ALIASES = {
  ServiceTitle: 'serviceTitle',
  ServiceShortDescription: 'serviceShortDescription',
  ServiceDetail: 'serviceDetail',
};

export function getMockPhysiciansResponse(locale: KioskLocale): QueryShape<PhysicianItem> {
  if (locale !== 'es-CO') return englishPhysicians;
  return {
    item: {
      children: {
        results: overlayList(
          englishPhysicians.item.children.results,
          PHYSICIAN_ES_OVERLAY,
          PHYSICIAN_ALIASES
        ),
      },
    },
  };
}

export function getMockLocationsResponse(locale: KioskLocale): QueryShape<LocationItem> {
  if (locale !== 'es-CO') return englishLocations;
  return {
    item: {
      children: {
        results: overlayList(
          englishLocations.item.children.results,
          LOCATION_ES_OVERLAY,
          LOCATION_ALIASES
        ),
      },
    },
  };
}

export function getMockDepartmentsResponse(locale: KioskLocale): QueryShape<DepartmentItem> {
  if (locale !== 'es-CO') return englishDepartments;
  return {
    item: {
      children: {
        results: overlayList(
          englishDepartments.item.children.results,
          DEPARTMENT_ES_OVERLAY,
          DEPARTMENT_ALIASES
        ),
      },
    },
  };
}
