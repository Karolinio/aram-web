import { useEffect, useRef } from 'react'

import { ARAM } from '../aram.config.ts'

/**
 * Ihr Logo als Ladenschild — ein Gegenstand, keine Grafik.
 *
 * ═══ Das Problem, das dieses Bauteil löst ═══
 *
 * Ihre Wortmarke ist comichaft, rot und ein Rasterbild. Gross und flach auf
 * Creme gelegt sieht sie aus wie ein Pizzeria-Handzettel — die Kundenakte hat
 * genau deshalb festgehalten, sie bekomme „einen festen kleinen Platz und werde
 * NICHT vergrössert".
 *
 * Karol will sie trotzdem markant. Der Ausweg ist nicht, sie grösser zu
 * skalieren, sondern ihr eine ANDERE ROLLE zu geben: sie wird zu dem, was sie in
 * der Wirklichkeit ohnehin ist — dem beleuchteten Schild über ihrer Ladentür.
 * Auf ihrem eigenen Teamfoto hängt genau dieses Schild.
 *
 * Als Gegenstand darf sie comichaft sein. Ein Ladenschild ist comichaft. Was
 * nicht ginge, wäre dieselbe Grafik als flaches Seitenelement.
 *
 * ═══ Wie die Tiefe entsteht ═══
 *
 * Aus gestapelten `drop-shadow`-Durchgängen, nicht aus Geometrie. Jeder
 * Durchgang versetzt die Silhouette um ein Pixel nach unten rechts und dunkelt
 * sie ab; zehn davon ergeben eine massive Flanke. Weil `drop-shadow` der ALPHA-
 * KANTE folgt und nicht dem Rechteck, sieht die Flanke wie eine ausgeschnittene
 * Platte aus — bei einem Rasterbild ist das der einzige Weg zu sauberer Kante.
 *
 * ═══ Warum kein GSAP ═══
 *
 * Die Neigung folgt dem Zeiger, nicht dem Scroll. Dafür braucht es keine
 * Zeitleiste, sondern eine Dämpfung: die Zielwerte kommen aus dem Zeiger, die
 * angezeigten laufen ihnen in jedem Frame ein Stück nach. Zwölf Zeilen, keine
 * Bibliothek, und es hört auf, sobald der Zeiger die Bühne verlässt.
 */

/** Wie weit sich das Schild neigt, in Grad. */
const NEIGUNG = 13
/** Wie schnell die Anzeige dem Ziel folgt. Kleiner = träger. */
const DAEMPFUNG = 0.08

export default function Ladenschild() {
  const buehne = useRef<HTMLDivElement>(null)
  const schild = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const b = buehne.current
    const s = schild.current
    if (!b || !s) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    /* Ohne Zeiger gibt es nichts zu folgen. Auf Touch bliebe die Neigung nach
       der Berührung stehen — ein Schild, das schief hängen bleibt. */
    if (!window.matchMedia('(hover: hover)').matches) return

    let zielX = 0
    let zielY = 0
    let istX = 0
    let istY = 0
    let id = 0

    const bewegen = (e: PointerEvent) => {
      const r = b.getBoundingClientRect()
      /* −1 … +1 vom Mittelpunkt der Bühne aus. */
      zielY = ((e.clientX - r.left) / r.width - 0.5) * 2 * NEIGUNG
      zielX = -((e.clientY - r.top) / r.height - 0.5) * 2 * NEIGUNG
    }

    const zurueck = () => {
      zielX = 0
      zielY = 0
    }

    const takt = () => {
      istX += (zielX - istX) * DAEMPFUNG
      istY += (zielY - istY) * DAEMPFUNG
      s.style.transform = `rotateX(${istX.toFixed(2)}deg) rotateY(${istY.toFixed(2)}deg)`
      id = requestAnimationFrame(takt)
    }

    b.addEventListener('pointermove', bewegen)
    b.addEventListener('pointerleave', zurueck)
    id = requestAnimationFrame(takt)

    return () => {
      cancelAnimationFrame(id)
      b.removeEventListener('pointermove', bewegen)
      b.removeEventListener('pointerleave', zurueck)
    }
  }, [])

  return (
    <div className="schild-buehne" ref={buehne}>
      {/* Das Logo TRÄGT die Überschrift — es ist die Wortmarke „Aram", und ein
          zweites gesetztes „Aram" daneben wären zwei Wortmarken, die um
          dieselbe Stelle kämpfen. Für Vorleseprogramme und Suchmaschinen steht
          der Name als Text da, nur unsichtbar. */}
      <h1 id="backstube-titel" className="schild-titel">
        <span className="visuell-versteckt">{ARAM.langname}</span>
        <div className="schild" ref={schild} aria-hidden="true">
          <img
            src="/bilder/echt/logo.webp"
            alt=""
            width={1220}
            height={540}
            loading="eager"
            fetchPriority="high"
            decoding="sync"
          />
        </div>
      </h1>
    </div>
  )
}
