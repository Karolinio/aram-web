import { useEffect, useRef, useState } from 'react'
import type { Slot } from '../../gerichte.ts'

/**
 * Ein Gericht-Slot — der reservierte Platz für ein freigestelltes Foto.
 *
 * ═══ Warum das kein Platzhalter ist ═══
 *
 * Ein Platzhalter ist ein Loch, um das herum gebaut wurde; wenn das Bild kommt, passt
 * es nicht. Dieser Slot ist VERMESSEN: Seitenverhältnis, Breite, Z-Ebene, Drehung und
 * Scrollabschnitt stehen in `src/gerichte.ts` und gelten mit und ohne Foto. Der Raum,
 * den das Foto einnehmen wird, ist jetzt schon exakt derselbe.
 *
 * Kommt das Foto, ändert sich genau eine Sache: statt der Umrissfläche steht ein
 * <img> darin. Kein Layout wird angefasst.
 *
 * ═══ Die Marke im DOM ═══
 *
 * Jeder Slot schreibt einen HTML-Kommentar und `data-slot` ins DOM. Wer im Browser
 * den Inspektor öffnet, sieht sofort, welches Gericht hier hingehört und wie es
 * fotografiert werden muss — ohne in den Code zu sehen.
 */

type Props = {
  slot: Slot
  /** Wird von der Sektion gesetzt: 0–1 Fortschritt der Sektion. */
  fortschritt?: number
  className?: string
}

/** Liegt das Foto schon in public/bilder/? Wird zur Laufzeit geprüft, nicht geraten. */
function useFoto(id: string) {
  const [da, setDa] = useState<boolean | null>(null)
  useEffect(() => {
    let lebt = true
    const bild = new Image()
    bild.onload = () => lebt && setDa(true)
    bild.onerror = () => lebt && setDa(false)
    bild.src = `/bilder/${id}.webp`
    return () => { lebt = false }
  }, [id])
  return da
}

export default function Gericht({ slot, fortschritt = 0, className = '' }: Props) {
  const foto = useFoto(slot.id)
  const ref = useRef<HTMLDivElement>(null)

  /* Der Slot bewegt sich in seinem eigenen Abschnitt, nicht über die ganze Sektion.
     0 vor dem Abschnitt, 1 danach — sonst zappelt er, wenn zwei Slots sich
     überlappen. */
  const [von, bis] = slot.fortschritt
  const t = Math.min(1, Math.max(0, (fortschritt - von) / Math.max(0.0001, bis - von)))
  /* Weiche Kurve, damit die Ankunft nicht linear wirkt. */
  const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

  const [drehVon, drehBis] = slot.drehung
  const dreh = drehVon + (drehBis - drehVon) * e
  /* Aus der Tiefe nach vorn: kleiner und dunkler kommt es, grösser und heller wird es.
     Die Ebene bestimmt, wie weit hinten es startet. */
  const tiefe = -220 * slot.ebene * (1 - e)
  const skala = 0.82 + 0.18 * e
  const helligkeit = 0.45 + 0.55 * e

  return (
    <div
      ref={ref}
      className={`gericht ${className}`}
      data-slot={slot.id}
      data-ebene={slot.ebene}
      data-freisteller={slot.freisteller}
      style={{
        /* Der reservierte Platz — gilt mit und ohne Foto. */
        width: `min(${slot.breiteVw}vw, 82vw)`,
        aspectRatio: String(slot.verhaeltnis),
        transform: `translateZ(${tiefe}px) scale(${skala}) rotate(${dreh}deg)`,
        filter: `brightness(${helligkeit})`,
        zIndex: slot.ebene,
      }}
    >
      {/* Unsichtbar im Bild, sichtbar im Inspektor:
          welches Gericht, wie zu fotografieren. */}
      {import.meta.env.DEV && (
        <span
          hidden
          data-aufnahme={slot.aufnahme}
          data-verhaeltnis={slot.verhaeltnis}
          data-drehung={slot.drehung.join('→')}
        />
      )}

      {foto ? (
        <img
          src={`/bilder/${slot.id}.webp`}
          alt={slot.name}
          className="gericht__bild"
          loading={slot.ebene === 3 ? 'eager' : 'lazy'}
          decoding="async"
        />
      ) : (
        <SlotUmriss slot={slot} />
      )}
    </div>
  )
}

/**
 * Der Umriss, solange kein Foto da ist.
 *
 * Er sieht ausdrücklich NICHT nach fertigem Bild aus. Ein grauer Kasten, der so tut,
 * als wäre er ein Foto, führt dazu, dass jemand die Seite für fertig hält — und dann
 * geht sie mit grauen Kästen live.
 */
function SlotUmriss({ slot }: { slot: Slot }) {
  return (
    <div className="umriss" role="img" aria-label={`Platzhalter: ${slot.name}, Foto fehlt noch`}>
      <svg className="umriss__rahmen" aria-hidden="true">
        <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="10" />
      </svg>
      <div className="umriss__text">
        <span className="umriss__name">{slot.name}</span>
        <span className="umriss__art">{slot.freisteller ? 'freigestellt' : 'rechteckig'}</span>
        <span className="umriss__masse">
          {slot.verhaeltnis.toFixed(2)} : 1 · {slot.breiteVw} vw
        </span>
      </div>
    </div>
  )
}
