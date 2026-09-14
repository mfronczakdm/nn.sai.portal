import 'server-only';

import { ClientError } from 'graphql-request';
import { ZodError } from 'zod';

import {
  createSitecoreClient,
  departmentByPathDocument,
  departmentsDocument,
  locationsDocument,
  physicianByPathDocument,
  physiciansDocument,
} from '../client';
import {
  DEFAULT_CHILD_PAGE_SIZE,
  DEPARTMENTS_ROOT_PATH,
  LOCATIONS_ROOT_PATH,
  PHYSICIANS_ROOT_PATH,
} from '../constants';
import { isMockDataEnabled } from '../env';
import { SitecoreFetchError, SitecoreValidationError } from '../errors';
import { getKioskLocale } from '@/lib/i18n/get-locale';
import { sitecoreLanguage } from '@/lib/i18n/config';
import {
  attachDepartmentNames,
  locationMap,
  mapDepartment,
  mapLocation,
  mapPhysician,
  physiciansForDepartment,
} from '../mappers';
import {
  getMockDepartmentsResponse,
  getMockLocationsResponse,
  getMockPhysiciansResponse,
} from '../mock';
import {
  departmentByPathQuerySchema,
  departmentsQuerySchema,
  locationsQuerySchema,
  physicianByPathQuerySchema,
  physiciansQuerySchema,
} from '../schemas';
import type { Department, LocationSummary, Physician } from '../types';

function wrapError(action: string, error: unknown): never {
  if (error instanceof SitecoreFetchError) {
    throw error;
  }
  if (error instanceof ZodError) {
    throw new SitecoreValidationError(`Sitecore ${action} response failed validation`, error.flatten());
  }
  if (error instanceof ClientError) {
    throw new SitecoreFetchError(`Sitecore ${action} request failed`, {
      details: error.response.errors,
      cause: error,
    });
  }
  throw new SitecoreFetchError(`Sitecore ${action} failed`, { cause: error });
}

async function requestLive<T>(document: string, operationName: string, variables: Record<string, unknown>): Promise<T> {
  try {
    return await createSitecoreClient().request<T>(document, variables);
  } catch (error) {
    wrapError(operationName, error);
  }
}

function activeLanguage() {
  return sitecoreLanguage(getKioskLocale());
}

export async function getLocations(): Promise<LocationSummary[]> {
  try {
    const language = activeLanguage();
    const raw = isMockDataEnabled()
      ? getMockLocationsResponse(getKioskLocale())
      : await requestLive(locationsDocument(), 'GetLocations', {
          path: LOCATIONS_ROOT_PATH,
          language,
          first: DEFAULT_CHILD_PAGE_SIZE,
        });
    const parsed = locationsQuerySchema.parse(raw);
    return (parsed.item?.children?.results ?? []).map(mapLocation);
  } catch (error) {
    wrapError('getLocations', error);
  }
}

async function getPhysicianItems() {
  const language = activeLanguage();
  const raw = isMockDataEnabled()
    ? getMockPhysiciansResponse(getKioskLocale())
    : await requestLive(physiciansDocument(), 'GetPhysicians', {
        path: PHYSICIANS_ROOT_PATH,
        language,
        first: DEFAULT_CHILD_PAGE_SIZE,
      });
  return physiciansQuerySchema.parse(raw).item?.children?.results ?? [];
}

async function getDepartmentItems() {
  const language = activeLanguage();
  const raw = isMockDataEnabled()
    ? getMockDepartmentsResponse(getKioskLocale())
    : await requestLive(departmentsDocument(), 'GetDepartments', {
        path: DEPARTMENTS_ROOT_PATH,
        language,
        first: DEFAULT_CHILD_PAGE_SIZE,
      });
  return departmentsQuerySchema.parse(raw).item?.children?.results ?? [];
}

export async function getPhysicians(): Promise<Physician[]> {
  try {
    const [items, locations, departmentItems] = await Promise.all([
      getPhysicianItems(),
      getLocations(),
      getDepartmentItems(),
    ]);
    const byId = locationMap(locations);
    const departments = departmentItems.map((item) => mapDepartment(item, byId));
    return attachDepartmentNames(
      items.map((item) => mapPhysician(item, byId)),
      departments
    );
  } catch (error) {
    wrapError('getPhysicians', error);
  }
}

export async function getPhysicianBySlug(slug: string): Promise<Physician | null> {
  try {
    if (isMockDataEnabled()) {
      const physicians = await getPhysicians();
      return physicians.find((physician) => physician.slug === slug) ?? null;
    }

    const physicians = await getPhysicians();
    const match = physicians.find((physician) => physician.slug === slug);
    if (match) return match;

    const path = `${PHYSICIANS_ROOT_PATH}/${slug.replace(/-/g, ' ')}`;
    const raw = await requestLive(physicianByPathDocument(), 'GetPhysicianByPath', {
      path,
      language: activeLanguage(),
    });
    const parsed = physicianByPathQuerySchema.parse(raw);
    if (!parsed.item) return null;
    const locations = locationMap(await getLocations());
    return mapPhysician(parsed.item, locations);
  } catch (error) {
    wrapError('getPhysicianBySlug', error);
  }
}

export async function getDepartments(): Promise<Department[]> {
  try {
    const [items, locations, physicians] = await Promise.all([
      getDepartmentItems(),
      getLocations(),
      getPhysicians().catch(() => [] as Physician[]),
    ]);
    const byId = locationMap(locations);
    return items.map((item) => {
      const department = mapDepartment(item, byId);
      return {
        ...department,
        physicians: physiciansForDepartment(department, physicians),
      };
    });
  } catch (error) {
    wrapError('getDepartments', error);
  }
}

export async function getDepartmentBySlug(slug: string): Promise<Department | null> {
  try {
    const departments = await getDepartments();
    const match = departments.find((department) => department.slug === slug);
    if (match) return match;

    if (isMockDataEnabled()) return null;

    const path = `${DEPARTMENTS_ROOT_PATH}/${slug.replace(/-/g, ' ')}`;
    const raw = await requestLive(departmentByPathDocument(), 'GetDepartmentByPath', {
      path,
      language: activeLanguage(),
    });
    const parsed = departmentByPathQuerySchema.parse(raw);
    if (!parsed.item) return null;
    const locations = locationMap(await getLocations());
    const department = mapDepartment(parsed.item, locations);
    const physicians = await getPhysicians();
    return {
      ...department,
      physicians: physiciansForDepartment(department, physicians),
    };
  } catch (error) {
    wrapError('getDepartmentBySlug', error);
  }
}

export async function getKioskCatalog(): Promise<{
  physicians: Physician[];
  departments: Department[];
  locations: LocationSummary[];
}> {
  const [physicians, departments, locations] = await Promise.all([
    getPhysicians(),
    getDepartments(),
    getLocations(),
  ]);
  return { physicians, departments, locations };
}
