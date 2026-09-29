# Zelf lessen toevoegen

Alle lesinhoud staat in de map `content/`. Je hoeft geen code aan te passen: de oefeningen worden automatisch gemaakt uit de zinnen in een les.

## 1. Een les is een JSON-bestand

Voorbeeld (`content/restaurant/les-1.json`, ingekort):

```json
{
  "id": "restaurant-1",
  "titel": "Binnenkomen en reserveren",
  "intro": "Korte inleiding op de les.",
  "zinnen": [
    {
      "id": "r1-tavolo-per-due",
      "it": "Vorrei un tavolo per due, per favore.",
      "nl": "Ik wil graag een tafel voor twee, alstublieft.",
      "uitleg": "Waarom je het zo zegt (verplicht).",
      "cultuurtip": "Optioneel: een weetje over Italië.",
      "twijfel": "Optioneel: waarom deze zin nog gecontroleerd moet worden."
    }
  ]
}
```

| Veld | Verplicht | Betekenis |
|---|---|---|
| `id` (les) | ja | Unieke naam van de les, bijv. `bar-1`. Hiermee wordt je voortgang onthouden: **niet meer wijzigen** na gebruik. |
| `titel` | ja | Wordt getoond in het overzicht. |
| `zinnen` | ja | De zinnen van de les. Werkt het best met **4 tot 8 zinnen**. |
| `id` (zin) | ja | Unieke naam van de zin, bijv. `b1-cappuccino`. |
| `it` / `nl` | ja | De Italiaanse zin en de Nederlandse vertaling. |
| `uitleg` | ja | Korte uitleg, wordt getoond bij de introductie en bij een fout antwoord. |
| `cultuurtip` | nee | Geeft een geel tip-blok. |
| `twijfel` | nee | Geeft een ⚠️ "Nog te controleren"-blok. Haal het weg zodra de zin is gecontroleerd. |

**Tips**
- Zet leestekens gewoon in de zin (`?`, `!`, `,`). Bij de woordblokjes worden ze automatisch weggelaten.
- Zinnen van minimaal 3 woorden worden ook gebruikt voor de woordblokjes-oefening.
- Let op JSON-regels: tekst tussen dubbele aanhalingstekens `"…"`, een komma tussen items, **geen** komma na het laatste item. Gebruik in teksten liever een enkel aanhalingsteken `'…'`.

## 2. De les aanmelden in `content/themes.json`

Voeg het pad toe aan de lijst `lessen` van het juiste thema:

```json
{
  "id": "bar",
  "titel": "Bar en café",
  "emoji": "☕",
  "beschrijving": "Koffie bestellen, aan de bar of aan tafel",
  "lessen": ["bar/les-1.json"]
}
```

Een thema met een lege lijst `lessen` wordt getoond als "Binnenkort".

## 3. Offline beschikbaar maken

Open `sw.js`, voeg het nieuwe bestand toe aan de lijst `BESTANDEN` en verhoog het versienummer (`ciao-v1` → `ciao-v2`). Vergeet je dit, dan werkt de les nog steeds online, alleen niet offline.

## 4. Controleren

Start de app lokaal (zie README) en open de nieuwe les. Zie je "Oeps 😅 De lessen konden niet geladen worden", dan zit er meestal een typfout in de JSON (vaak een komma). Plak het bestand in https://jsonlint.com om de fout te vinden.
