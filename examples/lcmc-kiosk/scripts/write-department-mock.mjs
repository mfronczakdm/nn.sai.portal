import { writeFileSync } from 'fs';
import { join } from 'path';

const f = (value) => ({ value });
const ml = (ids) => ({
  value: ids.map((id) => `{${id}}`).join('|'),
  targetItems: ids.map((id) => ({ id, name: id, displayName: id })),
});

const departments = [
  {
    id: 'DB0C3D51-6686-4387-89A4-97B0AB5E440E',
    name: 'Behavioral Health',
    title: 'Behavioral Health',
    short: 'Inpatient and outpatient behavioral health evaluation and treatment for adults and older adults.',
    detail:
      '<p>Behavioral health services include crisis evaluation, inpatient psychiatry, and geriatric behavioral health units.</p><p>East Jefferson, University Medical Center, and West Jefferson are primary hospital sites for behavioral health programs.</p>',
    locations: ['EFEAC293-2BF4-4516-873D-4EAC1F998474', 'E8F05084-0214-424F-B1D4-B5B562499F5C', '35C77454-5FB8-460D-BC12-299F7B31DE5A'],
  },
  {
    id: '72C9C518-0BB1-4BB0-9319-A38875217CD3',
    name: 'Cancer Care',
    title: 'Cancer Care',
    short: 'Screening, medical oncology, and coordinated cancer treatment through LCMC Health and the LSU LCMC Health Cancer Center.',
    detail:
      '<p>Cancer care includes screening, medical oncology, radiation oncology, and access to clinical trials.</p><p>East Jefferson, Touro, University Medical Center, and West Jefferson connect patients with multidisciplinary cancer teams.</p>',
    locations: [
      'EFEAC293-2BF4-4516-873D-4EAC1F998474',
      '063FFD1D-6681-4DFC-8A7A-504EA903090F',
      'E8F05084-0214-424F-B1D4-B5B562499F5C',
      '35C77454-5FB8-460D-BC12-299F7B31DE5A',
    ],
  },
  {
    id: 'B491C6F0-3A49-4E3A-B94E-815639B35B92',
    name: 'Digestive Care',
    title: 'Digestive Care',
    short: 'Gastroenterology and digestive health services including endoscopy and hospital-based GI care.',
    detail:
      '<p>Digestive care teams evaluate reflux, liver disease, inflammatory bowel disease, and other GI conditions.</p><p>Hospital GI programs at East Jefferson, Touro, West Jefferson, and University Medical Center include endoscopy and inpatient support.</p>',
    locations: [
      'EFEAC293-2BF4-4516-873D-4EAC1F998474',
      '063FFD1D-6681-4DFC-8A7A-504EA903090F',
      'E8F05084-0214-424F-B1D4-B5B562499F5C',
      '35C77454-5FB8-460D-BC12-299F7B31DE5A',
    ],
  },
  {
    id: '21FB8DB6-1732-4A44-8BEC-E39C52C1961A',
    name: 'Emergency Care',
    title: 'Emergency Care',
    short: '24/7 emergency evaluation and treatment for life-threatening illness and injury across LCMC Health hospitals.',
    detail:
      '<p>LCMC Health emergency departments treat serious injuries, stroke, chest pain, and other urgent conditions that cannot wait.</p><p>University Medical Center New Orleans is the region\'s Level I Trauma Center, and system hospitals provide neighborhood emergency access throughout greater New Orleans.</p>',
    locations: [
      'EFEAC293-2BF4-4516-873D-4EAC1F998474',
      'C6A3CDB7-8708-4C60-861B-009B7FB9E786',
      'C5D069A3-C8BB-40FE-89BE-D7F9D5C9614F',
      '6B468248-C9D1-4DD0-9E8D-44B477FDB96C',
      '6766AE91-0553-4034-B328-2327CB54AB85',
      '063FFD1D-6681-4DFC-8A7A-504EA903090F',
      'E8F05084-0214-424F-B1D4-B5B562499F5C',
      '35C77454-5FB8-460D-BC12-299F7B31DE5A',
    ],
  },
  {
    id: '872D3FA1-DBC7-4ABF-9544-5A668C0D08B1',
    name: 'Heart and Vascular Care',
    title: 'Heart and Vascular Care',
    short: 'Cardiology, vascular, and cardiac catheterization services for patients across the LCMC Health system.',
    detail:
      '<p>Heart and vascular teams diagnose and treat coronary disease, heart failure, arrhythmia, and vascular conditions.</p><p>Patients can access cath lab, imaging, and specialty follow-up at East Jefferson, Lakeview, Touro, West Jefferson, and University Medical Center.</p>',
    locations: [
      'EFEAC293-2BF4-4516-873D-4EAC1F998474',
      'C5D069A3-C8BB-40FE-89BE-D7F9D5C9614F',
      '063FFD1D-6681-4DFC-8A7A-504EA903090F',
      'E8F05084-0214-424F-B1D4-B5B562499F5C',
      '35C77454-5FB8-460D-BC12-299F7B31DE5A',
    ],
  },
  {
    id: '2C7094F3-7E17-4A5F-8E1F-68830FDC81B6',
    name: 'Imaging',
    title: 'Imaging',
    short: 'X-ray, CT, MRI, ultrasound, and other diagnostic imaging at LCMC Health hospitals and urgent care sites.',
    detail:
      '<p>Imaging services support diagnosis and treatment planning with X-ray, CT, MRI, ultrasound, and mammography where available.</p><p>Hospital radiology departments and selected urgent care clinics provide convenient access across the system.</p>',
    locations: [
      'EFEAC293-2BF4-4516-873D-4EAC1F998474',
      'C6A3CDB7-8708-4C60-861B-009B7FB9E786',
      'C5D069A3-C8BB-40FE-89BE-D7F9D5C9614F',
      '6B468248-C9D1-4DD0-9E8D-44B477FDB96C',
      '6766AE91-0553-4034-B328-2327CB54AB85',
      '063FFD1D-6681-4DFC-8A7A-504EA903090F',
      'E8F05084-0214-424F-B1D4-B5B562499F5C',
      '35C77454-5FB8-460D-BC12-299F7B31DE5A',
      '764E7C6F-75BB-49EE-B304-4E5A0E6F3DAC',
      'A2D66593-0A5D-4EE4-82D3-FA88A59C71FA',
      'F1E5353C-A2B7-47F0-9570-85B8FD6D9FED',
      '57D504EA-804B-4166-84EB-CE298A6853F0',
      '53907833-68C9-4A0D-A500-FAD77D27FBD0',
      '4C15C596-29EB-46C8-BD93-53E7DEBA82E0',
      'EBC36A98-6CF2-477A-827A-7BEFEB2FE5A8',
      '9E0B2413-44E2-488E-9346-39243F87E342',
    ],
  },
  {
    id: 'EF79ADEF-3A78-4992-B297-04B3447C9CF4',
    name: 'Laboratory Services',
    title: 'Laboratory Services',
    short: 'Hospital and outpatient laboratory testing that supports diagnosis, treatment, and emergency care.',
    detail:
      '<p>Laboratory teams process blood work, cultures, and other diagnostic tests for inpatients, emergency patients, and outpatient visits.</p><p>Each LCMC Health hospital maintains laboratory support for routine and urgent care.</p>',
    locations: [
      'EFEAC293-2BF4-4516-873D-4EAC1F998474',
      'C6A3CDB7-8708-4C60-861B-009B7FB9E786',
      'C5D069A3-C8BB-40FE-89BE-D7F9D5C9614F',
      '6B468248-C9D1-4DD0-9E8D-44B477FDB96C',
      '6766AE91-0553-4034-B328-2327CB54AB85',
      '063FFD1D-6681-4DFC-8A7A-504EA903090F',
      'E8F05084-0214-424F-B1D4-B5B562499F5C',
      '35C77454-5FB8-460D-BC12-299F7B31DE5A',
    ],
  },
  {
    id: 'DBD2AAB8-F409-4288-9EE0-5CFD676A1C66',
    name: 'Neuroscience',
    title: 'Neuroscience',
    short: 'Brain, spine, stroke, and neurology care through the Neuroscience Institute at LCMC Health.',
    detail:
      '<p>The Neuroscience Institute treats stroke, brain tumors, spine conditions, and movement disorders.</p><p>Institute locations include East Jefferson, Lakeview, Touro, University Medical Center, West Jefferson, and New Orleans East Hospital.</p>',
    locations: [
      'EFEAC293-2BF4-4516-873D-4EAC1F998474',
      'C5D069A3-C8BB-40FE-89BE-D7F9D5C9614F',
      '6766AE91-0553-4034-B328-2327CB54AB85',
      '063FFD1D-6681-4DFC-8A7A-504EA903090F',
      'E8F05084-0214-424F-B1D4-B5B562499F5C',
      '35C77454-5FB8-460D-BC12-299F7B31DE5A',
    ],
  },
  {
    id: 'D2B7F3AD-6DF9-4B0D-AB3B-58AD3669DB5B',
    name: 'Orthopedic Care',
    title: 'Orthopedic Care',
    short: 'Bone, joint, and sports medicine care for adults and children across LCMC Health hospitals.',
    detail:
      '<p>Orthopedic specialists treat fractures, joint replacement, spine conditions, and sports injuries.</p><p>Hospital-based orthopedic programs at East Jefferson, Lakeside, Touro, West Jefferson, and Manning Family Children\'s support both elective and emergency cases.</p>',
    locations: [
      'EFEAC293-2BF4-4516-873D-4EAC1F998474',
      'C6A3CDB7-8708-4C60-861B-009B7FB9E786',
      '6B468248-C9D1-4DD0-9E8D-44B477FDB96C',
      '063FFD1D-6681-4DFC-8A7A-504EA903090F',
      '35C77454-5FB8-460D-BC12-299F7B31DE5A',
    ],
  },
  {
    id: 'BEEA85BD-08B1-40E3-AAD6-7600A802F71F',
    name: 'Pediatric Care',
    title: 'Pediatric Care',
    short: "Specialty and hospital care for infants, children, and adolescents through Manning Family Children's.",
    detail:
      '<p>Pediatric care covers wellness, complex chronic conditions, surgery, and emergency services designed for children.</p><p>Manning Family Children\'s is the system\'s dedicated pediatric hospital, with satellite clinics across Louisiana.</p>',
    locations: ['6B468248-C9D1-4DD0-9E8D-44B477FDB96C'],
  },
  {
    id: 'B69F3F30-2DFD-4668-ACED-3CEE2B15273D',
    name: 'Urgent Care',
    title: 'Urgent Care',
    short: 'Walk-in evaluation for non-life-threatening illnesses and injuries at LCMC Health urgent care clinics.',
    detail:
      '<p>Urgent care clinics treat sprains, infections, minor injuries, and illnesses that need prompt attention but are not emergencies.</p><p>Neighborhood locations across Chalmette, Clearview, Gretna, Kenner, Lakeview, Luling, Marrero, and Uptown keep care close to home.</p>',
    locations: [
      '764E7C6F-75BB-49EE-B304-4E5A0E6F3DAC',
      'A2D66593-0A5D-4EE4-82D3-FA88A59C71FA',
      'F1E5353C-A2B7-47F0-9570-85B8FD6D9FED',
      '57D504EA-804B-4166-84EB-CE298A6853F0',
      '53907833-68C9-4A0D-A500-FAD77D27FBD0',
      '4C15C596-29EB-46C8-BD93-53E7DEBA82E0',
      'EBC36A98-6CF2-477A-827A-7BEFEB2FE5A8',
      '9E0B2413-44E2-488E-9346-39243F87E342',
    ],
  },
  {
    id: '168532F3-37CE-4045-A84C-F0672164EEBE',
    name: 'Womens Health',
    title: "Women's Health",
    short: 'Obstetrics, gynecology, breast care, and maternity services for women across the LCMC Health network.',
    detail:
      '<p>Women\'s health programs include prenatal care, labor and delivery, gynecology, and breast health.</p><p>East Jefferson, Touro, West Jefferson, Lakeview, and New Orleans East Hospital provide maternity and women\'s specialty services.</p>',
    locations: [
      'EFEAC293-2BF4-4516-873D-4EAC1F998474',
      'C5D069A3-C8BB-40FE-89BE-D7F9D5C9614F',
      '6766AE91-0553-4034-B328-2327CB54AB85',
      '063FFD1D-6681-4DFC-8A7A-504EA903090F',
      '35C77454-5FB8-460D-BC12-299F7B31DE5A',
    ],
  },
].map((row) => ({
  id: row.id,
  name: row.name,
  displayName: row.title,
  path: `/sitecore/content/lcmc/lcmc/Data/Services/${row.name}`,
  serviceTitle: f(row.title),
  serviceShortDescription: f(row.short),
  serviceDetail: f(row.detail),
  offeredAtLocations: ml(row.locations),
}));

const dir = join(process.cwd(), 'lib', 'sitecore', 'mock');
writeFileSync(
  join(dir, 'departments.json'),
  JSON.stringify({ item: { id: 'D9CB7792-EE41-4A8F-A1F8-729D90B4E527', name: 'Services', children: { results: departments } } }, null, 2)
);
console.log('wrote departments.json', departments.length);
