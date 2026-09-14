import { z } from 'zod';

const fieldValueSchema = z
  .object({
    value: z.string().nullish(),
  })
  .nullish();

const targetItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string().nullish(),
});

const multilistFieldSchema = z
  .object({
    value: z.string().nullish(),
    targetItems: z.array(targetItemSchema).nullish(),
  })
  .nullish();

export const physicianItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string().nullish(),
  path: z.string().nullish(),
  physicianFullName: fieldValueSchema,
  credentials: fieldValueSchema,
  specialty: fieldValueSchema,
  physicianBio: fieldValueSchema,
  physicianPhone: fieldValueSchema,
  servingLocations: multilistFieldSchema,
});

export const locationItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string().nullish(),
  path: z.string().nullish(),
  locationTitle: fieldValueSchema,
  locationShortName: fieldValueSchema,
  locationDescription: fieldValueSchema,
  streetAddress: fieldValueSchema,
  city: fieldValueSchema,
  state: fieldValueSchema,
  postalCode: fieldValueSchema,
  phoneNumber: fieldValueSchema,
  hoursText: fieldValueSchema,
  parkingInfo: fieldValueSchema,
  visitorInfo: fieldValueSchema,
  locationType: fieldValueSchema,
  hasEmergencyDepartment: fieldValueSchema,
  offeredServices: multilistFieldSchema,
  locationPhysicians: multilistFieldSchema,
});

export const departmentItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string().nullish(),
  path: z.string().nullish(),
  serviceTitle: fieldValueSchema,
  serviceShortDescription: fieldValueSchema,
  serviceDetail: fieldValueSchema,
  offeredAtLocations: multilistFieldSchema,
});

export const physiciansQuerySchema = z.object({
  item: z
    .object({
      children: z
        .object({
          results: z.array(physicianItemSchema).nullish(),
        })
        .nullish(),
    })
    .nullish(),
});

export const physicianByPathQuerySchema = z.object({
  item: physicianItemSchema.nullish(),
});

export const locationsQuerySchema = z.object({
  item: z
    .object({
      children: z
        .object({
          results: z.array(locationItemSchema).nullish(),
        })
        .nullish(),
    })
    .nullish(),
});

export const departmentsQuerySchema = z.object({
  item: z
    .object({
      children: z
        .object({
          results: z.array(departmentItemSchema).nullish(),
        })
        .nullish(),
    })
    .nullish(),
});

export const departmentByPathQuerySchema = z.object({
  item: departmentItemSchema.nullish(),
});

export type PhysicianItem = z.infer<typeof physicianItemSchema>;
export type LocationItem = z.infer<typeof locationItemSchema>;
export type DepartmentItem = z.infer<typeof departmentItemSchema>;
