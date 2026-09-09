import 'server-only';

import physiciansJson from './physicians.json';
import locationsJson from './locations.json';
import departmentsJson from './departments.json';
import type { DepartmentItem, LocationItem, PhysicianItem } from '../schemas';

export const mockPhysiciansResponse = physiciansJson as {
  item: { children: { results: PhysicianItem[] } };
};

export const mockLocationsResponse = locationsJson as {
  item: { children: { results: LocationItem[] } };
};

export const mockDepartmentsResponse = departmentsJson as {
  item: { children: { results: DepartmentItem[] } };
};
