export const LCMC_DATA_LOCATIONS_PATH = '/sitecore/content/lcmc/lcmc/Data/Locations';
export const LCMC_DATA_LOCATIONS_ID = '{76041887-6E16-4844-AD13-366BC2E32265}';
export const LCMC_OUR_LOCATIONS_PAGE_ID = '{0A471272-462E-4497-BEA2-D03C904BCBE5}';
export const LCMC_OUR_LOCATIONS_PAGE_PATH = '/sitecore/content/lcmc/lcmc/Home/Our Locations';

type JsonTextField = {
  jsonValue?: { value?: unknown };
};

function fieldText(field?: JsonTextField | null): string {
  const value = field?.jsonValue?.value;
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeSitecoreGuid(raw?: string | null): string {
  return (raw ?? '').replace(/[{}-]/g, '').toUpperCase();
}

export function isLcmcDataLocationsRef(value?: string | null): boolean {
  const trimmed = (value ?? '').trim().replace(/\\/g, '/');
  if (!trimmed) return false;
  if (trimmed === LCMC_DATA_LOCATIONS_PATH) return true;
  return normalizeSitecoreGuid(trimmed) === normalizeSitecoreGuid(LCMC_DATA_LOCATIONS_ID);
}

export function isLcmcOurLocationsPageRef(value?: string | null): boolean {
  const trimmed = (value ?? '').trim().replace(/\\/g, '/');
  if (!trimmed) return false;
  if (trimmed === LCMC_OUR_LOCATIONS_PAGE_PATH) return true;
  if (trimmed.startsWith(`${LCMC_OUR_LOCATIONS_PAGE_PATH}/`)) return true;
  return normalizeSitecoreGuid(trimmed) === normalizeSitecoreGuid(LCMC_OUR_LOCATIONS_PAGE_ID);
}

/**
 * Authors often pick the Our Locations page (or a child hospital page) instead of
 * Data/Locations. LocationListing is LCMC-only and should resolve that to the
 * canonical hospital-location folder.
 */
export function resolveLocationListingFolderRef(value?: string | null): string {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return '';
  if (isLcmcOurLocationsPageRef(trimmed)) return LCMC_DATA_LOCATIONS_ID;
  return trimmed;
}

export function locationListingPublishHint(): string {
  return [
    'Experience Edge returned 0 hospital locations for this datasource.',
    'Publish /sitecore/content/lcmc/lcmc/Data/Locations and its 16 LCMC Hospital Location children',
    '(not just the Our Locations page or the rendering) to the current Preview and Live Edge.',
    'In Pages, the Locations folder Version 1 shows a slashed-circle until that publish finishes.',
  ].join(' ');
}

/** True when the item has LCMC Hospital Location fields, not a sitemap page. */
export function looksLikeHospitalLocation(location: {
  locationTitle?: JsonTextField | null;
  locationType?: JsonTextField | null;
  streetAddress?: JsonTextField | null;
  latitude?: JsonTextField | null;
}): boolean {
  return Boolean(
    fieldText(location.locationTitle) ||
      fieldText(location.locationType) ||
      fieldText(location.streetAddress) ||
      fieldText(location.latitude)
  );
}
