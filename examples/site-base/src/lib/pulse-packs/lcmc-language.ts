import { foldPulseText } from './match';

export type LcmcPulseLanguage = 'en' | 'es';

/**
 * Distinctive Spanish stems (accent-folded). Avoid one-letter / ultra-common
 * tokens like "el" / "la" so English questions do not flip to Spanish.
 */
const SPANISH_STEMS = new Set([
  'necesito',
  'necesita',
  'necesitamos',
  'medico',
  'medica',
  'medicos',
  'especialista',
  'especialistas',
  'dolor',
  'oido',
  'oidos',
  'garganta',
  'senos',
  'nasales',
  'nariz',
  'cita',
  'citas',
  'turno',
  'otorrino',
  'otorrinolaringologia',
  'encontrar',
  'encuentro',
  'busco',
  'cerca',
  'amigdalas',
  'amigdala',
  'audicion',
  'pediatra',
  'cardiologo',
  'cardiologia',
  'ortopedia',
  'ortopedista',
  'donde',
  'como',
  'quien',
  'reservar',
  'reserva',
  'agendar',
  'agenda',
  'sintoma',
  'sintomas',
  'nino',
  'nina',
  'ninos',
  'corazon',
  'rodilla',
  'hueso',
]);

export function detectLcmcPulseLanguage(question: string): LcmcPulseLanguage {
  const raw = question.trim();
  if (!raw) return 'en';
  if (/[áéíóúñü¿¡]/i.test(raw)) return 'es';

  const tokens = foldPulseText(raw)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const hits = tokens.filter((token) => SPANISH_STEMS.has(token)).length;
  if (hits >= 2) return 'es';
  if (hits >= 1 && tokens.length <= 12) return 'es';
  return 'en';
}
