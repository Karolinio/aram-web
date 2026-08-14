import { useEffect, useRef, useState } from 'react'
import Gericht from './ui/Gericht.tsx'
import { slotsVon } from '../gerichte.ts'

/**
 * Sektion 3 — Vom Teig zum Fatayer. DAS SHOWPIECE.
 *
 * ═══ Warum diese Sektion und keine andere ═══
 *
 * Der beste Satz des Ladens steht auf ihrer alten Seite: „Du siehst zu, wie dein
 * Fatayer entsteht." Diese Sektion tut das, statt es zu behaupten. Alles andere auf
 * der Seite bleibt eine Zeile — drei gleich detaillierte Sektionen konkurrieren, und
 * die Seite liest sich als Demo-Reel statt als Laden.
 *
 * ═══ Die Mechanik ═══
 *
 * Die Sektion pinnt über vier Bildschirmhöhen. In der Mitte steht EIN Stück Teig, und
 * es verwandelt sich in vier Zuständen: gerollt → belegt → im Ofen → fertig. Die vier
 * Fotos sind aus derselben Kameraposition aufgenommen (siehe `gerichte.ts`), deshalb
 * ist der Wechsel eine Verwandlung und kein Bilderwechsel.
 *
 * Getrieben wird es vom Scrollfortschritt, nicht von einer Zeitleiste: wer zurück
 * scrollt, sieht den Teig zurückgehen. Eine Animation, die nur vorwärts läuft, ist
 * ein Video mit Extraschritten.
 *
 * Bei `prefers-reduced-motion` entfällt das Pinnen und die vier Zustände stehen
 * untereinander — ersetzt, nicht weggelassen.
 */

const SCHRITTE = [
  { titel: 'Gerollt', text: 'Morgens von Hand. Kein Teig aus dem Beutel, keine Maschine.' },
  { titel: 'Belegt', text: 'Erst wenn du bestellst. Deshalb dauert es ein paar Minuten länger.' },
  { titel: 'Im Ofen', text: 'Steinofen, volle Hitze. Zwei bis drei Minuten, mehr braucht es nicht.' },
  { titel: 'Fertig', text: 'Direkt aus dem Ofen in deine Hand. So warm wie es nie wieder wird.' },
]

export default function Weg() {
  const huelle = useRef<HTMLDivElement>(null)
  const [f, setF] = useState(0)
  const [ruhig, setRuhig] = useState(false)
  const schritte = slotsVon('weg')

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setRuhig(mq.matches)
    const an = () => setRuhig(mq.matches)
    mq.addEventListener('change', an)
    return () => mq.removeEventListener('change', an)
  }, [])

  useEffect(() => {
    if (ruhig) return
    const el = huelle.current
    if (!el) return
    let laeuft = false
    const messen = () => {
      laeuft = false
      const r = el.getBoundingClientRect()
      /* Fortschritt innerhalb der gepinnten Strecke: 0 wenn die Oberkante oben
         ankommt, 1 wenn die Unterkante oben ankommt. */
      const strecke = r.height - window.innerHeight
      const p = strecke <= 0 ? 0 : -r.top / strecke
      setF(Math.min(1, Math.max(0, p)))
    }
    const anstossen = () => {
      if (laeuft) return
      laeuft = true
      requestAnimationFrame(messen)
    }
    window.addEventListener('scroll', anstossen, { passive: true })
    window.addEventListener('resize', anstossen)
    messen()
    return () => {
      window.removeEventListener('scroll', anstossen)
      window.removeEventListener('resize', anstossen)
    }
  }, [ruhig])

  /* Welcher Schritt ist gerade dran? Vier Schritte auf 0–1 verteilt. */
  const aktiv = Math.min(SCHRITTE.length - 1, Math.floor(f * SCHRITTE.length))

  if (ruhig) {
    return (
      <section id="weg" className="weg weg--ruhig" aria-labelledby="weg-titel">
        <div className="schale">
          <header className="weg__kopf">
            <p className="augenbraue">Das Showpiece</p>
            <h2 id="weg-titel">Vom Teig zum Fatayer.</h2>
          </header>
          <ol className="weg__liste">
            {schritte.map((s, i) => (
              <li key={s.id} className="weg__stufe">
                <Gericht slot={s} fortschritt={1} />
                <div>
                  <h3>{SCHRITTE[i].titel}</h3>
                  <p className="leise">{SCHRITTE[i].text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    )
  }

  return (
    <div ref={huelle} className="weg__huelle" style={{ height: '400vh' }}>
      <section id="weg" className="weg" aria-labelledby="weg-titel">
        <div className="schale weg__buehne">
          <header className="weg__kopf">
            <p className="augenbraue">Das Showpiece</p>
            <h2 id="weg-titel">Vom Teig zum Fatayer.</h2>
          </header>

          <div className="weg__mitte">
            {schritte.map((s, i) => {
              /* Jeder Zustand blendet in seinem Abschnitt auf und wieder ab. Nur
                 der aktive traegt Deckkraft — so wird aus vier Bildern eine
                 Verwandlung. */
              const [von, bis] = s.fortschritt
              const drin = f >= von - 0.08 && f <= bis + 0.08
              const nah = 1 - Math.min(1, Math.abs(f - (von + bis) / 2) / 0.18)
              return (
                <div
                  key={s.id}
                  className="weg__zustand"
                  style={{ opacity: drin ? Math.max(0, nah) : 0 }}
                  aria-hidden={i !== aktiv}
                >
                  <Gericht slot={s} fortschritt={f} />
                </div>
              )
            })}
          </div>

          <ol className="weg__takte">
            {SCHRITTE.map((s, i) => (
              <li key={s.titel} className={i === aktiv ? 'ist-aktiv' : ''}>
                <span className="weg__zahl">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.titel}</h3>
                <p className="leise">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  )
}
