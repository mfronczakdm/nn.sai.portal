import type { Department, LocationSummary, Physician } from './types';
import type { DepartmentItem, LocationItem, PhysicianItem } from './schemas';
import { departmentSlugForSpecialty } from './specialty-map';
import { fieldString, isChecked, normalizeId, parseGuidList, slugify } from '../utils';

function targetIds(
  field: { value?: string | null; targetItems?: Array<{ id: string }> | null } | null | undefined
): string[] {
  const fromTargets = (field?.targetItems ?? []).map((item) => normalizeId(item.id)).filter(Boolean);
  if (fromTargets.length) return fromTargets;
  return parseGuidList(field?.value);
}

export function mapLocation(item: LocationItem): LocationSummary {
  const title = fieldString(item.locationTitle) || item.displayName || item.name;
  const street = fieldString(item.streetAddress);
  const city = fieldString(item.city);
  const state = fieldString(item.state);
  const postalCode = fieldString(item.postalCode);
  const address = [street, [city, state].filter(Boolean).join(', '), postalCode]
    .filter(Boolean)
    .join(', ');

  return {
    id: normalizeId(item.id),
    slug: slugify(item.name),
    itemName: item.name,
    name: title,
    shortName: fieldString(item.locationShortName) || title,
    address,
    city,
    state,
    postalCode,
    phone: fieldString(item.phoneNumber),
    hours: fieldString(item.hoursText),
    parking: fieldString(item.parkingInfo),
    visitorInfoHtml: fieldString(item.visitorInfo),
    descriptionHtml: fieldString(item.locationDescription),
    locationType: fieldString(item.locationType),
    hasEmergencyDepartment: isChecked(fieldString(item.hasEmergencyDepartment)),
    serviceIds: targetIds(item.offeredServices),
    physicianIds: targetIds(item.locationPhysicians),
  };
}

export function mapPhysician(
  item: PhysicianItem,
  locationsById: Map<string, LocationSummary>
): Physician {
  const name = fieldString(item.physicianFullName) || item.displayName || item.name;
  const specialty = fieldString(item.specialty);
  const locationIds = targetIds(item.servingLocations);
  const locations = locationIds
    .map((id) => locationsById.get(id))
    .filter((location): location is LocationSummary => Boolean(location));

  return {
    id: normalizeId(item.id),
    slug: slugify(item.name),
    itemName: item.name,
    name,
    credentials: fieldString(item.credentials),
    specialty,
    bioHtml: fieldString(item.physicianBio),
    phone: fieldString(item.physicianPhone),
    photoUrl: null,
    locationIds,
    locations,
    departmentSlug: departmentSlugForSpecialty(specialty),
    departmentName: null,
    acceptingNewPatients: null,
    languagesSpoken: [],
  };
}

export function mapDepartment(
  item: DepartmentItem,
  locationsById: Map<string, LocationSummary>
): Department {
  const name = fieldString(item.serviceTitle) || item.displayName || item.name;
  const locationIds = targetIds(item.offeredAtLocations);
  const locations = locationIds
    .map((id) => locationsById.get(id))
    .filter((location): location is LocationSummary => Boolean(location));

  return {
    id: normalizeId(item.id),
    slug: slugify(item.name),
    itemName: item.name,
    name,
    shortDescription: fieldString(item.serviceShortDescription),
    descriptionHtml: fieldString(item.serviceDetail),
    floor: null,
    wing: null,
    iconUrl: null,
    locationIds,
    locations,
    physicians: [],
  };
}

export function attachDepartmentNames(
  physicians: Physician[],
  departments: Department[]
): Physician[] {
  const bySlug = new Map(departments.map((department) => [department.slug, department]));
  return physicians.map((physician) => {
    const department = physician.departmentSlug ? bySlug.get(physician.departmentSlug) : undefined;
    return {
      ...physician,
      departmentName: department?.name ?? physician.departmentName,
    };
  });
}

export function physiciansForDepartment(
  department: Department,
  physicians: Physician[]
): Physician[] {
  const locationSet = new Set(department.locationIds);
  return physicians.filter((physician) => {
    if (physician.departmentSlug === department.slug) return true;
    return physician.locationIds.some((id) => locationSet.has(id));
  });
}

export function locationMap(locations: LocationSummary[]): Map<string, LocationSummary> {
  return new Map(locations.map((location) => [location.id, location]));
}
