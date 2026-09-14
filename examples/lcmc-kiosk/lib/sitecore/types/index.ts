export type LocationSummary = {
  id: string;
  slug: string;
  itemName: string;
  name: string;
  shortName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  hours: string;
  parking: string;
  visitorInfoHtml: string;
  descriptionHtml: string;
  locationType: string;
  hasEmergencyDepartment: boolean;
  serviceIds: string[];
  physicianIds: string[];
};

export type Physician = {
  id: string;
  slug: string;
  itemName: string;
  name: string;
  credentials: string;
  specialty: string;
  bioHtml: string;
  phone: string;
  photoUrl: string | null;
  locationIds: string[];
  locations: LocationSummary[];
  departmentSlug: string | null;
  departmentName: string | null;
  acceptingNewPatients: boolean | null;
  languagesSpoken: string[];
};

export type Department = {
  id: string;
  slug: string;
  itemName: string;
  name: string;
  shortDescription: string;
  descriptionHtml: string;
  /** Not on LCMC Service template — reserved for a future floor/wing field. */
  floor: string | null;
  wing: string | null;
  iconUrl: string | null;
  locationIds: string[];
  locations: LocationSummary[];
  physicians: Physician[];
};
