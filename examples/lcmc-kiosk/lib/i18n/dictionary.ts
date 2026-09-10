import type { KioskLocale } from './config';

export type Dictionary = {
  languageEnglish: string;
  languageSpanish: string;
  languageGroupLabel: string;
  home: string;
  back: string;
  tryAgain: string;
  lobbyDirectory: string;
  footerHome: string;
  footerIdle: string;
  homeTitle: string;
  homeSubtitle: string;
  findDoctor: string;
  findDepartment: string;
  howToGetAround: string;
  physiciansTitle: string;
  physicianSearchLabel: string;
  physicianSearchPlaceholder: string;
  allSpecialties: string;
  filterBySpecialty: string;
  specialtyNotListed: string;
  moreLocations: (count: number) => string;
  noPhysicians: string;
  physicianResults: (count: number) => string;
  acceptingNewPatients: string;
  notAcceptingNewPatients: string;
  noBiography: string;
  phone: string;
  languages: string;
  whereToFindPhysician: string;
  viewDepartment: string;
  findMyWay: string;
  directionsTitle: string;
  youAreHere: string;
  destinationLabel: string;
  estimatedWalk: string;
  closeDirections: string;
  demoMapNote: string;
  informationDesk: string;
  mainLobby: string;
  elevators: string;
  clinic: string;
  kioskLabel: string;
  directionStep1: string;
  directionStep2: string;
  directionStep3: string;
  directionArrive: (place: string) => string;
  departmentsTitle: string;
  departmentsIntro: string;
  departmentSearchLabel: string;
  departmentSearchPlaceholder: string;
  noDepartments: string;
  departmentResults: (count: number) => string;
  whereToGo: string;
  mapPlaceholder: string;
  physiciansInService: string;
  wayfindingTitle: string;
  wayfindingIntro: string;
  locationSearchLabel: string;
  locationSearchPlaceholder: string;
  noLocations: string;
  locationResults: (count: number) => string;
  campusMapPlaceholder: string;
  keyboardDone: string;
  keyboardSpace: string;
  keyboardClear: string;
  keyboardHint: string;
  keyboardAriaLabel: string;
  showKeyboard: string;
  contentUnavailableTitle: string;
  contentUnavailableMessage: string;
  notFoundTitle: string;
  notFoundMessage: string;
};

const en: Dictionary = {
  languageEnglish: 'English',
  languageSpanish: 'Español',
  languageGroupLabel: 'Language',
  home: 'Home',
  back: 'Back',
  tryAgain: 'Try again',
  lobbyDirectory: 'Lobby directory',
  footerHome: 'Welcome to LCMC Health. This screen stays here until you tap a button.',
  footerIdle: 'This kiosk returns to the home screen after 90 seconds without a touch.',
  homeTitle: 'How can we help you today?',
  homeSubtitle: 'Tap a button to find a doctor or get directions.',
  findDoctor: 'Find a Doctor',
  findDepartment: 'Find a Department / Wayfinding',
  howToGetAround: 'How to get around',
  physiciansTitle: 'Find a doctor',
  physicianSearchLabel: 'Search by name, specialty, or location',
  physicianSearchPlaceholder: 'Start typing a doctor name…',
  allSpecialties: 'All specialties',
  filterBySpecialty: 'Filter by specialty',
  specialtyNotListed: 'Specialty not listed',
  moreLocations: (count) => ` + ${count} more`,
  noPhysicians: 'No physicians match those filters.',
  physicianResults: (count) => (count === 1 ? '1 doctor' : `${count} doctors`),
  acceptingNewPatients: 'Accepting new patients',
  notAcceptingNewPatients: 'Not listed as accepting new patients',
  noBiography: 'A biography is not available for this physician.',
  phone: 'Phone',
  languages: 'Languages',
  whereToFindPhysician: 'Where to find this physician',
  viewDepartment: 'View department / wayfinding',
  findMyWay: 'Find my way',
  directionsTitle: 'Walking directions',
  youAreHere: 'You are here',
  destinationLabel: 'Your destination',
  estimatedWalk: 'About 3 minutes · 150 yards',
  closeDirections: 'Close map',
  demoMapNote: 'Static demo map for this kiosk — not live indoor GPS.',
  informationDesk: 'Information desk',
  mainLobby: 'Main lobby',
  elevators: 'Elevators',
  clinic: 'Clinic',
  kioskLabel: 'Kiosk',
  directionStep1: 'Start at this kiosk in the main lobby.',
  directionStep2: 'Walk past the information desk into the main corridor.',
  directionStep3: 'Continue toward the elevators, then turn right.',
  directionArrive: (place) => `The clinic is ahead on your right: ${place}.`,
  departmentsTitle: 'Departments and services',
  departmentsIntro: 'Choose a service to see locations, directions, and physicians.',
  departmentSearchLabel: 'Search departments and services',
  departmentSearchPlaceholder: 'Start typing a department or location…',
  noDepartments: 'No departments match those filters.',
  departmentResults: (count) => (count === 1 ? '1 department' : `${count} departments`),
  whereToGo: 'Where to go',
  mapPlaceholder: 'Campus map placeholder — ask the information desk for printed maps.',
  physiciansInService: 'Physicians in this service',
  wayfindingTitle: 'How to get around',
  wayfindingIntro:
    'Start at the information desk in the main lobby. Search a hospital or clinic name to see parking and visitor information.',
  locationSearchLabel: 'Search a location',
  locationSearchPlaceholder: 'Start typing a hospital or clinic name…',
  noLocations: 'No locations match that search.',
  locationResults: (count) => (count === 1 ? '1 location' : `${count} locations`),
  campusMapPlaceholder: 'Campus map placeholder',
  keyboardDone: 'Done',
  keyboardSpace: 'Space',
  keyboardClear: 'Clear',
  keyboardHint: 'Results update as you type. Tap Done when you are finished.',
  keyboardAriaLabel: 'On-screen keyboard',
  showKeyboard: 'Show keyboard',
  contentUnavailableTitle: 'Content is temporarily unavailable',
  contentUnavailableMessage:
    'Please ask a staff member for assistance.',
  notFoundTitle: 'We could not find that screen',
  notFoundMessage: 'Please ask a staff member for assistance, or return home and try again.',
};

const es: Dictionary = {
  languageEnglish: 'English',
  languageSpanish: 'Español',
  languageGroupLabel: 'Idioma',
  home: 'Inicio',
  back: 'Atrás',
  tryAgain: 'Intentar de nuevo',
  lobbyDirectory: 'Directorio del vestíbulo',
  footerHome: 'Bienvenido a LCMC Health. Esta pantalla permanece aquí hasta que toque un botón.',
  footerIdle: 'Este kiosco vuelve a la pantalla de inicio después de 90 segundos sin toques.',
  homeTitle: '¿Cómo podemos ayudarle hoy?',
  homeSubtitle: 'Toque un botón para buscar un médico o para orientarse.',
  findDoctor: 'Buscar un médico',
  findDepartment: 'Buscar un departamento / Orientación',
  howToGetAround: 'Cómo orientarse',
  physiciansTitle: 'Buscar un médico',
  physicianSearchLabel: 'Buscar por nombre, especialidad o ubicación',
  physicianSearchPlaceholder: 'Empiece a escribir el nombre del médico…',
  allSpecialties: 'Todas las especialidades',
  filterBySpecialty: 'Filtrar por especialidad',
  specialtyNotListed: 'Especialidad no indicada',
  moreLocations: (count) => ` + ${count} más`,
  noPhysicians: 'Ningún médico coincide con esos filtros.',
  physicianResults: (count) => (count === 1 ? '1 médico' : `${count} médicos`),
  acceptingNewPatients: 'Acepta pacientes nuevos',
  notAcceptingNewPatients: 'No figura como aceptando pacientes nuevos',
  noBiography: 'No hay una biografía disponible para este médico.',
  phone: 'Teléfono',
  languages: 'Idiomas',
  whereToFindPhysician: 'Dónde encontrar a este médico',
  viewDepartment: 'Ver departamento / orientación',
  findMyWay: 'Cómo llegar',
  directionsTitle: 'Indicaciones a pie',
  youAreHere: 'Usted está aquí',
  destinationLabel: 'Su destino',
  estimatedWalk: 'Unos 3 minutos · 140 metros',
  closeDirections: 'Cerrar mapa',
  demoMapNote: 'Mapa de demostración de este kiosco — no es GPS interior en vivo.',
  informationDesk: 'Mostrador de información',
  mainLobby: 'Vestíbulo principal',
  elevators: 'Ascensores',
  clinic: 'Clínica',
  kioskLabel: 'Kiosco',
  directionStep1: 'Comience en este kiosco, en el vestíbulo principal.',
  directionStep2: 'Pase el mostrador de información hacia el pasillo principal.',
  directionStep3: 'Siga hacia los ascensores y luego gire a la derecha.',
  directionArrive: (place) => `La clínica está adelante a la derecha: ${place}.`,
  departmentsTitle: 'Departamentos y servicios',
  departmentsIntro: 'Elija un servicio para ver ubicaciones, indicaciones y médicos.',
  departmentSearchLabel: 'Buscar departamentos y servicios',
  departmentSearchPlaceholder: 'Empiece a escribir un departamento o ubicación…',
  noDepartments: 'Ningún departamento coincide con esos filtros.',
  departmentResults: (count) => (count === 1 ? '1 departamento' : `${count} departamentos`),
  whereToGo: 'A dónde ir',
  mapPlaceholder: 'Mapa del campus pendiente: pida un mapa impreso en el mostrador de información.',
  physiciansInService: 'Médicos en este servicio',
  wayfindingTitle: 'Cómo orientarse',
  wayfindingIntro:
    'Comience en el mostrador de información del vestíbulo principal. Busque el nombre de un hospital o clínica para ver estacionamiento e información para visitantes.',
  locationSearchLabel: 'Buscar una ubicación',
  locationSearchPlaceholder: 'Empiece a escribir el nombre del hospital o clínica…',
  noLocations: 'Ninguna ubicación coincide con esa búsqueda.',
  locationResults: (count) => (count === 1 ? '1 ubicación' : `${count} ubicaciones`),
  campusMapPlaceholder: 'Mapa del campus pendiente',
  keyboardDone: 'Listo',
  keyboardSpace: 'Espacio',
  keyboardClear: 'Borrar',
  keyboardHint: 'Los resultados se actualizan mientras escribe. Toque Listo al terminar.',
  keyboardAriaLabel: 'Teclado en pantalla',
  showKeyboard: 'Mostrar teclado',
  contentUnavailableTitle: 'El contenido no está disponible por el momento',
  contentUnavailableMessage: 'Por favor pida ayuda a un miembro del personal.',
  notFoundTitle: 'No encontramos esa pantalla',
  notFoundMessage: 'Pida ayuda a un miembro del personal, o vuelva al inicio e inténtelo de nuevo.',
};

export function getDictionary(locale: KioskLocale): Dictionary {
  return locale === 'es-CO' ? es : en;
}
