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
/**
 * Die beiden lateinischen Schriftschnitte vorladen.
 *
 * ═══ Der Sprung, den das behebt ═══
 *
 * Gemessen unter gedrosseltem Mobilfunk: in etwa jedem dritten Durchgang
 * meldete der Prüfer CLS um 0,067 — als Quelle standen Fliesstext-Absätze im
 * Befund, an wechselnden Stellen. Das ist die Unterschrift eines späten
 * Schriftwechsels: die Schrift trifft ein, während jemand schon mitten in der
 * Seite ist, und ein Absatz bricht neu um.
 *
 * Die vermessene Ersatzschrift („Reem Ersatz", size-adjust 105,4 %) dämpft das
 * schon — sie trifft die Laufweite im MITTEL. Ein einzelner Absatz kann
 * trotzdem eine Zeile springen.
 *
 * Vorladen verschiebt den Zeitpunkt: ohne diese Zeilen entdeckt der Browser
 * die Schriften erst, nachdem er das Stilblatt geparst hat. Mit ihnen lädt er
 * sie parallel dazu.
 *
 * NUR die lateinischen Schnitte. Reem Kufi bringt auch einen arabischen mit,
 * Fraunces einen vietnamesischen — die kommen auf einer deutschen Seite nie
 * vor, und eine Vorladung, die nicht gebraucht wird, belegt genau die
 * Verbindung, die der Hero braucht.
 */
function schriftenVorladen(bundle: unknown, basis: string): string[] {
  if (!bundle || typeof bundle !== 'object') return []
  return Object.keys(bundle as Record<string, unknown>)
    .filter((d) => /-latin-(full|wght)-normal-[^.]+\.woff2$/.test(d))
    .map(
      (d) =>
        /* `basis` und nicht `/`: unter einem Unterpfad zeigte die Vorladung
           sonst auf die Wurzel der Domäne. Gemessen zwei 404 im Bau für
           /aram-web/ — und weil eine fehlgeschlagene Vorladung LEISE ist
           (die Schrift kommt dann eben über den normalen Weg), fällt es
           nirgends auf ausser im Netzwerkprotokoll. */
        `<link rel="preload" as="font" type="font/woff2" href="${basis}${d}" crossorigin />`,
    )
}

function strukturdatenPlugin(): Plugin {
  return {
    name: 'aram-strukturdaten',
    /* `pre`, damit die Marken im HTML stehen, bevor Vite seine eigenen
       Skript- und Stilverweise einsetzt. */
    transformIndexHtml: {
      /* `post`, damit `ctx.bundle` gefüllt ist: nur dort stehen die
         gehashten Dateinamen der Schriften, und ohne sie kann man sie nicht
         vorladen. */
      order: 'post',
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
          ...schriftenVorladen(ctx.bundle, BASIS),
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
/**
 * Absolute Medienpfade auf den Unterpfad umschreiben.
 *
 * ═══ Wofür ═══
 *
 * Auf GitHub Pages liegt ein Projekt-Repo unter `/aram-web/`, nicht unter `/`.
 * Die Seite verweist an 34 Stellen im Quelltext und dreimal im Stilblatt
 * absolut auf `/bilder/…`, `/video/…` und `/schrift/…` — unter einem Unterpfad
 * zeigen die alle ins Leere.
 *
 * ═══ Warum umschreiben und nicht `import.meta.env.BASE_URL` an 37 Stellen ═══
 *
 * Weil die Pfade dann in JEDER Datei eine Zeichenkettenverkettung wären statt
 * eines lesbaren Literals — und weil `/bilder/reise/schiff.webp` das ist, was
 * auch im Dateisystem steht. Ein Bau-Schritt, der eine bekannte Vorsilbe
 * ersetzt, hält die Quelle lesbar und ist an EINER Stelle nachvollziehbar.
 *
 * Er greift nur, wenn `base` nicht `/` ist. Beim normalen Bau und im
 * Entwicklungsserver passiert nichts.
 */
function unterpfadPlugin(basis: string): Plugin {
  const vorsilben = ['bilder', 'video', 'schrift']
  return {
    name: 'aram-unterpfad',
    enforce: 'pre',
    transform(code, id) {
      if (basis === '/' || id.includes('node_modules')) return null
      if (!/\.(tsx?|css)$/.test(id)) return null
      let neu = code
      for (const v of vorsilben) {
        /* Nur nach Anführungszeichen oder `(` — sonst würde auch ein
           `//bilder` in einem Kommentar getroffen. */
        neu = neu.replace(new RegExp(`(["'\`(])/${v}/`, 'g'), `$1${basis}${v}/`)
      }
      return neu === code ? null : { code: neu, map: null }
    },
  }
}

/**
 * Auf GitHub Pages über die Umgebung gesetzt (siehe .github/workflows/seite.yml),
 * sonst Wurzel.
 *
 * `globalThis` statt `process`: `@types/node` nur für diese eine Zeile
 * aufzunehmen wäre ein Paket für ein Zeichen. Die Konfiguration läuft ohnehin
 * in Node — dort gibt es `process`, TypeScript weiss es hier nur nicht.
 */
const BASIS =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.ARAM_BASIS ?? '/'

export default defineConfig({
  base: BASIS,
  plugins: [unterpfadPlugin(BASIS), react(), strukturdatenPlugin()],
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
