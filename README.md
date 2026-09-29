# Ciao! Italiaans op reis 🇮🇹

Een kleine web-app om praktisch, beleefd Italiaans te leren voor op vakantie. De app is in het Nederlands, werkt op je telefoon (PWA) en slaat je voortgang op in je eigen browser. Er is geen account en geen server nodig.

## Wat zit erin (MVP)
- **Thema Restaurant** met 4 lessen: reserveren, bestellen, allergieën, afrekenen
- **Oefenvormen:** meerkeuze (NL ↔ IT) en zinnen bouwen met woordblokjes
- **Uitleg en cultuurtips** bij elke nieuwe zin, met Italiaanse uitspraak (🔊 en 🐢 voor langzaam)
- **XP, level, dagelijkse streak en dagdoel**
- Foute antwoorden komen aan het eind van de les nog een keer terug

## Lokaal starten
De app moet via een (lokale) webserver draaien. Dubbelklikken op `index.html` werkt niet, omdat de browser dan de lesbestanden niet mag inlezen.

**Optie A: Python** (staat standaard op een Mac)
```bash
cd pad/naar/italian-course
python3 -m http.server 8000
```
Open daarna http://localhost:8000 in je browser. Stoppen doe je met `Ctrl+C`.

**Optie B: Visual Studio Code**
Installeer de extensie *Live Server*, open de map en klik rechtsonder op **Go Live**.

**Testen op je telefoon in hetzelfde wifi-netwerk:** start optie A en open `http://<ip-van-je-computer>:8000` op je telefoon. Installeren als app werkt pas via HTTPS, dus via GitHub Pages (hieronder).

## Online zetten met GitHub Pages
1. Ga op GitHub naar de repository → **Settings** → **Pages**.
2. Kies bij *Source*: **Deploy from a branch**, branch **main**, map **/ (root)** → **Save**.
3. Na een minuut staat de app op `https://<jouw-gebruikersnaam>.github.io/italian-course/`.
4. Op je telefoon:
   - **iPhone (Safari):** deel-knop → *Zet op beginscherm*
   - **Android (Chrome):** menu ⋮ → *App installeren*

## Zelf lessen toevoegen
Zie [docs/CONTENT.md](docs/CONTENT.md).

## Italiaanse inhoud laten controleren
Zinnen waar nog twijfel over is, staan in [docs/TE-CONTROLEREN.md](docs/TE-CONTROLEREN.md) en tonen in de app een ⚠️-label.

## Mappen
```
index.html            de app
css/style.css         opmaak
js/app.js             schermen en lesverloop
js/exercises.js       oefenvormen
js/progress.js        XP, streak, dagdoel, opslag
js/speech.js          Italiaanse uitspraak
content/              alle lessen (JSON)
manifest.json, sw.js  PWA: installeren en offline gebruik
```
