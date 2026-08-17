import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

import { ARAM } from './src/aram.config.ts'
import { luecketStrukturdaten, strukturdaten } from './src/strukturdaten.ts'

/**
 * Strukturierte Daten und Vorschaubilder — in die STATISCHE Seite.
 *
 * ═══ Warum beim Bauen und nicht zur Laufzeit ═══
 *
 * Google führt JavaScript aus und würde einen nachträglich eingesetzten
 * Datensatz auch finden. Die Scraper von WhatsApp, iMessage, Instagram und
 * Signal tun das NICHT — sie lesen das ausgelieferte HTML und nichts sonst.
 * Ein `og:image`, das erst React einsetzt, ist für jeden geteilten Link
 * unsichtbar, und geteilte Links sind bei einem Imbiss der halbe Verkehr.
 *
 * Deshalb schreibt dieses Plugin die Angaben in `index.html`, bevor die Datei
 * ausgeliefert wird.
 *
 * ═══ Warum es sich beschwert statt zu raten ═══
 *
 * Fehlt die Domäne, gibt es kein `og:image` und kein `url` — und der Bau sagt
 * das laut. Eine halbe Angabe ist bei strukturierten Daten schlimmer als
 * keine: sie erscheint im Suchergebnis, wo niemand sie mehr richtigstellt.
 */
function strukturdatenPlugin(): Plugin {
  return {
    name: 'aram-strukturdaten',
    /* `pre`, damit die Marken im HTML stehen, bevor Vite seine eigenen
       Skript- und Stilverweise einsetzt. */
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        /* Nur die Seite, nicht der Stilbogen: der trägt `noindex` und gehört
           zur Werkstatt. */
        if (!ctx.path.endsWith('index.html')) return html

        const d = ARAM.web.domain
        const marken = [
          `<meta property="og:type" content="restaurant.restaurant" />`,
          `<meta property="og:locale" content="de_DE" />`,
          `<meta property="og:site_name" content="${ARAM.name}" />`,
          `<meta property="og:title" content="${ARAM.langname}" />`,
          `<meta property="og:description" content="${ARAM.einzeiler}" />`,
          `<meta name="twitter:card" content="summary_large_image" />`,
          ...(d
            ? [
                `<link rel="canonical" href="${d}/" />`,
                `<meta property="og:url" content="${d}/" />`,
                `<meta property="og:image" content="${d}/bilder/echt/team-laden.webp" />`,
                `<meta property="og:image:width" content="1024" />`,
                `<meta property="og:image:height" content="784" />`,
                `<meta property="og:image:alt" content="Der Inhaber und seine Brüder vor ihrer Tür in Bonn-Hardtberg" />`,
              ]
            : []),
          `<script type="application/ld+json">${JSON.stringify(strukturdaten())}</script>`,
        ].join('\n    ')

        const offen = luecketStrukturdaten()
        if (offen.length > 0) {
          /* eslint-disable no-console */
          console.warn(
            '\n  Strukturierte Daten unvollständig — die Seite wird schlechter gefunden:',
          )
          for (const o of offen) console.warn('    · ' + o)
          console.warn('  Alles davon steht in src/aram.config.ts.\n')
          /* eslint-enable no-console */
        }

        return html.replace('</head>', `  ${marken}\n  </head>`)
      },
    },
  }
}

/**
 * Zwei Einstiege: die Seite und der Stilbogen.
 *
 * Der Stilbogen (`/stil.html`) rendert jeden Token und jedes Bauteil aus
 * DENSELBEN Dateien wie die Seite. Er ist nirgends verlinkt und trägt
 * `noindex` — er gehört zur Werkstatt, nicht zum Laden. Sein Zweck ist, die
 * Drift zwischen Direktion und Bau sichtbar zu machen, bevor der Kunde sie
 * sieht.
 */
export default defineConfig({
  plugins: [react(), strukturdatenPlugin()],
  build: {
    target: 'es2022',
    cssTarget: 'safari16',
    rollupOptions: {
      /* Relative Pfade statt `resolve(__dirname, …)`: `__dirname` gibt es im
         ES-Modul nicht, und `node:path` zu typisieren hiesse @types/node nur
         für zwei Zeilen aufzunehmen. Vite löst relative Einstiege ohnehin
         gegen die Projektwurzel auf. */
      input: {
        seite: 'index.html',
        stil: 'stil.html',
        /* Pflichtseiten. Eigene Einstiege und keine Ansichten innerhalb der
           Startseite: beide brauchen eine eigene Adresse, weil sie einzeln
           verlinkbar und auffindbar sein müssen. Ein Aufklapper im Fuss hat
           keine — und genau darauf zielt eine Abmahnung. */
        impressum: 'impressum.html',
        datenschutz: 'datenschutz.html',
      },
    },
  },
})
