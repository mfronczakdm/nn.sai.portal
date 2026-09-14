import { writeFileSync } from 'fs';
import { join } from 'path';

const f = (value) => ({ value });
const loc = (id, name) => ({
  servingLocations: {
    value: `{${id}}`,
    targetItems: [{ id, name, displayName: name }],
  },
});

const physicians = [
  ['3248558F-44BA-478E-97FE-80E84A000603', 'Alicia Broussard MD', 'Alicia Broussard', 'MD', 'Urgent Care', '<p>Dr. Broussard provides Westbank walk-in care at Gretna Urgent Care and refers patients to West Jefferson when needed.</p>', '504-349-6747', 'F1E5353C-A2B7-47F0-9570-85B8FD6D9FED', 'LCMC Health Gretna Urgent Care'],
  ['9BC27AE8-3D1C-468A-8A1D-336EDB3F11D9', 'Andre Baptiste MD', 'Andre Baptiste', 'MD', 'Family Medicine', '<p>Dr. Baptiste provides primary and hospital medicine for families at New Orleans East Hospital.</p>', '504-592-6600', '6766AE91-0553-4034-B328-2327CB54AB85', 'New Orleans East Hospital'],
  ['C176B05D-10A5-49C8-A980-9380046CE24F', 'Anita Chauvin MD', 'Anita Chauvin', 'MD', 'Medical Oncology', '<p>Dr. Chauvin treats solid tumors and coordinates cancer care at East Jefferson, including access to LSU LCMC Health Cancer Center resources.</p>', '504-503-4200', 'EFEAC293-2BF4-4516-873D-4EAC1F998474', 'East Jefferson General Hospital'],
  ['31A4B5A2-10FB-4CF1-B1E5-8FC21C802D06', 'Brian LeBlanc MD', 'Brian LeBlanc', 'MD', 'Orthopedic Surgery', '<p>Dr. LeBlanc is an orthopedic surgeon at West Jefferson Medical Center, treating fractures, joints, and sports injuries on the Westbank.</p>', '504-349-6800', '35C77454-5FB8-460D-BC12-299F7B31DE5A', 'West Jefferson Medical Center'],
  ['12B533A6-8DF8-4D80-B466-111A5B26B8E4', 'Camille Landry MD', 'Camille Landry', 'MD, FACC', 'Cardiology', '<p>Dr. Landry is a board-certified cardiologist at East Jefferson General Hospital, focusing on heart failure and preventive cardiology for Jefferson Parish patients.</p>', '504-503-4100', 'EFEAC293-2BF4-4516-873D-4EAC1F998474', 'East Jefferson General Hospital'],
  ['3188F21C-974C-43D5-8722-C676D09A8293', 'Claire Fontenot MD', 'Claire Fontenot', 'MD', 'Urgent Care', '<p>Dr. Fontenot provides walk-in urgent care on Magazine Street and refers patients to Touro or Manning Family Children\'s when a higher level of care is needed.</p>', '504-900-3160', '9E0B2413-44E2-488E-9346-39243F87E342', 'LCMC Health Uptown Urgent Care'],
  ['49B7EB4F-7C96-4D02-BA27-99FF3F2C75E2', 'Daniel Hebert MD', 'Daniel Hebert', 'MD', 'Pediatric Emergency Medicine', '<p>Dr. Hebert staffs the pediatric emergency department at Manning Family Children\'s, treating urgent and emergent conditions in children.</p>', '504-899-9511', '6B468248-C9D1-4DD0-9E8D-44B477FDB96C', 'Manning Family Childrens'],
  ['010E3311-06A7-4904-AFD0-202FD565A796', 'Dominic Lirette MD', 'Dominic Lirette', 'MD', 'ENT', '<p>Dr. Lirette is a board-certified ENT surgeon at West Jefferson Medical Center, focusing on sinus, hearing, and throat care for Marrero and Westbank families.</p>', '504-349-6420', '35C77454-5FB8-460D-BC12-299F7B31DE5A', 'West Jefferson Medical Center'],
  ['EED3B2C7-4DEF-4F96-B129-46E86DF0559D', 'Elise Boudreaux MD', 'Elise Boudreaux', 'MD', 'Emergency Medicine', '<p>Dr. Boudreaux is an emergency physician at Lakeside Hospital, caring for urgent and emergent conditions around the clock.</p>', '504-780-8282', 'C6A3CDB7-8708-4C60-861B-009B7FB9E786', 'Lakeside Hospital'],
  ['24EB9BF3-BFD6-4D01-87A7-BAF6D3DA421C', 'Gabrielle Moreau MD', 'Gabrielle Moreau', 'MD', 'ENT', '<p>Dr. Moreau is a board-certified otolaryngologist at West Jefferson Medical Center, caring for adults and children with ear, nose, and throat conditions on the Westbank.</p>', '504-349-6400', '35C77454-5FB8-460D-BC12-299F7B31DE5A', 'West Jefferson Medical Center'],
  ['1B865C3A-A093-4A6D-8DB8-554028EB662F', 'Hannah Scott MD', 'Hannah Scott', 'MD', 'Urgent Care', '<p>Dr. Scott provides neighborhood walk-in care at Lakeview Urgent Care on Harrison Avenue.</p>', '504-309-7108', '53907833-68C9-4A0D-A500-FAD77D27FBD0', 'LCMC Health Lakeview Urgent Care'],
  ['3649DA30-9C2F-445B-9B40-AD91F25276DC', 'James Thibodeaux MD', 'James Thibodeaux', 'MD, FACC', 'Cardiology', '<p>Dr. Thibodeaux provides heart and vascular care at Lakeview Hospital and the LCMC Health Heart and Vascular clinic in Covington.</p>', '985-867-2131', 'C5D069A3-C8BB-40FE-89BE-D7F9D5C9614F', 'Lakeview Hospital'],
  ['65C2FDCF-7791-43DA-8354-7030BB6CD025', 'Joseph Allemand MD', 'Joseph Allemand', 'MD', 'Urgent Care', '<p>Dr. Allemand provides walk-in urgent care for St. Charles Parish patients at the Luling clinic.</p>', '504-702-4862', '4C15C596-29EB-46C8-BD93-53E7DEBA82E0', 'LCMC Health Luling Urgent Care'],
  ['B58527CE-BA45-4C9E-B506-D0A3D75AC996', 'Keisha Williams MD', 'Keisha Williams', 'MD', 'Emergency Medicine', '<p>Dr. Williams is an emergency physician at New Orleans East Hospital, caring for patients across the East Bank community.</p>', '504-592-6600', '6766AE91-0553-4034-B328-2327CB54AB85', 'New Orleans East Hospital'],
  ['47043241-18E6-4A37-8F69-4108CDBD78A2', 'Kevin Romero MD', 'Kevin Romero', 'MD', 'Family Medicine', '<p>Dr. Romero sees walk-in patients at Clearview Urgent Care for everyday illnesses and minor injuries.</p>', '504-676-5550', 'A2D66593-0A5D-4EE4-82D3-FA88A59C71FA', 'LCMC Health Clearview Urgent Care'],
  ['B7224F06-A404-40C9-8F72-8A1FDD04C472', 'Leah Castillo MD', 'Leah Castillo', 'MD', 'Psychiatry', '<p>Dr. Castillo provides inpatient and emergency behavioral health care at University Medical Center New Orleans.</p>', '504-702-3000', 'E8F05084-0214-424F-B1D4-B5B562499F5C', 'University Medical Center New Orleans'],
  ['B257CB21-E4C2-44BA-8C70-28D893D45C97', 'Marcus Fontenot MD', 'Marcus Fontenot', 'MD', 'Orthopedic Surgery', '<p>Dr. Fontenot practices orthopedic surgery at Lakeside Hospital, treating joint, sports, and fracture care for Metairie patients.</p>', '504-780-8300', 'C6A3CDB7-8708-4C60-861B-009B7FB9E786', 'Lakeside Hospital'],
  ['6877B226-0CC6-408C-9E51-E2C5D2351A61', 'Michael Tran MD', 'Michael Tran', 'MD', 'Urgent Care', '<p>Dr. Tran treats common illnesses and minor injuries at LCMC Health Kenner Urgent Care.</p>', '504-389-6600', '57D504EA-804B-4166-84EB-CE298A6853F0', 'LCMC Health Kenner Urgent Care'],
  ['048E9D17-4B8B-4FBF-90EA-8E66D97E4F89', 'Nicole Doucet MD', 'Nicole Doucet', 'MD', 'Medical Oncology', '<p>Dr. Doucet treats cancer patients at West Jefferson Medical Center and coordinates care with system oncology programs.</p>', '504-349-6360', '35C77454-5FB8-460D-BC12-299F7B31DE5A', 'West Jefferson Medical Center'],
  ['79C12EE1-19F2-48EB-89CF-3473364D2488', 'Omar Hassan MD', 'Omar Hassan', 'MD, FACS', 'Trauma Surgery', '<p>Dr. Hassan is a trauma surgeon at University Medical Center New Orleans, the region\'s Level I Trauma Center.</p>', '504-702-3000', 'E8F05084-0214-424F-B1D4-B5B562499F5C', 'University Medical Center New Orleans'],
  ['24F0A42F-B1A5-43C2-9E26-E63E63E07162', 'Patrice Morales MD', 'Patrice Morales', 'MD', 'Urgent Care', '<p>Dr. Morales provides walk-in urgent care at the Chalmette clinic for non-life-threatening illnesses and injuries.</p>', '504-345-1330', '764E7C6F-75BB-49EE-B304-4E5A0E6F3DAC', 'LCMC Health Chalmette Urgent Care'],
  ['BC61F2D9-4655-42D8-867B-41407505B6DC', 'Priya Raman MD', 'Priya Raman', 'MD, FAAP', 'Pediatrics', '<p>Dr. Raman is a pediatrician at Manning Family Children\'s, caring for infants through adolescents with both wellness and complex needs.</p>', '504-899-9511', '6B468248-C9D1-4DD0-9E8D-44B477FDB96C', 'Manning Family Childrens'],
  ['4A1FED30-0480-4CF5-9DCC-4149B3164046', 'Renee Guidry MD', 'Renee Guidry', 'MD', 'Neurology', '<p>Dr. Guidry is a neurologist with the Neuroscience Institute at Lakeview Hospital, treating stroke, headache, and movement disorders.</p>', '985-867-3800', 'C5D069A3-C8BB-40FE-89BE-D7F9D5C9614F', 'Lakeview Hospital'],
  ['F42ECEC4-C3D2-43BA-8FF1-2BA640F66251', 'Sarah Melancon MD', 'Sarah Melancon', 'MD, FACOG', 'Obstetrics and Gynecology', '<p>Dr. Melancon practices obstetrics and gynecology at Touro, including prenatal care and labor and delivery.</p>', '504-897-7011', '063FFD1D-6681-4DFC-8A7A-504EA903090F', 'Touro'],
  ['74789E69-47D3-463D-AEAC-CEA3F20A5647', 'Tanya Ricard MD', 'Tanya Ricard', 'MD', 'Urgent Care', '<p>Dr. Ricard sees walk-in patients at Marrero Urgent Care and connects Westbank families with West Jefferson when follow-up is needed.</p>', '504-301-2825', 'EBC36A98-6CF2-477A-827A-7BEFEB2FE5A8', 'LCMC Health Marrero Urgent Care'],
  ['F74FE325-06CA-4905-88E7-462F02FD74EA', 'Thomas Nguyen MD', 'Thomas Nguyen', 'MD', 'Gastroenterology', '<p>Dr. Nguyen provides digestive care and endoscopy at Touro for Uptown and surrounding New Orleans patients.</p>', '504-897-7877', '063FFD1D-6681-4DFC-8A7A-504EA903090F', 'Touro'],
].map(([id, itemName, fullName, credentials, specialty, bio, phone, locId, locName]) => ({
  id,
  name: itemName,
  displayName: itemName,
  path: `/sitecore/content/lcmc/lcmc/Data/Physicians/${itemName}`,
  physicianFullName: f(fullName),
  credentials: f(credentials),
  specialty: f(specialty),
  physicianBio: f(bio),
  physicianPhone: f(phone),
  ...loc(locId, locName),
}));

const dir = join(process.cwd(), 'lib', 'sitecore', 'mock');
writeFileSync(
  join(dir, 'physicians.json'),
  JSON.stringify({ item: { id: '13C422FB-8991-4468-B996-BE73A904C23E', name: 'Physicians', children: { results: physicians } } }, null, 2)
);
console.log('wrote physicians.json', physicians.length);
