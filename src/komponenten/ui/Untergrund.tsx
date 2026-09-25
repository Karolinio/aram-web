import { useEffect, useRef } from 'react'

import { pfad } from '../../pfad.ts'

/**
 * Der Grund einer Sektion — eine Konstante und zwei Wechselnde.
 *
 * ═══ Was hier vorher stand und warum es nicht trug ═══
 *
 * Sechs Sektionen, sechs verschiedene Fototexturen, sechs Deckkräfte. Karol:
 * „ich will, dass das ein harmonisches Gesamtbild ergibt, bin noch nicht 100 %
 * zufrieden." Er hatte recht: das ist Abwechslung ohne System. Sechs Motive
 * ergeben sechs Eindrücke, nicht einen.
 *
 * ═══ Was Koto zeigt ═══
 *
 * Bei Koto (Mobbin) liegt über der flachen Fläche nur feines KORN — kein Foto,
 * kein Motiv. Es macht aus einer CSS-Farbe eine gedruckte Fläche und stört
 * nie, weil es nichts darstellt. Eat Hungry Tiger zeigt die andere Hälfte
 * derselben Sache: Harmonie kommt aus Zurückhaltung, nicht aus Fülle.
 *
 * ═══ Das System ═══
 *
 *   Korn    auf JEDER Sektion, identisch. Die Konstante, die verbindet.
 *   Saat    Sesam und Schwarzkümmel — die Oberfläche jedes ihrer Gebäcke.
 *           Hier stand ihr Rundbogen; er las sich als Tapete, weil ein
 *           gleichmässig wiederholter Umriss auf festem Raster genau das ist.
 *           Saat liegt nie auf einem Raster und kann es deshalb nicht.
 *   Foto    nur noch dort, wo es etwas BEDEUTET: Mehl in der Handarbeit,
 *           ihr Laden im Bestellen.
 *
 * Eins konstant, zwei im Wechsel, und jede Ausnahme hat einen Grund. Das ist
 * der Unterschied zwischen Rhythmus und Zufall.
 */

type Props = {
  /**
   * Die Farbe der Folie. Sie muss die der Sektion sein — eine Folie, die einen
   * anderen Ton führt als ihr Grund, deckt ihn zu, statt ihn zu tönen.
   */
  ton: 'glut' | 'nacht'
  /** Was über dem Korn liegt. Ohne Angabe: nur Korn. */
  muster?: 'saat' | 'foto'
  /** Nur bei `muster="foto"`: Pfad unter `public/`, ohne führenden Schrägstrich. */
  bild?: string
  /**
   * Wie dicht die Folie über dem FOTO deckt.
   *
   * Auf Orange trägt 0,91 bis 0,94, auf Schwarz braucht es mehr — eine helle
   * Struktur auf dunklem Grund schlägt stärker durch als umgekehrt.
   */
  staerke?: number
  /** Bildausschnitt. */
  lage?: string
  /** Die ECHTEN Masse der Datei — siehe unten, der Prüfer fängt geratene. */
  breite?: number
  hoehe?: number
}

export default function Untergrund({
  ton,
  muster,
  bild,
  staerke = ton === 'nacht' ? 0.96 : 0.92,
  lage = 'center',
  breite,
  hoehe,
}: Props) {
  return (
    <div className="untergrund" aria-hidden="true">
      {muster === 'foto' && bild && (
        <>
          <img
            className="untergrund__bild"
            src={pfad(bild)}
            alt=""
            width={breite}
            height={hoehe}
            style={{ objectPosition: lage }}
            loading="lazy"
            decoding="async"
          />
          <div
            className={`untergrund__folie untergrund__folie--${ton}`}
            style={{ opacity: staerke }}
          />
        </>
      )}

      {/* Kein Bild: die Folie ist der Grund selbst — sonst läge das Muster
          über einer durchsichtigen Fläche und der Sektionsgrund käme
          ungefiltert durch. */}
      {muster !== 'foto' && (
        <div className={`untergrund__folie untergrund__folie--${ton}`} />
      )}

      {muster === 'saat' && <Saat />}

      {/* Das Korn liegt ganz oben und IMMER. Es ist das einzige, was alle
          sieben Sektionen teilen. */}
      <div className="untergrund__korn" />
    </div>
  )
}

/**
 * ═══ Die Saat rieselt nur, wo jemand hinsieht (25.09.) ═══
 *
 * Gemessen am gedrosselten Handy: sieben Sektionen tragen je eine
 * endlos laufende `rieseln`-Animation auf einer sektionsgrossen Ebene, und
 * sieben von acht laufenden Animationen der Seite lagen ausserhalb des
 * Bildes. Jede davon hält eine eigene Grafikebene im Speicher und wird in
 * jedem Bild mit zusammengesetzt — für niemanden.
 *
 * Ausserhalb (mit 25 % Vorlauf, damit der Wechsel nie im Bild passiert)
 * trägt die Ebene `data-ruht`, und das Stilblatt nimmt ihr die Animation
 * ganz weg: pausieren allein liesse die Ebene bestehen. Beim Wiedereintritt
 * beginnt das Rieseln von vorn — unsichtbar, weil es ausserhalb geschieht.
 */
function Saat() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) el.removeAttribute('data-ruht')
        else el.setAttribute('data-ruht', '')
      },
      { rootMargin: '25% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div className="untergrund__saat" ref={ref} data-ruht="" />
}

