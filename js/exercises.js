// Oefenvormen: maakt oefeningen uit de zinnen van een les en tekent ze op het scherm.
// Nieuwe oefenvormen voeg je later toe als extra "type" met een eigen teken-functie.

import { spreek } from "./speech.js";

export function schud(lijst) {
  const kopie = [...lijst];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}

// Voor vergelijken: kleine letters, zonder leestekens (apostrof blijft staan).
export function normaliseer(woord) {
  return woord
    .toLowerCase()
    .replace(/[.,!?¿¡;:"«»()]/g, "")
    .replace(/[’`]/g, "'")
    .trim();
}

function woorden(zin) {
  return zin
    .split(/\s+/)
    .map((w) => w.replace(/[.,!?¿¡;:"«»()]/g, ""))
    .filter(Boolean);
}

// ---------- Oefeningen maken ----------

// Meerkeuze. richting "it-nl": Italiaanse zin, kies de vertaling. "nl-it": andersom.
export function maakMeerkeuze(zin, alleZinnen, richting) {
  const vanTaal = richting === "it-nl" ? "it" : "nl";
  const naarTaal = richting === "it-nl" ? "nl" : "it";
  const afleiders = schud(alleZinnen.filter((z) => z.id !== zin.id && z[naarTaal] !== zin[naarTaal]))
    .filter((z, i, arr) => arr.findIndex((x) => x[naarTaal] === z[naarTaal]) === i)
    .slice(0, 3)
    .map((z) => z[naarTaal]);
  return {
    type: "meerkeuze",
    richting,
    zin,
    vraag: zin[vanTaal],
    vraagTaal: vanTaal,
    opties: schud([zin[naarTaal], ...afleiders]),
    antwoord: zin[naarTaal],
    antwoordTaal: naarTaal,
  };
}

// Zin bouwen: Nederlandse zin, zet de Italiaanse woordblokjes in de goede volgorde.
export function maakBlokjes(zin, alleZinnen) {
  const juist = woorden(zin.it);
  const juistGenorm = new Set(juist.map(normaliseer));
  const extra = schud(
    alleZinnen
      .filter((z) => z.id !== zin.id)
      .flatMap((z) => woorden(z.it))
      .filter((w) => !juistGenorm.has(normaliseer(w)))
  )
    .filter((w, i, arr) => arr.findIndex((x) => normaliseer(x) === normaliseer(w)) === i)
    .slice(0, juist.length <= 3 ? 2 : 3);
  return {
    type: "blokjes",
    zin,
    vraag: zin.nl,
    blokjes: schud([...juist, ...extra]).map((tekst, i) => ({ id: i, tekst })),
    antwoord: zin.it,
    juisteWoorden: juist.map(normaliseer),
  };
}

export function geschiktVoorBlokjes(zin) {
  return woorden(zin.it).length >= 3;
}

// ---------- Oefeningen tekenen ----------
// Elke teken-functie krijgt een container en een callback "klaar(bool)" die aangeeft
// of de knop "Controleer" aan mag. Ze geeft een functie terug die het antwoord nakijkt.

export function tekenOefening(oef, container, klaar, geluidAan) {
  if (oef.type === "meerkeuze") return tekenMeerkeuze(oef, container, klaar, geluidAan);
  if (oef.type === "blokjes") return tekenBlokjes(oef, container, klaar);
  throw new Error(`Onbekende oefenvorm: ${oef.type}`);
}

function el(tag, klasse, tekst) {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (tekst !== undefined) e.textContent = tekst;
  return e;
}

function spreekKnop(tekst, klein = false) {
  const knop = el("button", klein ? "spreek-knop klein" : "spreek-knop", "🔊");
  knop.type = "button";
  knop.setAttribute("aria-label", "Uitspreken");
  knop.addEventListener("click", (e) => {
    e.stopPropagation();
    spreek(tekst);
  });
  return knop;
}

function tekenMeerkeuze(oef, container, klaar, geluidAan) {
  container.append(
    el("p", "oef-label", oef.richting === "it-nl" ? "Wat betekent dit?" : "Hoe zeg je dit in het Italiaans?")
  );

  const vraag = el("div", "oef-vraag");
  vraag.append(el("span", `vraag-tekst ${oef.vraagTaal === "it" ? "it" : ""}`, oef.vraag));
  if (oef.vraagTaal === "it") vraag.append(spreekKnop(oef.vraag));
  container.append(vraag);
  if (oef.vraagTaal === "it" && geluidAan) spreek(oef.vraag);

  const lijst = el("div", "opties");
  let gekozen = null;
  oef.opties.forEach((optie, i) => {
    const knop = el("button", "optie");
    knop.type = "button";
    knop.append(el("span", "optie-nr", String(i + 1)), el("span", "optie-tekst", optie));
    knop.addEventListener("click", () => {
      lijst.querySelectorAll(".optie").forEach((k) => k.classList.remove("gekozen"));
      knop.classList.add("gekozen");
      gekozen = optie;
      if (oef.antwoordTaal === "it" && geluidAan) spreek(optie);
      klaar(true);
    });
    lijst.append(knop);
  });
  container.append(lijst);

  return () => {
    const goed = gekozen === oef.antwoord;
    lijst.querySelectorAll(".optie").forEach((k) => {
      k.disabled = true;
      const tekst = k.querySelector(".optie-tekst").textContent;
      if (tekst === oef.antwoord) k.classList.add("juist");
      else if (tekst === gekozen) k.classList.add("onjuist");
    });
    return goed;
  };
}

function tekenBlokjes(oef, container, klaar) {
  container.append(el("p", "oef-label", "Bouw de zin in het Italiaans"));
  container.append(el("div", "oef-vraag", oef.vraag));

  const antwoordRegel = el("div", "blok-antwoord");
  const bank = el("div", "blok-bank");
  const gekozen = []; // lijst van blokje-id's in volgorde

  const bankKnoppen = new Map();
  oef.blokjes.forEach((b) => {
    const knop = el("button", "blokje", b.tekst);
    knop.type = "button";
    knop.addEventListener("click", () => {
      if (knop.classList.contains("gebruikt")) return;
      knop.classList.add("gebruikt");
      gekozen.push(b.id);
      update();
    });
    bankKnoppen.set(b.id, knop);
    bank.append(knop);
  });

  function update() {
    antwoordRegel.replaceChildren();
    gekozen.forEach((id, positie) => {
      const b = oef.blokjes.find((x) => x.id === id);
      const knop = el("button", "blokje", b.tekst);
      knop.type = "button";
      knop.addEventListener("click", () => {
        gekozen.splice(positie, 1);
        bankKnoppen.get(id).classList.remove("gebruikt");
        update();
      });
      antwoordRegel.append(knop);
    });
    klaar(gekozen.length > 0);
  }

  container.append(antwoordRegel, bank);

  return () => {
    const poging = gekozen.map((id) => normaliseer(oef.blokjes.find((x) => x.id === id).tekst));
    const goed =
      poging.length === oef.juisteWoorden.length &&
      poging.every((w, i) => w === oef.juisteWoorden[i]);
    container.querySelectorAll(".blokje").forEach((k) => (k.disabled = true));
    antwoordRegel.classList.add(goed ? "juist" : "onjuist");
    return goed;
  };
}
