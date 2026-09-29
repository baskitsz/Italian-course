// Voortgang: XP, level, streak en dagdoel. Alles wordt lokaal in de browser opgeslagen.

const OPSLAG_SLEUTEL = "italiano-voortgang-v1";

export const XP_PER_GOED = 10;
export const XP_LES_BONUS = 20;
export const DAGDOEL_XP = 30;
export const XP_PER_LEVEL = 100;

function leegProfiel() {
  return {
    xp: 0,
    streak: 0,
    laatsteDag: null,      // "2026-09-29": laatste dag waarop je XP verdiende
    dag: { datum: null, xp: 0 },
    lessen: {},            // per les-id: { voltooid, keer, besteScore }
    zinnen: {},            // per zin-id: { goed, fout, laatst } (basis voor latere herhaling)
    geluid: true,
  };
}

let profiel = laad();

function laad() {
  try {
    const opgeslagen = JSON.parse(localStorage.getItem(OPSLAG_SLEUTEL));
    return { ...leegProfiel(), ...opgeslagen };
  } catch {
    return leegProfiel();
  }
}

function bewaar() {
  try {
    localStorage.setItem(OPSLAG_SLEUTEL, JSON.stringify(profiel));
  } catch {
    // Opslaan kan mislukken (bijv. privévenster); de app werkt dan gewoon zonder te onthouden.
  }
}

// Datum als "JJJJ-MM-DD" in lokale tijd.
export function vandaag(datum = new Date()) {
  const j = datum.getFullYear();
  const m = String(datum.getMonth() + 1).padStart(2, "0");
  const d = String(datum.getDate()).padStart(2, "0");
  return `${j}-${m}-${d}`;
}

function gisteren() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return vandaag(d);
}

export function getProfiel() {
  return profiel;
}

// Streak zoals hij nu telt: verlopen als je gisteren én vandaag niets deed.
export function huidigeStreak() {
  if (profiel.laatsteDag === vandaag() || profiel.laatsteDag === gisteren()) {
    return profiel.streak;
  }
  return 0;
}

export function xpVandaag() {
  return profiel.dag.datum === vandaag() ? profiel.dag.xp : 0;
}

export function level() {
  return Math.floor(profiel.xp / XP_PER_LEVEL) + 1;
}

export function xpInLevel() {
  return profiel.xp % XP_PER_LEVEL;
}

// Voegt XP toe en werkt streak en dagdoel bij.
// Geeft terug of het dagdoel hiermee net gehaald is.
export function voegXpToe(aantal) {
  const nu = vandaag();
  const levelVoor = level();
  const dagVoor = xpVandaag();

  if (profiel.laatsteDag !== nu) {
    profiel.streak = profiel.laatsteDag === gisteren() ? profiel.streak + 1 : 1;
    profiel.laatsteDag = nu;
  }
  if (profiel.dag.datum !== nu) {
    profiel.dag = { datum: nu, xp: 0 };
  }

  profiel.xp += aantal;
  profiel.dag.xp += aantal;
  bewaar();

  return {
    dagdoelGehaald: dagVoor < DAGDOEL_XP && profiel.dag.xp >= DAGDOEL_XP,
    nieuwLevel: level() > levelVoor,
  };
}

export function registreerAntwoord(zinId, goed) {
  const z = profiel.zinnen[zinId] || { goed: 0, fout: 0, laatst: null };
  if (goed) z.goed++;
  else z.fout++;
  z.laatst = vandaag();
  profiel.zinnen[zinId] = z;
  bewaar();
}

export function lesVoltooid(lesId, score) {
  const l = profiel.lessen[lesId] || { voltooid: false, keer: 0, besteScore: 0 };
  l.voltooid = true;
  l.keer++;
  l.besteScore = Math.max(l.besteScore, score);
  profiel.lessen[lesId] = l;
  bewaar();
}

export function lesStatus(lesId) {
  return profiel.lessen[lesId] || null;
}

export function zetGeluid(aan) {
  profiel.geluid = aan;
  bewaar();
}

export function resetVoortgang() {
  profiel = leegProfiel();
  bewaar();
}
