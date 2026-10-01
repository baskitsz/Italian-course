// Hoofdbestand: laadt de lessen, toont de schermen en regelt het verloop van een les.

import * as voortgang from "./progress.js";
import { spreek, spraakBeschikbaar } from "./speech.js";
import {
  schud,
  maakMeerkeuze,
  maakBlokjes,
  geschiktVoorBlokjes,
  tekenOefening,
} from "./exercises.js";

const app = document.getElementById("app");

const GOED_BERICHTEN = [
  "Perfetto! 🎉",
  "Bravissimo! 👏",
  "Esatto! 👌",
  "Ottimo! De ober is onder de indruk 🍝",
  "Che bello! Precies goed ✨",
  "Grande! Je klinkt al als een local 🇮🇹",
  "Benissimo! 💪",
];
const FOUT_BERICHTEN = [
  "Bijna! Zo zeg je het:",
  "Nog niet helemaal. Het juiste antwoord:",
  "Geen zorgen, deze komt zo terug:",
];

function willekeurig(lijst) {
  return lijst[Math.floor(Math.random() * lijst.length)];
}

function esc(tekst) {
  return String(tekst).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

// ---------- Content laden ----------

let themas = [];

async function laadContent() {
  const res = await fetch("content/themes.json");
  const data = await res.json();
  themas = await Promise.all(
    data.themas.map(async (thema) => {
      const lessen = await Promise.all(
        thema.lessen.map(async (pad) => {
          const r = await fetch(`content/${pad}`);
          if (!r.ok) throw new Error(`Les niet gevonden: ${pad}`);
          return r.json();
        })
      );
      return { ...thema, lessen };
    })
  );
}

function lesOntgrendeld(thema, index) {
  if (index === 0) return true;
  return !!voortgang.lesStatus(thema.lessen[index - 1].id)?.voltooid;
}

// ---------- Routering (#/ en #/les/<thema>/<nr>) ----------

function route() {
  const delen = location.hash.replace(/^#\/?/, "").split("/");
  if (delen[0] === "les") {
    const thema = themas.find((t) => t.id === delen[1]);
    const index = Number(delen[2]);
    if (thema && thema.lessen[index] && lesOntgrendeld(thema, index)) {
      return startLes(thema, index);
    }
  }
  toonOverzicht();
}

// ---------- Overzicht ----------

function toonOverzicht() {
  document.onkeydown = null;
  const p = voortgang.getProfiel();
  const streak = voortgang.huidigeStreak();
  const dagXp = voortgang.xpVandaag();
  const dagPct = Math.min(100, Math.round((dagXp / voortgang.DAGDOEL_XP) * 100));
  const levelPct = Math.round((voortgang.xpInLevel() / voortgang.XP_PER_LEVEL) * 100);
  const vandaagGedaan = p.laatsteDag === voortgang.vandaag();

  const themaHtml = themas
    .map((thema) => {
      if (thema.lessen.length === 0) {
        return `
          <section class="thema binnenkort">
            <div class="thema-kop">
              <span class="thema-emoji">${thema.emoji}</span>
              <div><h3>${esc(thema.titel)}</h3><p>${esc(thema.beschrijving)}</p></div>
              <span class="label">Binnenkort</span>
            </div>
          </section>`;
      }
      const klaar = thema.lessen.filter((l) => voortgang.lesStatus(l.id)?.voltooid).length;
      const pct = Math.round((klaar / thema.lessen.length) * 100);
      const lessen = thema.lessen
        .map((les, i) => {
          const status = voortgang.lesStatus(les.id);
          const open = lesOntgrendeld(thema, i);
          const icoon = status?.voltooid ? "✓" : open ? i + 1 : "🔒";
          const klasse = status?.voltooid ? "voltooid" : open ? "open" : "dicht";
          const sub = status?.voltooid
            ? `Beste score ${Math.round(status.besteScore * 100)}% · nog eens oefenen`
            : open
              ? "Start les"
              : "Rond eerst de vorige les af";
          const inhoud = `
            <span class="les-icoon">${icoon}</span>
            <span class="les-tekst"><strong>${esc(les.titel)}</strong><small>${sub}</small></span>`;
          return open
            ? `<a class="les ${klasse}" href="#/les/${thema.id}/${i}">${inhoud}</a>`
            : `<div class="les ${klasse}">${inhoud}</div>`;
        })
        .join("");
      return `
        <section class="thema">
          <div class="thema-kop">
            <span class="thema-emoji">${thema.emoji}</span>
            <div><h3>${esc(thema.titel)}</h3><p>${esc(thema.beschrijving)}</p></div>
          </div>
          <div class="balk"><div style="width:${pct}%"></div></div>
          <p class="balk-tekst">${klaar} van ${thema.lessen.length} lessen voltooid</p>
          <div class="lessen">${lessen}</div>
        </section>`;
    })
    .join("");

  app.innerHTML = `
    <header class="topbalk">
      <div class="logo">Ciao<span>!</span></div>
      <div class="stats">
        <span class="stat ${vandaagGedaan ? "" : "grijs"}" title="Dagen op rij">🔥 ${streak}</span>
        <span class="stat" title="Totaal XP">⭐ ${p.xp}</span>
        ${spraakBeschikbaar() ? `<button class="stat knop-geluid" title="Geluid aan/uit">${p.geluid ? "🔊" : "🔇"}</button>` : ""}
      </div>
    </header>
    <main class="overzicht">
      <section class="kaart dagdoel">
        <div class="dagdoel-rij">
          <div>
            <h2>Dagdoel</h2>
            <p>${dagXp >= voortgang.DAGDOEL_XP ? "Gehaald! Grande! 🎉" : `Nog ${voortgang.DAGDOEL_XP - dagXp} XP te gaan`}</p>
          </div>
          <span class="dagdoel-getal">${dagXp}/${voortgang.DAGDOEL_XP} XP</span>
        </div>
        <div class="balk groot"><div style="width:${dagPct}%"></div></div>
        <div class="level-rij">
          <span class="level-badge">Level ${voortgang.level()}</span>
          <div class="balk dun"><div style="width:${levelPct}%"></div></div>
          <small>${voortgang.xpInLevel()}/${voortgang.XP_PER_LEVEL}</small>
        </div>
        ${streak === 0 ? `<p class="hint">Doe vandaag een les om je streak te starten 🔥</p>` : !vandaagGedaan ? `<p class="hint">Doe vandaag een les om je streak van ${streak} ${streak === 1 ? "dag" : "dagen"} te behouden!</p>` : ""}
      </section>
      <h2 class="sectie-titel">Thema's</h2>
      ${themaHtml}
    </main>`;

  app.querySelector(".knop-geluid")?.addEventListener("click", () => {
    voortgang.zetGeluid(!voortgang.getProfiel().geluid);
    toonOverzicht();
  });
  window.scrollTo(0, 0);
}

// ---------- Les ----------

function bouwStappen(les) {
  const zinnen = les.zinnen;
  const stappen = [];

  // Ronde 1: telkens 2 nieuwe zinnen introduceren en daarna herkennen.
  for (let i = 0; i < zinnen.length; i += 2) {
    const blok = zinnen.slice(i, i + 2);
    blok.forEach((z) => stappen.push({ type: "intro", zin: z }));
    schud(blok).forEach((z) => stappen.push(maakMeerkeuze(z, zinnen, "it-nl")));
  }

  // Ronde 2: actief gebruiken, door elkaar.
  schud(zinnen).forEach((z) => {
    stappen.push(
      geschiktVoorBlokjes(z) && Math.random() < 0.7
        ? maakBlokjes(z, zinnen)
        : maakMeerkeuze(z, zinnen, "nl-it")
    );
  });
  return stappen;
}

function herhaalOefening(oef, zinnen) {
  if (oef.type === "blokjes") return maakBlokjes(oef.zin, zinnen);
  return maakMeerkeuze(oef.zin, zinnen, oef.richting);
}

function startLes(thema, lesIndex) {
  const les = thema.lessen[lesIndex];
  const stappen = bouwStappen(les);
  const staat = {
    stap: 0,
    aantalOefeningen: stappen.filter((s) => s.type !== "intro").length,
    goedEersteKeer: 0,
    xp: 0,
    streakVoor: voortgang.huidigeStreak(),
    dagdoelGehaald: false,
    nieuwLevel: false,
  };

  function stopLes() {
    if (confirm("Les stoppen? Je XP blijft staan, maar de les telt nog niet als voltooid.")) {
      speechSynthesis?.cancel?.();
      location.hash = "#/";
    }
  }

  function tekenStap() {
    if (staat.stap >= stappen.length) return toonResultaat();
    const stap = stappen[staat.stap];
    const pct = Math.round((staat.stap / stappen.length) * 100);

    app.innerHTML = `
      <div class="les-scherm">
        <header class="les-kop">
          <button class="sluit" aria-label="Les stoppen">✕</button>
          <div class="balk groot"><div style="width:${pct}%"></div></div>
          <span class="les-xp">⭐ ${staat.xp}</span>
        </header>
        <main class="les-inhoud"></main>
        <footer class="les-voet">
          <div class="feedback" hidden></div>
          <button class="knop hoofd" disabled>Controleer</button>
        </footer>
      </div>`;
    app.querySelector(".sluit").addEventListener("click", stopLes);
    const inhoud = app.querySelector(".les-inhoud");
    const knop = app.querySelector(".knop.hoofd");
    window.scrollTo(0, 0);

    if (stap.type === "intro") return tekenIntro(stap.zin, inhoud, knop);

    let nakijken = tekenOefening(stap, inhoud, (aan) => (knop.disabled = !aan), voortgang.getProfiel().geluid);
    let nagekeken = false;

    const actie = () => {
      if (knop.disabled) return;
      if (!nagekeken) {
        nagekeken = true;
        const goed = nakijken();
        verwerkAntwoord(stap, goed);
        return;
      }
      staat.stap++;
      tekenStap();
    };
    knop.onclick = actie;
    document.onkeydown = (e) => {
      if (e.key === "Enter") actie();
    };
  }

  function tekenIntro(zin, inhoud, knop) {
    inhoud.innerHTML = `
      <p class="oef-label">Nieuwe zin ✨</p>
      <div class="intro-kaart">
        <div class="intro-it">
          <span class="it">${esc(zin.it)}</span>
          <span class="spreek-groep">
            <button class="spreek-knop" data-snelheid="normaal" aria-label="Uitspreken">🔊</button>
            <button class="spreek-knop klein" data-snelheid="langzaam" aria-label="Langzaam uitspreken">🐢</button>
          </span>
        </div>
        <p class="intro-nl">${esc(zin.nl)}</p>
      </div>
      <div class="uitleg"><strong>Waarom zo?</strong> ${esc(zin.uitleg)}</div>
      ${zin.cultuurtip ? `<div class="tip"><strong>🇮🇹 Cultuurtip</strong> ${esc(zin.cultuurtip)}</div>` : ""}
      ${zin.twijfel ? `<div class="twijfel"><strong>⚠️ Nog te controleren</strong> ${esc(zin.twijfel)}</div>` : ""}`;
    inhoud.querySelectorAll(".spreek-knop").forEach((b) =>
      b.addEventListener("click", () => spreek(zin.it, { langzaam: b.dataset.snelheid === "langzaam" }))
    );
    if (voortgang.getProfiel().geluid) spreek(zin.it);

    knop.textContent = "Doorgaan";
    knop.disabled = false;
    const verder = () => {
      staat.stap++;
      tekenStap();
    };
    knop.onclick = verder;
    document.onkeydown = (e) => {
      if (e.key === "Enter") verder();
    };
  }

  function verwerkAntwoord(stap, goed) {
    const eersteKeer = !stap.herhaling;
    voortgang.registreerAntwoord(stap.zin.id, goed);

    let xpTekst = "";
    if (goed && eersteKeer) {
      staat.goedEersteKeer++;
      staat.xp += voortgang.XP_PER_GOED;
      const r = voortgang.voegXpToe(voortgang.XP_PER_GOED);
      staat.dagdoelGehaald ||= r.dagdoelGehaald;
      staat.nieuwLevel ||= r.nieuwLevel;
      xpTekst = `<span class="xp-plus">+${voortgang.XP_PER_GOED} XP</span>`;
      app.querySelector(".les-xp").textContent = `⭐ ${staat.xp}`;
    }
    if (!goed) {
      // Foute oefening komt aan het eind van de les nog een keer terug.
      stappen.push({ ...herhaalOefening(stap, les.zinnen), herhaling: true });
    }

    const feedback = app.querySelector(".feedback");
    feedback.hidden = false;
    feedback.className = `feedback ${goed ? "goed" : "fout"}`;
    const toonAntwoord = !goed || stap.type === "blokjes" || stap.antwoordTaal === "it" || stap.vraagTaal === "it";
    feedback.innerHTML = `
      <div class="feedback-titel">${goed ? willekeurig(GOED_BERICHTEN) : willekeurig(FOUT_BERICHTEN)} ${xpTekst}</div>
      ${toonAntwoord ? `
        <div class="feedback-antwoord">
          <span class="it">${esc(stap.zin.it)}</span>
          <button class="spreek-knop klein" aria-label="Uitspreken">🔊</button>
        </div>
        <div class="feedback-nl">${esc(stap.zin.nl)}</div>` : ""}
      ${!goed ? `<div class="feedback-uitleg">💡 ${esc(stap.zin.uitleg)}</div>` : ""}`;
    feedback.querySelector(".spreek-knop")?.addEventListener("click", () => spreek(stap.zin.it));
    if (goed && voortgang.getProfiel().geluid && stap.type === "blokjes") spreek(stap.zin.it);

    const knop = app.querySelector(".knop.hoofd");
    knop.textContent = "Doorgaan";
    knop.classList.add(goed ? "goed" : "fout");
    knop.focus();
  }

  function toonResultaat() {
    document.onkeydown = null;
    const score = staat.goedEersteKeer / staat.aantalOefeningen;
    const bonus = voortgang.voegXpToe(voortgang.XP_LES_BONUS);
    staat.xp += voortgang.XP_LES_BONUS;
    staat.dagdoelGehaald ||= bonus.dagdoelGehaald;
    staat.nieuwLevel ||= bonus.nieuwLevel;
    voortgang.lesVoltooid(les.id, score);

    const streakNu = voortgang.huidigeStreak();
    const streakOmhoog = streakNu > staat.streakVoor;
    const volgende = thema.lessen[lesIndex + 1];
    const perfect = score === 1;

    const extra = [];
    if (streakOmhoog) extra.push(`🔥 Streak: ${streakNu} ${streakNu === 1 ? "dag" : "dagen"} op rij!`);
    if (staat.dagdoelGehaald) extra.push("🎯 Dagdoel gehaald!");
    if (staat.nieuwLevel) extra.push(`🚀 Nieuw level: ${voortgang.level()}!`);

    app.innerHTML = `
      <main class="resultaat">
        <div class="resultaat-emoji">${perfect ? "🏆" : "🎉"}</div>
        <h1>${perfect ? "Perfetto! Foutloos!" : "Les voltooid!"}</h1>
        <p class="resultaat-sub">${esc(les.titel)}</p>
        <div class="resultaat-stats">
          <div class="rstat"><span>⭐ ${staat.xp}</span><small>XP verdiend</small></div>
          <div class="rstat"><span>🎯 ${Math.round(score * 100)}%</span><small>in één keer goed</small></div>
          <div class="rstat"><span>🔥 ${streakNu}</span><small>streak</small></div>
        </div>
        ${extra.map((e) => `<p class="resultaat-extra">${e}</p>`).join("")}
        <div class="resultaat-knoppen">
          ${volgende ? `<a class="knop hoofd" href="#/les/${thema.id}/${lesIndex + 1}">Volgende les →</a>` : ""}
          <a class="knop ${volgende ? "tweede" : "hoofd"}" href="#/">Naar overzicht</a>
        </div>
      </main>`;
    window.scrollTo(0, 0);
  }

  tekenStap();
}

// ---------- Start ----------

async function start() {
  try {
    await laadContent();
  } catch (fout) {
    app.innerHTML = `
      <main class="foutmelding">
        <h1>Oeps 😅</h1>
        <p>De lessen konden niet geladen worden.</p>
        <p><small>${esc(fout.message)}</small></p>
        <p><small>Tip: open de app via een lokale server (zie README), niet door het bestand dubbel te klikken.</small></p>
      </main>`;
    return;
  }
  window.addEventListener("hashchange", route);
  route();
}

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

start();
