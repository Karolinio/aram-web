import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

/* `full` und nicht der Standard: nur diese Datei trägt die Achsen SOFT und WONK,
   und ohne WONK ist Fraunces eine gewöhnliche Serife — genau das, was hier nicht
   gebraucht wird. */
import '@fontsource-variable/fraunces/full.css'
/* Reem Kufi bringt vier Untermengen mit, darunter die arabische. Geladen wird
   davon nur, was vorkommt — die Seite ist deutsch, also kommt die lateinische.
   Der `unicode-range` der Schrift entscheidet das, nicht wir. */
import '@fontsource-variable/reem-kufi'
import './stile/grundlage.css'
import './stile/bausteine.css'
import './stile/sektionen.css'

import Kopfzeile from './komponenten/Kopfzeile.tsx'
import Backstube from './komponenten/Backstube.tsx'
import Galerie from './komponenten/Galerie.tsx'
import Reise from './komponenten/Reise.tsx'
import Karte from './komponenten/Karte.tsx'
import Laden from './komponenten/Laden.tsx'
import Bestellen from './komponenten/Bestellen.tsx'
import Fusszeile from './komponenten/Fusszeile.tsx'
import Bestellleiste from './komponenten/Bestellleiste.tsx'
import Wasserzeichen from './komponenten/Wasserzeichen.tsx'
import Mehlstaub from './komponenten/ui/Mehlstaub.tsx'

import { scrollenStarten } from './scrollen.ts'
import { SLOTS } from './gerichte.ts'
import { erzeugteGerichte } from './gebaecke.ts'
import { lueckenVorLive } from './aram.config.ts'
import { preiseFehlen } from './inhalt.ts'

/**
 * Weiches Scrollen — aber NUR, wenn der Nutzer Bewegung will.
 *
 * Die Mechanik steht in src/scrollen.ts, weil sie eine Bedingung hat, die ein
 * Hook nicht garantieren kann: es darf genau EINE Instanz geben, und sie muss
 * sich denselben Ticker mit ScrollTrigger teilen.
 */
function useWeichesScrollen() {
  useEffect(() => {
    let aufraeumen: (() => void) | null = null
    let tot = false

    void scrollenStarten().then((f) => {
      if (tot) f?.()
      else aufraeumen = f
    })

    return () => {
      tot = true
      aufraeumen?.()
    }
  }, [])
}

/**
 * Was noch fehlt, wird laut gesagt — in der Konsole, bei jedem Start.
 *
 * Der teuerste Fehler dieses Auftrags wäre, dass jemand diese Seite für fertig
 * hält. Sie ist es nicht: die Reise fehlt, weil die Aufnahmen fehlen, aus denen
 * sie besteht.
 */
function useLueckenMelden() {
  useEffect(() => {
    if (!import.meta.env.DEV) return
    /* eslint-disable no-console */
    console.groupCollapsed('%cAram — noch nicht live-fähig', 'color:#a33f1e;font-weight:700')
    console.log(
      'Gerichtefotos fehlen:',
      SLOTS.length,
      'Slots —',
      SLOTS.map((s) => s.id).join(', '),
    )
    console.log(
      'Deshalb NICHT gebaut: die Reise (Showpiece). Sie braucht 3–4 freigestellte',
      'Aufnahmen je Gericht rundherum. Um Platzhalter herum gebaut müsste sie beim',
      'Eintreffen der echten Bilder neu komponiert statt bestückt werden.',
    )
    console.log('Preise fehlen:', preiseFehlen(), 'von',
      SLOTS.length > 0 ? 'allen Gerichten der Karte' : '—')
    console.warn(
      'ERZEUGTE Gerichtebilder auf dieser Seite:', erzeugteGerichte(),
      '— sie zeigen NICHT ihr Essen. Siehe public/bilder/erzeugt/LIESMICH.md.',
      'Sobald die echten Fotos da sind: Ordner löschen, nicht ergänzen.',
    )
    console.log('Vor dem Livegang:', lueckenVorLive().join(' · ') || 'nichts')
    console.groupEnd()
    /* eslint-enable no-console */
  }, [])
}

function Seite() {
  useWeichesScrollen()
  useLueckenMelden()

  return (
    <>
      <a className="sprung" href="#start">
        Zum Inhalt springen
      </a>
      <Kopfzeile />
      <Mehlstaub />
      <main>
        <Backstube />
        {/*
          Hier gehört die REISE hin — das Showpiece: ein Käseschiffchen wandert
          scrollgetrieben über drei Sektionen, dreimal fallen Partikel und
          schalten das Bild eine Stufe weiter, am Ende teilt es sich.

          Sie ist nicht gebaut, und das ist Absicht. Sie besteht aus vier
          Aufnahmen desselben Gerichts aus derselben Kameraposition (Teig →
          bemehlt → belegt → gebacken) plus zwei Aufnahmen ganz und geteilt.
          Diese Bilder gibt es noch nicht. Um Platzhalter herum gebaut wäre sie
          beim Eintreffen der echten Bilder neu zu komponieren statt zu
          bestücken — und ein erzeugtes Fatayer kommt nicht in Frage.
        */}
        {/* ═══ Die Handarbeit ist RAUS, und zwar aus drei Gründen ═══

            1. SIE ERZÄHLT DIE REISE NOCH EINMAL. Teig, belegen, Ofen, fertig —
               dieselbe Folge, nur in ruhig. Zwei Erzählungen derselben Sache
               hintereinander sind keine Vertiefung, sondern eine Wiederholung.

            2. SIE TRÄGT DIE VIER ERZEUGTEN GERICHTE. Der Schwarm besteht aus
               einem echten Foto und vier am 15.08. erzeugten. Das war Karols
               ausdrückliche Entscheidung und für eine Verkaufsdemo richtig —
               für eine Seite, die dem Inhaber gezeigt wird, ist es das
               Gefährlichste, was drauf sein kann. Er sieht Essen, das nicht
               seins ist, auf seiner eigenen Seite.

            3. SIE KOSTET DEN SCHEITEL. Mit der vollen Speisekarte (22 Sorten
               statt 9) kam das Handy auf 15,3 Bildschirmhöhen, und der Prüfer
               hat angeschlagen. Ohne diese Sektion passt beides.

            Die Datei bleibt liegen. Sobald echte Aufnahmen der Gerichte da
            sind, ist der Schwarm das erste, was sie zurückbringt. */}
        <Reise />
        {/* Das Schaustück ist RAUS, seit es die Reise gibt. Es war eine
            zweite angeheftete Sequenz mit demselben Zweck — ein Gericht, das
            sich beim Scrollen aufbaut. Zwei davon hintereinander sind keine
            Steigerung, sondern eine Wiederholung, und sie kosteten zusammen
            sechs Bildschirmhöhen. Die Datei bleibt liegen, falls die Reise
            wieder fällt. */}
        {/* Die Galerie steht VOR der Karte, nicht dahinter. Wer wissen will,
            was es gibt, liest die Karte; wer noch nicht weiss, ob er will,
            sieht Bilder. Die Reihenfolge folgt der Entscheidung, nicht der
            Datenmenge. */}
        <Galerie />
        <Karte />
        <Laden />
        <Bestellen />
      </main>
      <Fusszeile />
      <Wasserzeichen />
      <Bestellleiste />
    </>
  )
}

createRoot(document.getElementById('wurzel')!).render(
  <StrictMode>
    <Seite />
  </StrictMode>,
)
