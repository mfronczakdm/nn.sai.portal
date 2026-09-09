/**
 * LCMC kiosk content roots in Sitecore.
 *
 * Verified against the live XM Cloud tree on 2026-09-09:
 *   /sitecore/content/lcmc/lcmc/Data/Physicians  (LCMC Physician Folder)
 *   /sitecore/content/lcmc/lcmc/Data/Locations    (LCMC Hospital Location Folder)
 *   /sitecore/content/lcmc/lcmc/Data/Services     (LCMC Service Folder)
 *
 * There is NO /Data/Departments folder. Kiosk "department" screens query Services.
 */
export const SITE_ROOT_PATH = '/sitecore/content/lcmc/lcmc';
export const DATA_ROOT_PATH = `${SITE_ROOT_PATH}/Data`;

export const PHYSICIANS_ROOT_PATH = `${DATA_ROOT_PATH}/Physicians`;
export const LOCATIONS_ROOT_PATH = `${DATA_ROOT_PATH}/Locations`;

/** Real Sitecore folder used for the kiosk department directory. */
export const SERVICES_ROOT_PATH = `${DATA_ROOT_PATH}/Services`;

/**
 * Alias kept because route/API names say "department".
 * Points at Services — do not invent a /Data/Departments path.
 */
export const DEPARTMENTS_ROOT_PATH = SERVICES_ROOT_PATH;

export const PHYSICIAN_TEMPLATE_ID = 'dd974469-0ef7-479d-8e2b-f61c09e0c4db';
export const LOCATION_TEMPLATE_ID = '1be17bb8-084f-4fba-a33f-8568e92f5b45';
export const SERVICE_TEMPLATE_ID = '4540c3ad-240b-4d59-bd8b-f2a34d1edc79';

export const DEFAULT_LANGUAGE = 'en';
export const DEFAULT_CHILD_PAGE_SIZE = 100;
