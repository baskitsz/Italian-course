// Italiaanse uitspraak via de ingebouwde spraakfunctie van de browser (Web Speech API).

let italiaanseStem = null;

function kiesStem() {
  if (!("speechSynthesis" in window)) return;
  const stemmen = speechSynthesis.getVoices();
  italiaanseStem =
    stemmen.find((s) => s.lang === "it-IT" && s.localService) ||
    stemmen.find((s) => s.lang === "it-IT") ||
    stemmen.find((s) => s.lang && s.lang.startsWith("it")) ||
    null;
}

if ("speechSynthesis" in window) {
  kiesStem();
  speechSynthesis.addEventListener?.("voiceschanged", kiesStem);
}

export function spraakBeschikbaar() {
  return "speechSynthesis" in window;
}

export function spreek(tekst, { langzaam = false } = {}) {
  if (!spraakBeschikbaar()) return;
  speechSynthesis.cancel();
  const uiting = new SpeechSynthesisUtterance(tekst);
  uiting.lang = "it-IT";
  if (italiaanseStem) uiting.voice = italiaanseStem;
  uiting.rate = langzaam ? 0.6 : 0.9;
  speechSynthesis.speak(uiting);
}
