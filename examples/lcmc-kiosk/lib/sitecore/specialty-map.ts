/**
 * Maps Physician.Specialty strings onto LCMC Service slugs.
 * Services are the kiosk "department" records; specialty is a plain text field
 * on Physician, not a reference. Includes English and es-CO labels from Sitecore.
 */
export const SPECIALTY_TO_DEPARTMENT_SLUG: Record<string, string> = {
  Cardiology: 'heart-and-vascular-care',
  Cardiología: 'heart-and-vascular-care',
  'Medical Oncology': 'cancer-care',
  'Oncología médica': 'cancer-care',
  'Orthopedic Surgery': 'orthopedic-care',
  'Cirugía ortopédica': 'orthopedic-care',
  'Pediatric Emergency Medicine': 'pediatric-care',
  'Medicina de Emergencias Pediátricas': 'pediatric-care',
  'Emergency Medicine': 'emergency-care',
  'Medicina de Emergencias': 'emergency-care',
  Psychiatry: 'behavioral-health',
  Psiquiatría: 'behavioral-health',
  'Trauma Surgery': 'emergency-care',
  'Cirugía de Trauma': 'emergency-care',
  Pediatrics: 'pediatric-care',
  Pediatría: 'pediatric-care',
  Neurology: 'neuroscience',
  Neurología: 'neuroscience',
  'Obstetrics and Gynecology': 'womens-health',
  'Obstetricia y ginecología': 'womens-health',
  Gastroenterology: 'digestive-care',
  Gastroenterología: 'digestive-care',
  'Urgent Care': 'urgent-care',
  'Atención de urgencias': 'urgent-care',
};

export function departmentSlugForSpecialty(specialty: string): string | null {
  if (SPECIALTY_TO_DEPARTMENT_SLUG[specialty]) {
    return SPECIALTY_TO_DEPARTMENT_SLUG[specialty];
  }
  const folded = specialty
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  for (const [label, slug] of Object.entries(SPECIALTY_TO_DEPARTMENT_SLUG)) {
    const foldedLabel = label
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
    if (foldedLabel === folded) return slug;
  }
  return null;
}
