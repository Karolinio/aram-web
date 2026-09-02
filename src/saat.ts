/**
 * Die Saat reagiert auf den Gast.
 *
 * Karol am 02.09.: „lasst die noch ein bisschen interaktiver wirken."
 *
 * ═══ Was reagiert, und worauf ═══
 *
 * Zwei Dinge, und beide sind Bewegungen, die der Gast selbst macht:
 *
 *   SCHUB   Beim Scrollen fallen die Körner schneller. Nicht als Effekt,
 *           sondern weil es stimmt: wer an einem Blech vorbeigeht, wirbelt
 *           Mehl auf. Der Zuschlag klingt nach dem Anhalten in einer knappen
 *           Sekunde ab — ohne dieses Nachlassen wäre es kein Aufwirbeln,
 *           sondern eine zweite Geschwindigkeit.
 *
 *   SEITE   Der Zeiger schiebt die Ebene ein Stück zur Seite. Das ist der
 *           billigste Weg zu Tiefe: die Saat liegt hinter allem, und wenn sie
 *           sich anders bewegt als der Inhalt, liegt sie sichtbar dahinter.
 *
 * ═══ Warum EIN Hörer und nicht einer je Sektion ═══
 *
 * Sieben Sektionen tragen Saat. Sieben Scroll-Hörer und sieben rAF-Schleifen
 * wären siebenmal dieselbe Rechnung — und genau die Art Aufwand, die auf einem
 * Handy als Ruckeln ankommt.
 *
 * Stattdessen schreibt EINE Schleife zwei Zahlen an das Wurzelelement, und
 * alle sieben Ebenen lesen sie über `var()`. Der Browser rechnet die
 * Verschiebung dann im Compositor, ohne eine einzige Ebene neu zu zeichnen.
 *
 * ═══ Warum `translate` und nicht `transform` ═══
 *
 * Das Rieseln ist eine Keyframe-Animation auf `transform`. Würde die
 * Interaktion dieselbe Eigenschaft anfassen, überschriebe eine die andere —
 * still, ohne Fehlermeldung. `translate` ist eine EIGENE Eigenschaft und wird
 * VOR `transform` angewandt; beide gelten nebeneinander.
 */

/** Wie weit der Zeiger die Ebene höchstens zur Seite schiebt. */
const SEITE_MAX = 14
/** Wie viel Zuschlag volle Scrollgeschwindigkeit gibt, in Pixeln. */
const SCHUB_MAX = 90
/** Wie schnell der Schub nachlässt. 0,9 je Bild sind rund 0,4 Sekunden. */
const ABKLINGEN = 0.9
/** Wie träge die Seitwärtsbewegung dem Zeiger folgt. */
const TRAEGHEIT = 0.06

export function saatBeleben(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => {}
  }

  const wurzel = document.documentElement
  let letzterY = window.scrollY
  let schub = 0
  let seite = 0
  let zielSeite = 0
  let laeuft = true
  let id = 0
  /* Nur schreiben, wenn sich etwas geändert hat. Ein `setProperty` je Bild auf
     dem Wurzelelement macht sonst auch dann Arbeit, wenn die Seite stillsteht. */
  let letzterSchub = -1
  let letzteSeite = -1

  const scrollen = () => {
    const jetzt = window.scrollY
    const tempo = Math.abs(jetzt - letzterY)
    letzterY = jetzt
    /* Gedeckelt: ein Sprung über die halbe Seite (Ankerklick) darf die Saat
       nicht durch die Sektion schiessen. */
    schub = Math.min(SCHUB_MAX, schub + Math.min(tempo, 60) * 0.9)
  }

  const zeiger = (e: PointerEvent) => {
    zielSeite = ((e.clientX / window.innerWidth) * 2 - 1) * SEITE_MAX
  }

  const takt = () => {
    if (!laeuft) return
    schub *= ABKLINGEN
    seite += (zielSeite - seite) * TRAEGHEIT
    const s = Math.round(schub * 10) / 10
    const q = Math.round(seite * 10) / 10
    if (s !== letzterSchub) {
      wurzel.style.setProperty('--saat-schub', `${s}px`)
      letzterSchub = s
    }
    if (q !== letzteSeite) {
      wurzel.style.setProperty('--saat-seite', `${q}px`)
      letzteSeite = q
    }
    id = requestAnimationFrame(takt)
  }

  window.addEventListener('scroll', scrollen, { passive: true })
  window.addEventListener('pointermove', zeiger, { passive: true })
  id = requestAnimationFrame(takt)

  return () => {
    laeuft = false
    cancelAnimationFrame(id)
    window.removeEventListener('scroll', scrollen)
    window.removeEventListener('pointermove', zeiger)
    wurzel.style.removeProperty('--saat-schub')
    wurzel.style.removeProperty('--saat-seite')
  }
}
