import { writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = '/sitecore/content/lcmc/mcw/Data';
const f = (value) => ({ value });

const locations = [
  ['1FB5EA21-6526-4E68-9AAD-1B0C2943886A', 'Calhoun Health Center', 'Calhoun', 'Brookfield', '1905 N. Calhoun Rd.', '53005', '43.0640', '-88.1310', 'Free surface parking is available at the clinic.', '<p>Calhoun Health Center is a Froedtert &amp; MCW Community Physicians clinic in Brookfield, Wisconsin.</p>'],
  ['FD72DBCE-1125-4A4D-88A0-6DA467974E47', 'Forest Home Health Center', 'Forest Home', 'Milwaukee', '1316 W. Forest Home Ave.', '53204', '43.0180', '-87.9300', 'Free surface parking is available at the clinic.', '<p>Forest Home Health Center is a Froedtert &amp; MCW Community Physicians clinic in Milwaukee, Wisconsin.</p>'],
  ['CCA5350B-2E2B-40D2-BDCB-E1A4BD54867C', 'Germantown Health Center', 'Germantown', 'Germantown', 'W168 N11237 Western Ave.', '53022', '43.2290', '-88.1100', 'Free surface parking is available at the clinic.', '<p>Germantown Health Center is a Froedtert &amp; MCW Community Physicians clinic in Germantown, Wisconsin.</p>'],
  ['6D0D724C-883C-4234-AC88-948A82A1F66E', 'Good Hope Health Center', 'Good Hope', 'Milwaukee', '7208 N. 76th St.', '53223', '43.1440', '-88.0080', 'Free surface parking is available at the clinic.', '<p>Good Hope Health Center is a Froedtert &amp; MCW Community Physicians clinic in Milwaukee, Wisconsin.</p>'],
  ['E9CE4A1B-E608-4175-A08A-93EC4E79D888', 'Greendale Health Center', 'Greendale', 'Greendale', '6220 W. Loomis Rd.', '53129', '42.9410', '-87.9960', 'Free surface parking is available at the clinic.', '<p>Greendale Health Center is a Froedtert &amp; MCW Community Physicians clinic in Greendale, Wisconsin.</p>'],
  ['4780B6B5-A6FC-4CC1-AB78-D203DFB0142A', 'Kewaskum Health Center', 'Kewaskum', 'Kewaskum', '1701 Fond du Lac Ave.', '53040', '43.5210', '-88.2270', 'Free surface parking is available at the clinic.', '<p>Kewaskum Health Center is a Froedtert &amp; MCW Community Physicians clinic in Kewaskum, Wisconsin.</p>'],
  ['F8BB49F9-FB70-4431-8E6B-565D48EDD209', 'Lafayette Clinic', 'Lafayette', 'Milwaukee', '2071 N. Summit Ave.', '53202', '43.0590', '-87.8950', 'Street and lot parking are available near the clinic.', '<p>Lafayette Clinic is a Froedtert &amp; MCW Community Physicians clinic in Milwaukee, Wisconsin.</p>'],
  ['DAA94ED7-1200-4D82-9810-3E356FE0146D', 'Lincoln Avenue Health Center', 'Lincoln Avenue', 'West Allis', '11211 W. Lincoln Ave.', '53227', '43.0030', '-88.0500', 'Free surface parking is available at the clinic.', '<p>Lincoln Avenue Health Center is a Froedtert &amp; MCW Community Physicians clinic in West Allis, Wisconsin.</p>'],
  ['D5037FE8-2384-496A-944D-6FB92E69D214', 'McKinley Health Center', 'McKinley', 'Milwaukee', '1271 N. 6th St.', '53212', '43.0470', '-87.9160', 'Free surface parking is available at the clinic.', '<p>McKinley Health Center is a Froedtert &amp; MCW Community Physicians clinic in Milwaukee, Wisconsin.</p>'],
  ['EC73FC38-29CB-48A9-B92E-E3E2ADF5870B', 'Mequon Health Center', 'Mequon', 'Mequon', '11430 N. Port Washington Rd.', '53092', '43.2270', '-87.9330', 'Free surface parking is available at the clinic.', '<p>Mequon Health Center is a Froedtert &amp; MCW Community Physicians clinic in Mequon, Wisconsin.</p>'],
  ['8EFD2996-31AC-4A76-A0B3-36B6CD50F715', 'Moorland Reserve Health Center', 'Moorland Reserve', 'New Berlin', '4805 S. Moorland Rd.', '53151', '42.9770', '-88.1270', 'Free surface parking is available at the clinic.', '<p>Moorland Reserve Health Center is a Froedtert &amp; MCW Community Physicians clinic in New Berlin, Wisconsin.</p>'],
  ['9B592896-5898-43A5-BCFA-982D61AE8B85', 'Sargeant Health Center', 'Sargeant', 'Milwaukee', '840 N. 87th St.', '53226', '43.0400', '-88.0100', 'Free surface parking is available at the clinic.', '<p>Sargeant Health Center is a Froedtert &amp; MCW Community Physicians clinic in Milwaukee, Wisconsin.</p>'],
  ['5CFFA936-4BC9-4C40-970A-0CFDC2B69CC6', 'Shorewood Clinic', 'Shorewood', 'Shorewood', '1901 E. Capitol Dr.', '53211', '43.0890', '-87.8870', 'Street and lot parking are available near the clinic.', '<p>Shorewood Clinic is a Froedtert &amp; MCW Community Physicians clinic in Shorewood, Wisconsin.</p>'],
  ['231694AE-748F-4782-A086-1287FD4C6B50', 'Springdale Health Center', 'Springdale', 'Brookfield', '21700 Intertech Dr.', '53045', '43.0910', '-88.1630', 'Free surface parking is available at the clinic.', '<p>Springdale Health Center is a Froedtert &amp; MCW Community Physicians clinic in Brookfield, Wisconsin.</p>'],
  ['00383DA9-AEC7-4841-97B3-2B7E6D7832E9', 'Sunnyslope Health Center', 'Sunnyslope', 'Brookfield', '1350 Sunny Slope Rd.', '53005', '43.0520', '-88.1060', 'Free surface parking is available at the clinic.', '<p>Sunnyslope Health Center is a Froedtert &amp; MCW Community Physicians clinic in Brookfield, Wisconsin.</p>'],
  ['C405E02E-1CD6-4439-B5A4-AA06769FC1CF', 'Westbrook Health Center', 'Westbrook', 'Waukesha', '2315 E. Moreland Blvd.', '53186', '43.0120', '-88.2060', 'Free surface parking is available at the clinic.', '<p>Westbrook Health Center is a Froedtert &amp; MCW Community Physicians clinic in Waukesha, Wisconsin.</p>'],
];

const locById = Object.fromEntries(locations.map((row) => [row[0], { id: row[0], name: row[1], displayName: row[1] }]));

function joinNames(names, conjunction) {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} ${conjunction} ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, ${conjunction} ${names[names.length - 1]}`;
}

function clinicNames(locIds) {
  return locIds.map((id) => locById[id].name);
}

function lastName(fullName) {
  return fullName.split(' ').at(-1);
}

const SPECIALTY_BIO_EN = {
  'Urgent Care': (last, clinics) =>
    `<p>Dr. ${last} provides walk-in urgent care at ${clinics} for non-life-threatening illnesses and injuries.</p>`,
  'Family Medicine': (last, clinics) =>
    `<p>Dr. ${last} provides primary care for families at ${clinics}.</p>`,
  'Medical Oncology': (last, clinics) =>
    `<p>Dr. ${last} treats solid tumors and coordinates cancer care at ${clinics}.</p>`,
  'Orthopedic Surgery': (last, clinics) =>
    `<p>Dr. ${last} is an orthopedic surgeon at ${clinics}, treating fractures, joints, and sports injuries.</p>`,
  Cardiology: (last, clinics) =>
    `<p>Dr. ${last} is a board-certified cardiologist at ${clinics}, focusing on heart failure and preventive cardiology.</p>`,
  'Pediatric Emergency Medicine': (last, clinics) =>
    `<p>Dr. ${last} provides pediatric urgent and emergency care at ${clinics}.</p>`,
  ENT: (last, clinics) =>
    `<p>Dr. ${last} is a board-certified otolaryngologist at ${clinics}, caring for adults and children with ear, nose, and throat conditions.</p>`,
  'Emergency Medicine': (last, clinics) =>
    `<p>Dr. ${last} is an emergency physician at ${clinics}, caring for urgent and emergent conditions.</p>`,
  Psychiatry: (last, clinics) =>
    `<p>Dr. ${last} provides behavioral health care at ${clinics}.</p>`,
  'Trauma Surgery': (last, clinics) =>
    `<p>Dr. ${last} is a trauma and acute-care surgeon at ${clinics}.</p>`,
  Pediatrics: (last, clinics) =>
    `<p>Dr. ${last} is a pediatrician at ${clinics}, caring for infants through adolescents.</p>`,
  Neurology: (last, clinics) =>
    `<p>Dr. ${last} is a neurologist at ${clinics}, treating stroke, headache, and movement disorders.</p>`,
  'Obstetrics and Gynecology': (last, clinics) =>
    `<p>Dr. ${last} practices obstetrics and gynecology at ${clinics}, including prenatal care.</p>`,
  Gastroenterology: (last, clinics) =>
    `<p>Dr. ${last} provides digestive care and endoscopy at ${clinics}.</p>`,
};

const SPECIALTY_BIO_ES = {
  'Urgent Care': (title, last, clinics) =>
    `<p>${title} ${last} brinda atención de urgencias sin cita previa en ${clinics} para enfermedades y lesiones que no ponen en riesgo la vida.</p>`,
  'Family Medicine': (title, last, clinics) =>
    `<p>${title} ${last} brinda atención primaria para familias en ${clinics}.</p>`,
  'Medical Oncology': (title, last, clinics) =>
    `<p>${title} ${last} trata tumores sólidos y coordina la atención oncológica en ${clinics}.</p>`,
  'Orthopedic Surgery': (title, last, clinics) =>
    `<p>${title} ${last} es ${title === 'La Dra.' ? 'cirujana ortopédica' : 'cirujano ortopédico'} en ${clinics}, donde trata fracturas, articulaciones y lesiones deportivas.</p>`,
  Cardiology: (title, last, clinics) =>
    `<p>${title} ${last} es ${title === 'La Dra.' ? 'una cardióloga' : 'un cardiólogo'} certificad${title === 'La Dra.' ? 'a' : 'o'} por la junta en ${clinics}, con enfoque en insuficiencia cardíaca y cardiología preventiva.</p>`,
  'Pediatric Emergency Medicine': (title, last, clinics) =>
    `<p>${title} ${last} brinda atención pediátrica urgente y de emergencia en ${clinics}.</p>`,
  ENT: (title, last, clinics) =>
    `<p>${title} ${last} es ${title === 'La Dra.' ? 'una otorrinolaringóloga' : 'un otorrinolaringólogo'} certificad${title === 'La Dra.' ? 'a' : 'o'} por la junta en ${clinics}, y atiende a adultos y niños con afecciones del oído, la nariz y la garganta.</p>`,
  'Emergency Medicine': (title, last, clinics) =>
    `<p>${title} ${last} es ${title === 'La Dra.' ? 'médica' : 'médico'} de emergencias en ${clinics} y atiende afecciones urgentes y emergentes.</p>`,
  Psychiatry: (title, last, clinics) =>
    `<p>${title} ${last} brinda atención de salud conductual en ${clinics}.</p>`,
  'Trauma Surgery': (title, last, clinics) =>
    `<p>${title} ${last} es ${title === 'La Dra.' ? 'cirujana' : 'cirujano'} de trauma y atención aguda en ${clinics}.</p>`,
  Pediatrics: (title, last, clinics) =>
    `<p>${title} ${last} es pediatra en ${clinics} y brinda atención a bebés, niños y adolescentes.</p>`,
  Neurology: (title, last, clinics) =>
    `<p>${title} ${last} es ${title === 'La Dra.' ? 'neuróloga' : 'neurólogo'} en ${clinics}, donde trata accidentes cerebrovasculares, dolores de cabeza y trastornos del movimiento.</p>`,
  'Obstetrics and Gynecology': (title, last, clinics) =>
    `<p>${title} ${last} ejerce obstetricia y ginecología en ${clinics}, lo que incluye atención prenatal.</p>`,
  Gastroenterology: (title, last, clinics) =>
    `<p>${title} ${last} brinda atención digestiva y endoscopia en ${clinics}.</p>`,
};

const SPECIALTY_ES = {
  'Urgent Care': 'Atención de urgencias',
  'Family Medicine': 'Medicina familiar',
  'Medical Oncology': 'Oncología médica',
  'Orthopedic Surgery': 'Cirugía ortopédica',
  Cardiology: 'Cardiología',
  'Pediatric Emergency Medicine': 'Medicina de Emergencias Pediátricas',
  ENT: 'Otorrinolaringología',
  'Emergency Medicine': 'Medicina de Emergencias',
  Psychiatry: 'Psiquiatría',
  'Trauma Surgery': 'Cirugía de Trauma',
  Pediatrics: 'Pediatría',
  Neurology: 'Neurología',
  'Obstetrics and Gynecology': 'Obstetricia y ginecología',
  Gastroenterology: 'Gastroenterología',
};

const LANGUAGE_ES = {
  English: 'Inglés',
  Spanish: 'Español',
  French: 'Francés',
};

function languagesEs(value) {
  return value
    .split(',')
    .map((part) => LANGUAGE_ES[part.trim()] || part.trim())
    .join(', ');
}

function credentialsEs(credentials, feminine) {
  return credentials
    .split(',')
    .map((part) => {
      const token = part.trim();
      if (token === 'MD') return feminine ? 'Médica' : 'Médico';
      return token;
    })
    .join(', ');
}

const CLINIC_PHONE = '414-777-7700';

const physicians = [
  ['E2D8BE5C-28C9-4D8D-8A54-7E8AD0EE9F9D', 'Alicia Broussard MD', 'Alicia Broussard', 'MD', 'Urgent Care', true, 'English, Spanish', ['E9CE4A1B-E608-4175-A08A-93EC4E79D888', 'DAA94ED7-1200-4D82-9810-3E356FE0146D', 'CCA5350B-2E2B-40D2-BDCB-E1A4BD54867C']],
  ['18C8E53B-FC1D-42A7-AED8-9606093821BD', 'Andre Baptiste MD', 'Andre Baptiste', 'MD', 'Family Medicine', false, 'English, Spanish', ['6D0D724C-883C-4234-AC88-948A82A1F66E', 'D5037FE8-2384-496A-944D-6FB92E69D214']],
  ['6937D8FE-5DB0-42B0-A6E3-101164D23381', 'Anita Chauvin MD', 'Anita Chauvin', 'MD', 'Medical Oncology', true, 'English, Spanish', ['9B592896-5898-43A5-BCFA-982D61AE8B85', '8EFD2996-31AC-4A76-A0B3-36B6CD50F715']],
  ['2ED27C52-728D-48EA-B525-9243D1A1474D', 'Brian LeBlanc MD', 'Brian LeBlanc', 'MD', 'Orthopedic Surgery', false, 'English, Spanish', ['C405E02E-1CD6-4439-B5A4-AA06769FC1CF', 'DAA94ED7-1200-4D82-9810-3E356FE0146D']],
  ['DC33E86F-1EB9-4D8D-BCB8-9D3D668D9A71', 'Camille Landry MD', 'Camille Landry', 'MD, FACC', 'Cardiology', true, 'English, Spanish', ['231694AE-748F-4782-A086-1287FD4C6B50', '1FB5EA21-6526-4E68-9AAD-1B0C2943886A']],
  ['8321651D-52FD-4065-B987-9ACB012E1EC9', 'Claire Fontenot MD', 'Claire Fontenot', 'MD', 'Urgent Care', true, 'English, Spanish', ['F8BB49F9-FB70-4431-8E6B-565D48EDD209', '5CFFA936-4BC9-4C40-970A-0CFDC2B69CC6']],
  ['7CA19BFB-5E15-4792-8C42-CDC00553EF45', 'Daniel Hebert MD', 'Daniel Hebert', 'MD', 'Pediatric Emergency Medicine', false, 'English, Spanish', ['4780B6B5-A6FC-4CC1-AB78-D203DFB0142A', 'CCA5350B-2E2B-40D2-BDCB-E1A4BD54867C']],
  ['1AEA0D8F-CE54-4E18-81D2-08CD40E03DE7', 'Dominic Lirette MD', 'Dominic Lirette', 'MD', 'ENT', false, 'English, Spanish, French', ['1FB5EA21-6526-4E68-9AAD-1B0C2943886A', '00383DA9-AEC7-4841-97B3-2B7E6D7832E9']],
  ['6EE2EB49-0629-4328-AADF-ECAA24DD69E9', 'Elise Boudreaux MD', 'Elise Boudreaux', 'MD', 'Emergency Medicine', true, 'English, Spanish', ['D5037FE8-2384-496A-944D-6FB92E69D214', 'FD72DBCE-1125-4A4D-88A0-6DA467974E47']],
  ['3BDECB7B-C26A-47BD-993D-6A1D06735C07', 'Gabrielle Moreau MD', 'Gabrielle Moreau', 'MD', 'ENT', true, 'English, Spanish', ['231694AE-748F-4782-A086-1287FD4C6B50', '8EFD2996-31AC-4A76-A0B3-36B6CD50F715']],
  ['B2602191-89E2-4052-BAAC-599F68A7D61C', 'Hannah Scott MD', 'Hannah Scott', 'MD', 'Urgent Care', true, 'English', ['EC73FC38-29CB-48A9-B92E-E3E2ADF5870B', 'CCA5350B-2E2B-40D2-BDCB-E1A4BD54867C']],
  ['0FB08437-2A65-48A7-B4E8-C77A7FDF9929', 'James Thibodeaux MD', 'James Thibodeaux', 'MD, FACC', 'Cardiology', false, 'English, Spanish', ['EC73FC38-29CB-48A9-B92E-E3E2ADF5870B', 'C405E02E-1CD6-4439-B5A4-AA06769FC1CF']],
  ['45BB232F-C5C3-47E7-A733-54D35437E56C', 'Joseph Allemand MD', 'Joseph Allemand', 'MD', 'Urgent Care', false, 'English, Spanish', ['4780B6B5-A6FC-4CC1-AB78-D203DFB0142A']],
  ['EAE7EFBC-70F0-4A36-97F0-12E328007151', 'Keisha Williams MD', 'Keisha Williams', 'MD', 'Emergency Medicine', true, 'English', ['6D0D724C-883C-4234-AC88-948A82A1F66E', 'FD72DBCE-1125-4A4D-88A0-6DA467974E47']],
  ['17670664-7606-4200-9077-19D04EDB1CC8', 'Kevin Romero MD', 'Kevin Romero', 'MD', 'Family Medicine', false, 'English, Spanish', ['00383DA9-AEC7-4841-97B3-2B7E6D7832E9', '1FB5EA21-6526-4E68-9AAD-1B0C2943886A']],
  ['F6A834BF-656F-4244-A77C-588CED053597', 'Leah Castillo MD', 'Leah Castillo', 'MD', 'Psychiatry', true, 'English, Spanish', ['9B592896-5898-43A5-BCFA-982D61AE8B85', 'F8BB49F9-FB70-4431-8E6B-565D48EDD209']],
  ['4629B22B-5BDF-4632-860D-32AC1922C311', 'Marcus Fontenot MD', 'Marcus Fontenot', 'MD', 'Orthopedic Surgery', false, 'English, Spanish', ['E9CE4A1B-E608-4175-A08A-93EC4E79D888', '8EFD2996-31AC-4A76-A0B3-36B6CD50F715']],
  ['EA2A312E-7576-4812-B337-75434C428AC9', 'Michael Tran MD', 'Michael Tran', 'MD', 'Urgent Care', false, 'English', ['FD72DBCE-1125-4A4D-88A0-6DA467974E47']],
  ['123966CA-21BE-4B75-B331-BDBB876B0BA1', 'Nicole Doucet MD', 'Nicole Doucet', 'MD', 'Medical Oncology', true, 'English, Spanish', ['231694AE-748F-4782-A086-1287FD4C6B50', '9B592896-5898-43A5-BCFA-982D61AE8B85']],
  ['D3BB7FD1-6EB6-404F-88AD-2BD0E2A95DBF', 'Omar Hassan MD', 'Omar Hassan', 'MD, FACS', 'Trauma Surgery', false, 'English', ['D5037FE8-2384-496A-944D-6FB92E69D214', '9B592896-5898-43A5-BCFA-982D61AE8B85']],
  ['081E7167-327B-44A2-A195-1525566BF9BD', 'Patrice Morales MD', 'Patrice Morales', 'MD', 'Urgent Care', true, 'English, Spanish', ['DAA94ED7-1200-4D82-9810-3E356FE0146D']],
  ['A1E83676-D629-464A-B490-5D7E62A116C1', 'Priya Raman MD', 'Priya Raman', 'MD, FAAP', 'Pediatrics', true, 'English', ['5CFFA936-4BC9-4C40-970A-0CFDC2B69CC6', 'F8BB49F9-FB70-4431-8E6B-565D48EDD209']],
  ['137F73FD-BFE6-41C9-99E0-0DC8BCF633F2', 'Renee Guidry MD', 'Renee Guidry', 'MD', 'Neurology', true, 'English, Spanish', ['CCA5350B-2E2B-40D2-BDCB-E1A4BD54867C', 'EC73FC38-29CB-48A9-B92E-E3E2ADF5870B']],
  ['FFAD9DD3-780F-46F8-A075-3003E3215D23', 'Sarah Melancon MD', 'Sarah Melancon', 'MD, FACOG', 'Obstetrics and Gynecology', true, 'English, Spanish', ['5CFFA936-4BC9-4C40-970A-0CFDC2B69CC6', 'C405E02E-1CD6-4439-B5A4-AA06769FC1CF']],
  ['7E2D326D-0B6D-45FC-BF39-363262811AB4', 'Tanya Ricard MD', 'Tanya Ricard', 'MD', 'Urgent Care', true, 'English, Spanish', ['C405E02E-1CD6-4439-B5A4-AA06769FC1CF', 'E9CE4A1B-E608-4175-A08A-93EC4E79D888']],
  ['84E0EEF6-ABC0-470D-B37B-92020BD85F1C', 'Thomas Nguyen MD', 'Thomas Nguyen', 'MD', 'Gastroenterology', false, 'English', ['1FB5EA21-6526-4E68-9AAD-1B0C2943886A', '9B592896-5898-43A5-BCFA-982D61AE8B85']],
];

function physicianBio(specialty, fullName, locIds, feminine, locale) {
  const last = lastName(fullName);
  if (locale === 'es') {
    const title = feminine ? 'La Dra.' : 'El Dr.';
    return SPECIALTY_BIO_ES[specialty](title, last, joinNames(clinicNames(locIds), 'y'));
  }
  return SPECIALTY_BIO_EN[specialty](last, joinNames(clinicNames(locIds), 'and'));
}

const physiciansByLocation = {};
for (const row of physicians) {
  for (const locId of row[7]) {
    physiciansByLocation[locId] ??= [];
    physiciansByLocation[locId].push({ id: row[0], name: row[1], displayName: row[1] });
  }
}

const locationResults = locations.map(([id, name, shortName, city, street, zip, lat, lng, parking, description]) => ({
  id,
  name,
  displayName: name,
  path: `${ROOT}/Locations/${name}`,
  locationTitle: f(name),
  locationShortName: f(shortName),
  locationDescription: f(description),
  streetAddress: f(street),
  city: f(city),
  state: f('WI'),
  postalCode: f(zip),
  phoneNumber: f('414-777-7700'),
  hoursText: f('Monday–Friday, 8 a.m. to 5 p.m. Confirm current hours before you visit.'),
  parkingInfo: f(parking),
  visitorInfo: f('<p>Check in at the front desk. Bring a photo ID and insurance card when possible.</p>'),
  locationType: f('Clinic'),
  hasEmergencyDepartment: f(''),
  offeredServices: { value: '', targetItems: [] },
  locationPhysicians: {
    value: (physiciansByLocation[id] ?? []).map((p) => `{${p.id}}`).join('|'),
    targetItems: physiciansByLocation[id] ?? [],
  },
}));

const physicianResults = physicians.map(([id, itemName, fullName, credentials, specialty, feminine, languages, locIds]) => ({
  id,
  name: itemName,
  displayName: itemName,
  path: `${ROOT}/Physicians/${itemName}`,
  physicianFullName: f(fullName),
  credentials: f(credentials),
  specialty: f(specialty),
  physicianBio: f(physicianBio(specialty, fullName, locIds, feminine, 'en')),
  physicianPhone: f(CLINIC_PHONE),
  languagesSpoken: f(languages),
  servingLocations: {
    value: locIds.map((locId) => `{${locId}}`).join('|'),
    targetItems: locIds.map((locId) => locById[locId]),
  },
}));

const services = [
  ['8485DE75-AFB9-4526-A066-0F4069C237DE', 'Behavioral Health', 'Behavioral Health', 'Inpatient and outpatient behavioral health evaluation and treatment for adults and older adults.', '<p>Behavioral health services include crisis evaluation, inpatient psychiatry, and geriatric behavioral health units.</p>'],
  ['ED58C7DF-16DA-407A-B7EF-1120E03E268A', 'Cancer Care', 'Cancer Care', 'Screening, medical oncology, and coordinated cancer treatment.', '<p>Cancer care includes screening, medical oncology, radiation oncology, and access to clinical trials.</p>'],
  ['17D7975C-9CFE-4049-A391-AB55AC56BA7A', 'Digestive Care', 'Digestive Care', 'Gastroenterology and digestive health services including endoscopy and hospital-based GI care.', '<p>Digestive care teams evaluate reflux, liver disease, inflammatory bowel disease, and other GI conditions.</p>'],
  ['6C472AC2-A525-4F7F-B803-C8F2A43CA481', 'Emergency Care', 'Emergency Care', 'Emergency evaluation and treatment for life-threatening illness and injury.', '<p>Emergency departments treat serious injuries, stroke, chest pain, and other urgent conditions that cannot wait.</p>'],
  ['06410E0F-2D12-44CE-9F11-6DD339FC6219', 'Heart and Vascular Care', 'Heart and Vascular Care', 'Cardiology, vascular, and cardiac catheterization services.', '<p>Heart and vascular teams diagnose and treat coronary disease, heart failure, arrhythmia, and vascular conditions.</p>'],
  ['552AD138-129D-44DB-A22D-58D86F414D59', 'Imaging', 'Imaging', 'X-ray, CT, MRI, ultrasound, and other diagnostic imaging.', '<p>Imaging services support diagnosis and treatment planning with X-ray, CT, MRI, ultrasound, and mammography where available.</p>'],
  ['70848C0C-3DBD-42A1-8DC6-214EEDFF96C5', 'Laboratory Services', 'Laboratory Services', 'Hospital and outpatient laboratory testing that supports diagnosis, treatment, and emergency care.', '<p>Laboratory teams process blood work, cultures, and other diagnostic tests.</p>'],
  ['69ACD90A-93E3-4D12-B457-681011723612', 'Neuroscience', 'Neuroscience', 'Brain, spine, stroke, and neurology care.', '<p>Neuroscience teams treat stroke, brain tumors, spine conditions, and movement disorders.</p>'],
  ['C33D2E4D-168B-4362-8BCC-B79641913BA4', 'Orthopedic Care', 'Orthopedic Care', 'Bone, joint, and sports medicine care for adults and children.', '<p>Orthopedic specialists treat fractures, joint replacement, spine conditions, and sports injuries.</p>'],
  ['7AB012D2-73EA-4924-B39C-6F2F79AF5975', 'Pediatric Care', 'Pediatric Care', 'Specialty and hospital care for infants, children, and adolescents.', '<p>Pediatric care covers wellness, complex chronic conditions, surgery, and emergency services designed for children.</p>'],
  ['A0F7E296-1D99-4D82-AF3A-A5461A62546F', 'Urgent Care', 'Urgent Care', 'Walk-in evaluation for non-life-threatening illnesses and injuries.', '<p>Urgent care clinics treat sprains, infections, minor injuries, and illnesses that need prompt attention but are not emergencies.</p>'],
  ['09F95950-9159-4E73-991E-E1642A524AD2', 'Womens Health', "Women's Health", 'Obstetrics, gynecology, breast care, and maternity services.', '<p>Women\'s health programs include prenatal care, labor and delivery, gynecology, and breast health.</p>'],
];

const departmentResults = services.map(([id, itemName, title, shortDescription, detail]) => ({
  id,
  name: itemName,
  displayName: itemName,
  path: `${ROOT}/Services/${itemName}`,
  serviceTitle: f(title),
  serviceShortDescription: f(shortDescription),
  serviceDetail: f(detail),
  offeredAtLocations: { value: '', targetItems: [] },
}));

const mockDir = join(process.cwd(), 'lib', 'sitecore', 'mock');

writeFileSync(
  join(mockDir, 'locations.json'),
  JSON.stringify({ item: { id: '1DA85524-C329-4D68-9377-429ED4404A90', name: 'Locations', children: { results: locationResults } } }, null, 2)
);
writeFileSync(
  join(mockDir, 'physicians.json'),
  JSON.stringify({ item: { id: '6CD3FB43-02D7-4194-8A37-8AC2CD147A28', name: 'Physicians', children: { results: physicianResults } } }, null, 2)
);
writeFileSync(
  join(mockDir, 'departments.json'),
  JSON.stringify({ item: { id: '74F068FE-576A-4904-8EEA-86D5EC721111', name: 'Services', children: { results: departmentResults } } }, null, 2)
);

const physicianEs = Object.fromEntries(
  physicians.map(([id, , fullName, credentials, specialty, feminine, languages, locIds]) => {
    const overlay = {
      Credentials: credentialsEs(credentials, feminine),
      Specialty: SPECIALTY_ES[specialty],
      PhysicianBio: physicianBio(specialty, fullName, locIds, feminine, 'es'),
      LanguagesSpoken: languagesEs(languages),
    };
    if (fullName === 'Andre Baptiste') overlay.PhysicianFullName = 'André Baptiste';
    if (fullName === 'Sarah Melancon') overlay.PhysicianFullName = 'Sara Melancon';
    return [id, overlay];
  })
);

const locationEs = Object.fromEntries(
  locations.map(([id, name, shortName, city, , , , , parking]) => [
    id,
    {
      LocationType: 'Clínica',
      HoursText: 'Lunes a viernes, 8 a.m. a 5 p.m. Confirme el horario actual antes de su visita.',
      ParkingInfo: parking.includes('Street')
        ? 'Hay estacionamiento en la calle y en el lote cerca de la clínica.'
        : 'Hay estacionamiento gratuito en el lugar.',
      VisitorInfo: '<p>Regístrese en la recepción. Traiga una identificación con foto y, si es posible, su tarjeta de seguro.</p>',
      LocationDescription: `<p>${name} es una clínica de Froedtert &amp; MCW Community Physicians en ${city}, Wisconsin.</p>`,
      City: city,
      LocationShortName: shortName,
    },
  ])
);

const departmentEs = {
  '8485DE75-AFB9-4526-A066-0F4069C237DE': { ServiceTitle: 'Salud conductual', ServiceShortDescription: 'Evaluación y tratamiento de salud conductual para pacientes hospitalizados y ambulatorios, para adultos y adultos mayores.', ServiceDetail: '<p>Los servicios de salud conductual incluyen evaluación de crisis, psiquiatría hospitalaria y unidades de salud conductual geriátrica.</p>' },
  'ED58C7DF-16DA-407A-B7EF-1120E03E268A': { ServiceTitle: 'Atención del cáncer', ServiceShortDescription: 'Detección, oncología médica y tratamiento coordinado del cáncer.', ServiceDetail: '<p>La atención del cáncer incluye detección, oncología médica, oncología radioterápica y acceso a ensayos clínicos.</p>' },
  '17D7975C-9CFE-4049-A391-AB55AC56BA7A': { ServiceTitle: 'Atención digestiva', ServiceShortDescription: 'Servicios de gastroenterología y salud digestiva, incluyendo endoscopia y atención gastrointestinal hospitalaria.', ServiceDetail: '<p>Los equipos de atención digestiva evalúan el reflujo, la enfermedad hepática, la enfermedad inflamatoria intestinal y otras afecciones gastrointestinales.</p>' },
  '6C472AC2-A525-4F7F-B803-C8F2A43CA481': { ServiceTitle: 'Atención de Emergencias', ServiceShortDescription: 'Evaluación y tratamiento de emergencias para enfermedades y lesiones potencialmente mortales.', ServiceDetail: '<p>Los departamentos de emergencias tratan lesiones graves, accidentes cerebrovasculares, dolor en el pecho y otras condiciones urgentes que no pueden esperar.</p>' },
  '06410E0F-2D12-44CE-9F11-6DD339FC6219': { ServiceTitle: 'Atención del corazón y vascular', ServiceShortDescription: 'Servicios de cardiología, vasculares y de cateterismo cardíaco.', ServiceDetail: '<p>Los equipos de corazón y vascular diagnostican y tratan la enfermedad coronaria, la insuficiencia cardíaca, las arritmias y las afecciones vasculares.</p>' },
  '552AD138-129D-44DB-A22D-58D86F414D59': { ServiceTitle: 'Imagenología', ServiceShortDescription: 'Radiografías, tomografías computarizadas, resonancias magnéticas, ecografías y otros estudios de diagnóstico por imágenes.', ServiceDetail: '<p>Los servicios de imagenología apoyan el diagnóstico y la planificación del tratamiento.</p>' },
  '70848C0C-3DBD-42A1-8DC6-214EEDFF96C5': { ServiceTitle: 'Servicios de laboratorio', ServiceShortDescription: 'Pruebas de laboratorio hospitalarias y ambulatorias que apoyan el diagnóstico, el tratamiento y la atención de urgencias.', ServiceDetail: '<p>Los equipos de laboratorio procesan análisis de sangre, cultivos y otras pruebas diagnósticas.</p>' },
  '69ACD90A-93E3-4D12-B457-681011723612': { ServiceTitle: 'Neurociencia', ServiceShortDescription: 'Atención para el cerebro, la columna, los accidentes cerebrovasculares y la neurología.', ServiceDetail: '<p>Los equipos de neurociencia tratan accidentes cerebrovasculares, tumores cerebrales, afecciones de la columna y trastornos del movimiento.</p>' },
  'C33D2E4D-168B-4362-8BCC-B79641913BA4': { ServiceTitle: 'Atención ortopédica', ServiceShortDescription: 'Atención de huesos, articulaciones y medicina deportiva para adultos y niños.', ServiceDetail: '<p>Los especialistas en ortopedia tratan fracturas, reemplazo articular, afecciones de la columna y lesiones deportivas.</p>' },
  '7AB012D2-73EA-4924-B39C-6F2F79AF5975': { ServiceTitle: 'Atención pediátrica', ServiceShortDescription: 'Atención especializada y hospitalaria para bebés, niños y adolescentes.', ServiceDetail: '<p>La atención pediátrica abarca bienestar, afecciones crónicas complejas, cirugía y servicios de emergencia diseñados para niños.</p>' },
  'A0F7E296-1D99-4D82-AF3A-A5461A62546F': { ServiceTitle: 'Atención de urgencias', ServiceShortDescription: 'Evaluación sin cita previa para enfermedades y lesiones que no ponen en peligro la vida.', ServiceDetail: '<p>Las clínicas de atención de urgencias tratan esguinces, infecciones, lesiones menores y enfermedades que necesitan atención rápida, pero que no son emergencias.</p>' },
  '09F95950-9159-4E73-991E-E1642A524AD2': { ServiceTitle: 'Salud de la mujer', ServiceShortDescription: 'Obstetricia, ginecología, atención mamaria y servicios de maternidad.', ServiceDetail: '<p>Los programas de salud de la mujer incluyen atención prenatal, trabajo de parto y parto, ginecología y salud mamaria.</p>' },
};

const overlaySource = `type FieldOverlay = Record<string, string>;

export const PHYSICIAN_ES_OVERLAY: Record<string, FieldOverlay> = ${JSON.stringify(physicianEs, null, 2)};

export const LOCATION_ES_OVERLAY: Record<string, FieldOverlay> = ${JSON.stringify(locationEs, null, 2)};

export const DEPARTMENT_ES_OVERLAY: Record<string, FieldOverlay> = ${JSON.stringify(departmentEs, null, 2)};
`;

writeFileSync(join(mockDir, 'overlays-es-co.ts'), overlaySource);
console.log(`Wrote ${locationResults.length} locations, ${physicianResults.length} physicians, ${departmentResults.length} services, plus es-CO overlays`);
