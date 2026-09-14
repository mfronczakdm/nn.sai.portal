import { writeFileSync } from 'fs';
import { join } from 'path';

const f = (value) => ({ value });
const ml = (ids, targets) => ({ value: ids.join('|'), targetItems: targets });

const locations = [
  {
    id: 'EFEAC293-2BF4-4516-873D-4EAC1F998474',
    name: 'East Jefferson General Hospital',
    displayName: 'East Jefferson General Hospital',
    path: '/sitecore/content/lcmc/lcmc/Data/Locations/East Jefferson General Hospital',
    locationTitle: f('East Jefferson General Hospital'),
    locationShortName: f('East Jefferson'),
    locationDescription: f(
      '<p>East Jefferson General Hospital is an academic hospital in Metairie serving Jefferson Parish with emergency, specialty, and inpatient care.</p>'
    ),
    streetAddress: f('4200 Houma Blvd.'),
    city: f('Metairie'),
    state: f('LA'),
    postalCode: f('70006'),
    phoneNumber: f('504-503-4000'),
    hoursText: f('Hospital open 24 hours. Emergency department open 24/7.'),
    parkingInfo: f(
      'On-site visitor parking is available around the main campus. Valet and garage options are offered during weekday hours.'
    ),
    visitorInfo: f(
      '<p>Check in at the main lobby information desk. Visiting hours vary by unit; ask staff for current guidelines.</p>'
    ),
    locationType: f('Hospital'),
    hasEmergencyDepartment: f('1'),
    offeredServices: ml(
      [
        '{21FB8DB6-1732-4A44-8BEC-E39C52C1961A}',
        '{872D3FA1-DBC7-4ABF-9544-5A668C0D08B1}',
        '{72C9C518-0BB1-4BB0-9319-A38875217CD3}',
        '{D2B7F3AD-6DF9-4B0D-AB3B-58AD3669DB5B}',
        '{168532F3-37CE-4045-A84C-F0672164EEBE}',
        '{2C7094F3-7E17-4A5F-8E1F-68830FDC81B6}',
        '{EF79ADEF-3A78-4992-B297-04B3447C9CF4}',
        '{DB0C3D51-6686-4387-89A4-97B0AB5E440E}',
        '{DBD2AAB8-F409-4288-9EE0-5CFD676A1C66}',
        '{B491C6F0-3A49-4E3A-B94E-815639B35B92}',
      ],
      []
    ),
    locationPhysicians: ml(
      ['{12B533A6-8DF8-4D80-B466-111A5B26B8E4}', '{C176B05D-10A5-49C8-A980-9380046CE24F}'],
      [
        { id: '12B533A6-8DF8-4D80-B466-111A5B26B8E4', name: 'Camille Landry MD', displayName: 'Camille Landry MD' },
        { id: 'C176B05D-10A5-49C8-A980-9380046CE24F', name: 'Anita Chauvin MD', displayName: 'Anita Chauvin MD' },
      ]
    ),
  },
  {
    id: 'C6A3CDB7-8708-4C60-861B-009B7FB9E786',
    name: 'Lakeside Hospital',
    displayName: 'Lakeside Hospital',
    path: '/sitecore/content/lcmc/lcmc/Data/Locations/Lakeside Hospital',
    locationTitle: f('Lakeside Hospital'),
    locationShortName: f('Lakeside'),
    locationDescription: f(
      '<p>Lakeside Hospital provides hospital care in Metairie as part of the LCMC Health nonprofit system.</p>'
    ),
    streetAddress: f('4700 S. I-10 Service Rd. W'),
    city: f('Metairie'),
    state: f('LA'),
    postalCode: f('70001'),
    phoneNumber: f('504-780-8282'),
    hoursText: f('Hospital open 24 hours. Emergency department open 24/7.'),
    parkingInfo: f('Free surface parking is available on the Lakeside campus near the main entrance.'),
    visitorInfo: f(
      '<p>Visitors should enter through the main lobby. Confirm current visiting hours with the nursing unit.</p>'
    ),
    locationType: f('Hospital'),
    hasEmergencyDepartment: f('1'),
    offeredServices: ml(
      [
        '{21FB8DB6-1732-4A44-8BEC-E39C52C1961A}',
        '{D2B7F3AD-6DF9-4B0D-AB3B-58AD3669DB5B}',
        '{2C7094F3-7E17-4A5F-8E1F-68830FDC81B6}',
        '{EF79ADEF-3A78-4992-B297-04B3447C9CF4}',
      ],
      []
    ),
    locationPhysicians: ml(
      ['{B257CB21-E4C2-44BA-8C70-28D893D45C97}', '{EED3B2C7-4DEF-4F96-B129-46E86DF0559D}'],
      []
    ),
  },
  {
    id: 'C5D069A3-C8BB-40FE-89BE-D7F9D5C9614F',
    name: 'Lakeview Hospital',
    displayName: 'Lakeview Hospital',
    path: '/sitecore/content/lcmc/lcmc/Data/Locations/Lakeview Hospital',
    locationTitle: f('Lakeview Hospital'),
    locationShortName: f('Lakeview'),
    locationDescription: f(
      '<p>Lakeview Hospital has served St. Tammany Parish since 1977 with emergency, heart, stroke, and hospital care.</p>'
    ),
    streetAddress: f('95 Judge Tanner Blvd.'),
    city: f('Covington'),
    state: f('LA'),
    postalCode: f('70433'),
    phoneNumber: f('985-867-3800'),
    hoursText: f('Hospital open 24 hours. Emergency department open 24/7.'),
    parkingInfo: f('Visitor parking is available adjacent to the main entrance and emergency drive.'),
    visitorInfo: f(
      '<p>Northshore families can check in at the main lobby. Ask the information desk for unit-specific visiting hours.</p>'
    ),
    locationType: f('Hospital'),
    hasEmergencyDepartment: f('1'),
    offeredServices: ml(
      [
        '{21FB8DB6-1732-4A44-8BEC-E39C52C1961A}',
        '{872D3FA1-DBC7-4ABF-9544-5A668C0D08B1}',
        '{168532F3-37CE-4045-A84C-F0672164EEBE}',
        '{2C7094F3-7E17-4A5F-8E1F-68830FDC81B6}',
        '{EF79ADEF-3A78-4992-B297-04B3447C9CF4}',
        '{DBD2AAB8-F409-4288-9EE0-5CFD676A1C66}',
      ],
      []
    ),
    locationPhysicians: ml(
      ['{3649DA30-9C2F-445B-9B40-AD91F25276DC}', '{4A1FED30-0480-4CF5-9DCC-4149B3164046}'],
      []
    ),
  },
  {
    id: '764E7C6F-75BB-49EE-B304-4E5A0E6F3DAC',
    name: 'LCMC Health Chalmette Urgent Care',
    displayName: 'LCMC Health Chalmette Urgent Care',
    path: '/sitecore/content/lcmc/lcmc/Data/Locations/LCMC Health Chalmette Urgent Care',
    locationTitle: f('LCMC Health Chalmette Urgent Care'),
    locationShortName: f('Chalmette Urgent Care'),
    locationDescription: f(
      '<p>Walk-in urgent care for non-life-threatening illnesses and injuries in St. Bernard Parish.</p>'
    ),
    streetAddress: f('8100 Judge Perez Drive, Suite 4'),
    city: f('Chalmette'),
    state: f('LA'),
    postalCode: f('70043'),
    phoneNumber: f('504-345-1330'),
    hoursText: f('Walk-in hours typically 8 a.m. to 8 p.m. daily. Confirm current hours before you visit.'),
    parkingInfo: f('Free surface parking is available in front of the clinic.'),
    visitorInfo: f(
      '<p>No appointment is required. Patients should bring a photo ID and insurance card when possible.</p>'
    ),
    locationType: f('Urgent Care'),
    hasEmergencyDepartment: f(''),
    offeredServices: ml(['{B69F3F30-2DFD-4668-ACED-3CEE2B15273D}', '{2C7094F3-7E17-4A5F-8E1F-68830FDC81B6}'], []),
    locationPhysicians: ml(['{24F0A42F-B1A5-43C2-9E26-E63E63E07162}'], []),
  },
  {
    id: 'A2D66593-0A5D-4EE4-82D3-FA88A59C71FA',
    name: 'LCMC Health Clearview Urgent Care',
    displayName: 'LCMC Health Clearview Urgent Care',
    path: '/sitecore/content/lcmc/lcmc/Data/Locations/LCMC Health Clearview Urgent Care',
    locationTitle: f('LCMC Health Clearview Urgent Care'),
    locationShortName: f('Clearview Urgent Care'),
    locationDescription: f(
      '<p>Convenient walk-in urgent care near Clearview Parkway for everyday illnesses and minor injuries.</p>'
    ),
    streetAddress: f('1105 S. Clearview Parkway'),
    city: f('New Orleans'),
    state: f('LA'),
    postalCode: f('70121'),
    phoneNumber: f('504-676-5550'),
    hoursText: f('Walk-in hours typically 8 a.m. to 8 p.m. daily. Confirm current hours before you visit.'),
    parkingInfo: f('Free parking is available in the shopping center lot.'),
    visitorInfo: f(
      '<p>Walk-ins are welcome. For chest pain, severe bleeding, or stroke symptoms, go to the nearest emergency department.</p>'
    ),
    locationType: f('Urgent Care'),
    hasEmergencyDepartment: f(''),
    offeredServices: ml(['{B69F3F30-2DFD-4668-ACED-3CEE2B15273D}', '{2C7094F3-7E17-4A5F-8E1F-68830FDC81B6}'], []),
    locationPhysicians: ml(['{47043241-18E6-4A37-8F69-4108CDBD78A2}'], []),
  },
  {
    id: 'F1E5353C-A2B7-47F0-9570-85B8FD6D9FED',
    name: 'LCMC Health Gretna Urgent Care',
    displayName: 'LCMC Health Gretna Urgent Care',
    path: '/sitecore/content/lcmc/lcmc/Data/Locations/LCMC Health Gretna Urgent Care',
    locationTitle: f('LCMC Health Gretna Urgent Care'),
    locationShortName: f('Gretna Urgent Care'),
    locationDescription: f(
      '<p>Westbank walk-in urgent care for illnesses and injuries that need prompt attention but are not emergencies.</p>'
    ),
    streetAddress: f('2600 Belle Chasse Hwy., Suite B-2'),
    city: f('Gretna'),
    state: f('LA'),
    postalCode: f('70056'),
    phoneNumber: f('504-349-6747'),
    hoursText: f('Walk-in hours typically 8 a.m. to 8 p.m. daily. Confirm current hours before you visit.'),
    parkingInfo: f('Free parking is available in the Belle Chasse Highway lot.'),
    visitorInfo: f('<p>No appointment required. Bring a photo ID and insurance card when possible.</p>'),
    locationType: f('Urgent Care'),
    hasEmergencyDepartment: f(''),
    offeredServices: ml(['{B69F3F30-2DFD-4668-ACED-3CEE2B15273D}', '{2C7094F3-7E17-4A5F-8E1F-68830FDC81B6}'], []),
    locationPhysicians: ml(['{3248558F-44BA-478E-97FE-80E84A000603}'], []),
  },
  {
    id: '57D504EA-804B-4166-84EB-CE298A6853F0',
    name: 'LCMC Health Kenner Urgent Care',
    displayName: 'LCMC Health Kenner Urgent Care',
    path: '/sitecore/content/lcmc/lcmc/Data/Locations/LCMC Health Kenner Urgent Care',
    locationTitle: f('LCMC Health Kenner Urgent Care'),
    locationShortName: f('Kenner Urgent Care'),
    locationDescription: f(
      '<p>Walk-in urgent care in Kenner for common illnesses and minor injuries that need timely attention.</p>'
    ),
    streetAddress: f('708 W. Esplanade Ave.'),
    city: f('Kenner'),
    state: f('LA'),
    postalCode: f('70065'),
    phoneNumber: f('504-389-6600'),
    hoursText: f('Walk-in hours typically 8 a.m. to 8 p.m. daily. Confirm current hours before you visit.'),
    parkingInfo: f('Free parking is available in front of the clinic on West Esplanade.'),
    visitorInfo: f(
      '<p>Walk-ins are welcome. Use the nearest emergency department for life-threatening symptoms.</p>'
    ),
    locationType: f('Urgent Care'),
    hasEmergencyDepartment: f(''),
    offeredServices: ml(['{B69F3F30-2DFD-4668-ACED-3CEE2B15273D}', '{2C7094F3-7E17-4A5F-8E1F-68830FDC81B6}'], []),
    locationPhysicians: ml(['{6877B226-0CC6-408C-9E51-E2C5D2351A61}'], []),
  },
  {
    id: '53907833-68C9-4A0D-A500-FAD77D27FBD0',
    name: 'LCMC Health Lakeview Urgent Care',
    displayName: 'LCMC Health Lakeview Urgent Care',
    path: '/sitecore/content/lcmc/lcmc/Data/Locations/LCMC Health Lakeview Urgent Care',
    locationTitle: f('LCMC Health Lakeview Urgent Care'),
    locationShortName: f('Lakeview Urgent Care'),
    locationDescription: f(
      '<p>Neighborhood walk-in urgent care on Harrison Avenue in Lakeview for non-life-threatening needs.</p>'
    ),
    streetAddress: f('826 Harrison Ave., Suite A'),
    city: f('New Orleans'),
    state: f('LA'),
    postalCode: f('70124'),
    phoneNumber: f('504-309-7108'),
    hoursText: f('Walk-in hours typically 8 a.m. to 8 p.m. daily. Confirm current hours before you visit.'),
    parkingInfo: f('Street and lot parking are available along Harrison Avenue.'),
    visitorInfo: f('<p>No appointment required. Bring a photo ID and insurance card when possible.</p>'),
    locationType: f('Urgent Care'),
    hasEmergencyDepartment: f(''),
    offeredServices: ml(['{B69F3F30-2DFD-4668-ACED-3CEE2B15273D}', '{2C7094F3-7E17-4A5F-8E1F-68830FDC81B6}'], []),
    locationPhysicians: ml(['{1B865C3A-A093-4A6D-8DB8-554028EB662F}'], []),
  },
  {
    id: '4C15C596-29EB-46C8-BD93-53E7DEBA82E0',
    name: 'LCMC Health Luling Urgent Care',
    displayName: 'LCMC Health Luling Urgent Care',
    path: '/sitecore/content/lcmc/lcmc/Data/Locations/LCMC Health Luling Urgent Care',
    locationTitle: f('LCMC Health Luling Urgent Care'),
    locationShortName: f('Luling Urgent Care'),
    locationDescription: f('<p>Walk-in urgent care serving St. Charles Parish and the Luling community.</p>'),
    streetAddress: f('13855 River Road'),
    city: f('Luling'),
    state: f('LA'),
    postalCode: f('70070'),
    phoneNumber: f('504-702-4862'),
    hoursText: f(
      'Walk-in hours typically 8 a.m. to 8 p.m. daily. Confirm current hours on lcmchealth.org before you visit.'
    ),
    parkingInfo: f('Free surface parking is available at the clinic.'),
    visitorInfo: f(
      '<p>Confirm the current Luling clinic address and hours on lcmchealth.org. Use an emergency department for life-threatening symptoms.</p>'
    ),
    locationType: f('Urgent Care'),
    hasEmergencyDepartment: f(''),
    offeredServices: ml(['{B69F3F30-2DFD-4668-ACED-3CEE2B15273D}', '{2C7094F3-7E17-4A5F-8E1F-68830FDC81B6}'], []),
    locationPhysicians: ml(['{65C2FDCF-7791-43DA-8354-7030BB6CD025}'], []),
  },
  {
    id: 'EBC36A98-6CF2-477A-827A-7BEFEB2FE5A8',
    name: 'LCMC Health Marrero Urgent Care',
    displayName: 'LCMC Health Marrero Urgent Care',
    path: '/sitecore/content/lcmc/lcmc/Data/Locations/LCMC Health Marrero Urgent Care',
    locationTitle: f('LCMC Health Marrero Urgent Care'),
    locationShortName: f('Marrero Urgent Care'),
    locationDescription: f(
      '<p>Westbank walk-in urgent care on Lapalco Boulevard for everyday illnesses and minor injuries.</p>'
    ),
    streetAddress: f('4925 Lapalco Blvd., Suite 200'),
    city: f('Marrero'),
    state: f('LA'),
    postalCode: f('70072'),
    phoneNumber: f('504-301-2825'),
    hoursText: f('Walk-in hours typically 8 a.m. to 8 p.m. daily. Confirm current hours before you visit.'),
    parkingInfo: f('Free parking is available in the Lapalco Boulevard shopping center lot.'),
    visitorInfo: f(
      '<p>Walk-ins are welcome. West Jefferson Medical Center emergency is nearby for more serious conditions.</p>'
    ),
    locationType: f('Urgent Care'),
    hasEmergencyDepartment: f(''),
    offeredServices: ml(['{B69F3F30-2DFD-4668-ACED-3CEE2B15273D}', '{2C7094F3-7E17-4A5F-8E1F-68830FDC81B6}'], []),
    locationPhysicians: ml(['{74789E69-47D3-463D-AEAC-CEA3F20A5647}'], []),
  },
  {
    id: '9E0B2413-44E2-488E-9346-39243F87E342',
    name: 'LCMC Health Uptown Urgent Care',
    displayName: 'LCMC Health Uptown Urgent Care',
    path: '/sitecore/content/lcmc/lcmc/Data/Locations/LCMC Health Uptown Urgent Care',
    locationTitle: f('LCMC Health Uptown Urgent Care'),
    locationShortName: f('Uptown Urgent Care'),
    locationDescription: f(
      '<p>Walk-in urgent care on Magazine Street for non-life-threatening illnesses and injuries in Uptown New Orleans.</p>'
    ),
    streetAddress: f('5800 Magazine St.'),
    city: f('New Orleans'),
    state: f('LA'),
    postalCode: f('70115'),
    phoneNumber: f('504-900-3160'),
    hoursText: f('Walk-in hours typically 8 a.m. to 8 p.m. daily. Confirm current hours before you visit.'),
    parkingInfo: f('Limited street parking and nearby lot parking are available on Magazine Street.'),
    visitorInfo: f(
      '<p>No appointment required. Touro and Manning Family Children\'s are nearby if a higher level of care is needed.</p>'
    ),
    locationType: f('Urgent Care'),
    hasEmergencyDepartment: f(''),
    offeredServices: ml(['{B69F3F30-2DFD-4668-ACED-3CEE2B15273D}', '{2C7094F3-7E17-4A5F-8E1F-68830FDC81B6}'], []),
    locationPhysicians: ml(['{3188F21C-974C-43D5-8722-C676D09A8293}'], []),
  },
  {
    id: '6B468248-C9D1-4DD0-9E8D-44B477FDB96C',
    name: 'Manning Family Childrens',
    displayName: "Manning Family Children's",
    path: '/sitecore/content/lcmc/lcmc/Data/Locations/Manning Family Childrens',
    locationTitle: f("Manning Family Children's"),
    locationShortName: f("Manning Children's"),
    locationDescription: f(
      "<p>Manning Family Children's is the LCMC Health pediatric hospital in Uptown New Orleans, caring for infants through adolescents.</p>"
    ),
    streetAddress: f('200 Henry Clay Ave.'),
    city: f('New Orleans'),
    state: f('LA'),
    postalCode: f('70118'),
    phoneNumber: f('504-899-9511'),
    hoursText: f('Hospital open 24 hours. Pediatric emergency department open 24/7.'),
    parkingInfo: f(
      'Garage and street parking are available near the Henry Clay campus. Family valet is offered during posted hours.'
    ),
    visitorInfo: f(
      '<p>One or two caregivers may stay with a child. Check with the unit for sibling and visitor guidelines.</p>'
    ),
    locationType: f('Hospital'),
    hasEmergencyDepartment: f('1'),
    offeredServices: ml(
      [
        '{BEEA85BD-08B1-40E3-AAD6-7600A802F71F}',
        '{21FB8DB6-1732-4A44-8BEC-E39C52C1961A}',
        '{2C7094F3-7E17-4A5F-8E1F-68830FDC81B6}',
        '{EF79ADEF-3A78-4992-B297-04B3447C9CF4}',
        '{D2B7F3AD-6DF9-4B0D-AB3B-58AD3669DB5B}',
      ],
      []
    ),
    locationPhysicians: ml(
      ['{BC61F2D9-4655-42D8-867B-41407505B6DC}', '{49B7EB4F-7C96-4D02-BA27-99FF3F2C75E2}'],
      []
    ),
  },
  {
    id: '6766AE91-0553-4034-B328-2327CB54AB85',
    name: 'New Orleans East Hospital',
    displayName: 'New Orleans East Hospital',
    path: '/sitecore/content/lcmc/lcmc/Data/Locations/New Orleans East Hospital',
    locationTitle: f('New Orleans East Hospital'),
    locationShortName: f('NOEH'),
    locationDescription: f(
      '<p>New Orleans East Hospital provides community-based hospital and emergency care for patients and families in New Orleans East.</p>'
    ),
    streetAddress: f('5620 Read Blvd.'),
    city: f('New Orleans'),
    state: f('LA'),
    postalCode: f('70127'),
    phoneNumber: f('504-592-6600'),
    hoursText: f('Hospital open 24 hours. Emergency department open 24/7.'),
    parkingInfo: f('Free visitor parking is available on the Read Boulevard campus near the main entrance.'),
    visitorInfo: f(
      '<p>Stop at the information desk in the main lobby for a visitor badge and current unit hours.</p>'
    ),
    locationType: f('Hospital'),
    hasEmergencyDepartment: f('1'),
    offeredServices: ml(
      [
        '{21FB8DB6-1732-4A44-8BEC-E39C52C1961A}',
        '{168532F3-37CE-4045-A84C-F0672164EEBE}',
        '{2C7094F3-7E17-4A5F-8E1F-68830FDC81B6}',
        '{EF79ADEF-3A78-4992-B297-04B3447C9CF4}',
        '{DBD2AAB8-F409-4288-9EE0-5CFD676A1C66}',
      ],
      []
    ),
    locationPhysicians: ml(
      ['{9BC27AE8-3D1C-468A-8A1D-336EDB3F11D9}', '{B58527CE-BA45-4C9E-B506-D0A3D75AC996}'],
      []
    ),
  },
  {
    id: '063FFD1D-6681-4DFC-8A7A-504EA903090F',
    name: 'Touro',
    displayName: 'Touro',
    path: '/sitecore/content/lcmc/lcmc/Data/Locations/Touro',
    locationTitle: f('Touro'),
    locationShortName: f('Touro'),
    locationDescription: f(
      '<p>Touro is a community-based nonprofit hospital with generations of service to Uptown and New Orleans families.</p>'
    ),
    streetAddress: f('1401 Foucher St.'),
    city: f('New Orleans'),
    state: f('LA'),
    postalCode: f('70115'),
    phoneNumber: f('504-897-7011'),
    hoursText: f('Hospital open 24 hours. Emergency department open 24/7.'),
    parkingInfo: f('Garage parking is available on the Foucher Street campus. Valet is offered during weekday hours.'),
    visitorInfo: f(
      '<p>Enter through the main lobby on Foucher Street. Visiting hours vary by unit; please confirm with staff.</p>'
    ),
    locationType: f('Hospital'),
    hasEmergencyDepartment: f('1'),
    offeredServices: ml(
      [
        '{21FB8DB6-1732-4A44-8BEC-E39C52C1961A}',
        '{872D3FA1-DBC7-4ABF-9544-5A668C0D08B1}',
        '{72C9C518-0BB1-4BB0-9319-A38875217CD3}',
        '{D2B7F3AD-6DF9-4B0D-AB3B-58AD3669DB5B}',
        '{168532F3-37CE-4045-A84C-F0672164EEBE}',
        '{2C7094F3-7E17-4A5F-8E1F-68830FDC81B6}',
        '{EF79ADEF-3A78-4992-B297-04B3447C9CF4}',
        '{DBD2AAB8-F409-4288-9EE0-5CFD676A1C66}',
        '{B491C6F0-3A49-4E3A-B94E-815639B35B92}',
      ],
      []
    ),
    locationPhysicians: ml(
      ['{F42ECEC4-C3D2-43BA-8FF1-2BA640F66251}', '{F74FE325-06CA-4905-88E7-462F02FD74EA}'],
      []
    ),
  },
  {
    id: 'E8F05084-0214-424F-B1D4-B5B562499F5C',
    name: 'University Medical Center New Orleans',
    displayName: 'University Medical Center New Orleans',
    path: '/sitecore/content/lcmc/lcmc/Data/Locations/University Medical Center New Orleans',
    locationTitle: f('University Medical Center New Orleans'),
    locationShortName: f('UMCNO'),
    locationDescription: f(
      "<p>University Medical Center New Orleans is the academic medical center of LCMC Health and the region's Level I Trauma Center.</p>"
    ),
    streetAddress: f('2000 Canal St.'),
    city: f('New Orleans'),
    state: f('LA'),
    postalCode: f('70112'),
    phoneNumber: f('504-702-3000'),
    hoursText: f('Hospital open 24 hours. Emergency and trauma services open 24/7.'),
    parkingInfo: f(
      'Patient and visitor parking is available in the Canal Street garage. Follow signs for Emergency and Main Entrance.'
    ),
    visitorInfo: f(
      '<p>All visitors check in at the main lobby. Trauma and ICU units have additional screening and hour limits.</p>'
    ),
    locationType: f('Hospital'),
    hasEmergencyDepartment: f('1'),
    offeredServices: ml(
      [
        '{21FB8DB6-1732-4A44-8BEC-E39C52C1961A}',
        '{872D3FA1-DBC7-4ABF-9544-5A668C0D08B1}',
        '{72C9C518-0BB1-4BB0-9319-A38875217CD3}',
        '{2C7094F3-7E17-4A5F-8E1F-68830FDC81B6}',
        '{EF79ADEF-3A78-4992-B297-04B3447C9CF4}',
        '{DB0C3D51-6686-4387-89A4-97B0AB5E440E}',
        '{DBD2AAB8-F409-4288-9EE0-5CFD676A1C66}',
        '{B491C6F0-3A49-4E3A-B94E-815639B35B92}',
      ],
      []
    ),
    locationPhysicians: ml(
      ['{79C12EE1-19F2-48EB-89CF-3473364D2488}', '{B7224F06-A404-40C9-8F72-8A1FDD04C472}'],
      []
    ),
  },
  {
    id: '35C77454-5FB8-460D-BC12-299F7B31DE5A',
    name: 'West Jefferson Medical Center',
    displayName: 'West Jefferson Medical Center',
    path: '/sitecore/content/lcmc/lcmc/Data/Locations/West Jefferson Medical Center',
    locationTitle: f('West Jefferson Medical Center'),
    locationShortName: f('West Jefferson'),
    locationDescription: f(
      "<p>West Jefferson Medical Center is the Westbank's full-service hospital in Marrero, offering emergency, specialty, and inpatient care.</p>"
    ),
    streetAddress: f('1101 Medical Center Blvd.'),
    city: f('Marrero'),
    state: f('LA'),
    postalCode: f('70072'),
    phoneNumber: f('504-347-5511'),
    hoursText: f('Hospital open 24 hours. Emergency department open 24/7.'),
    parkingInfo: f('Surface lots and garage parking surround the Medical Center Boulevard campus.'),
    visitorInfo: f(
      '<p>Check in at the main lobby. Maternity and ICU units have additional visitor policies.</p>'
    ),
    locationType: f('Hospital'),
    hasEmergencyDepartment: f('1'),
    offeredServices: ml(
      [
        '{21FB8DB6-1732-4A44-8BEC-E39C52C1961A}',
        '{872D3FA1-DBC7-4ABF-9544-5A668C0D08B1}',
        '{72C9C518-0BB1-4BB0-9319-A38875217CD3}',
        '{D2B7F3AD-6DF9-4B0D-AB3B-58AD3669DB5B}',
        '{168532F3-37CE-4045-A84C-F0672164EEBE}',
        '{2C7094F3-7E17-4A5F-8E1F-68830FDC81B6}',
        '{EF79ADEF-3A78-4992-B297-04B3447C9CF4}',
        '{DB0C3D51-6686-4387-89A4-97B0AB5E440E}',
        '{DBD2AAB8-F409-4288-9EE0-5CFD676A1C66}',
        '{B491C6F0-3A49-4E3A-B94E-815639B35B92}',
      ],
      []
    ),
    locationPhysicians: ml(
      [
        '{048E9D17-4B8B-4FBF-90EA-8E66D97E4F89}',
        '{31A4B5A2-10FB-4CF1-B1E5-8FC21C802D06}',
        '{24EB9BF3-BFD6-4D01-87A7-BAF6D3DA421C}',
        '{010E3311-06A7-4904-AFD0-202FD565A796}',
      ],
      []
    ),
  },
];

const dir = join(process.cwd(), 'lib', 'sitecore', 'mock');
writeFileSync(
  join(dir, 'locations.json'),
  JSON.stringify({ item: { id: '76041887-6E16-4844-AD13-366BC2E32265', name: 'Locations', children: { results: locations } } }, null, 2)
);
console.log('wrote locations.json', locations.length);
