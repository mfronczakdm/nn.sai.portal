/**
 * Maps Physician.Specialty strings onto LCMC Service slugs.
 * Services are the kiosk "department" records; specialty is a plain text field
 * on Physician, not a reference.
 */
export const SPECIALTY_TO_DEPARTMENT_SLUG: Record<string, string> = {
  Cardiology: 'heart-and-vascular-care',
  'Medical Oncology': 'cancer-care',
  'Orthopedic Surgery': 'orthopedic-care',
  'Pediatric Emergency Medicine': 'pediatric-care',
  'Emergency Medicine': 'emergency-care',
  Psychiatry: 'behavioral-health',
  'Trauma Surgery': 'emergency-care',
  Pediatrics: 'pediatric-care',
  Neurology: 'neuroscience',
  'Obstetrics and Gynecology': 'womens-health',
  Gastroenterology: 'digestive-care',
  'Urgent Care': 'urgent-care',
};

export function departmentSlugForSpecialty(specialty: string): string | null {
  return SPECIALTY_TO_DEPARTMENT_SLUG[specialty] ?? null;
}
