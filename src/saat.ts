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
 * Stattdessen schreibt EINE Schleife zwei Zahlen, und alle Ebenen lesen sie
 * über `var()`. Der Browser rechnet die Verschiebung dann im Compositor, ohne
 * eine einzige Ebene neu zu zeichnen.
 *
 * ═══ An die EBENEN geschrieben, nicht an die Wurzel (21.09.) ═══
 *
 * Bis zum 21.09. standen die beiden Werte am Wurzelelement. Das Profil am
 * gedrosselten Handy zeigte diese Schleife als teuerste Funktion der Seite:
 * eine geerbte Eigenschaft an `<html>` zu ändern heisst, dass der Browser den
 * Stil JEDES Elements der Seite neu prüft — jedes Bild, sechzig Mal je
 * Sekunde, solange gescrollt wird. Geschrieben an die sieben Ebenen selbst
 * prüft er sieben Elemente. Dieselbe Zahl, hundertfach weniger Arbeit.
 *
 * Und die Schleife hält an, sobald sich nichts mehr bewegt: Schub abgeklungen,
 * Seite am Ziel. Ein Bild je Sekunde ohne Änderung ist billig, aber sechzig
 * sind es nicht, und die Seite steht die meiste Zeit still.
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

  /* Die Ebenen entstehen erst mit dem React-Baum; darum werden sie beim
     ersten Takt geholt, nicht hier. */
  let ebenen: HTMLElement[] = []
  const ebenenHolen = () => {
    if (ebenen.length === 0) {
      ebenen = Array.from(document.querySelectorAll<HTMLElement>('.untergrund__saat'))
    }
    return ebenen
  }
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

  /* Ob gerade ein Takt angemeldet ist. Die Schleife läuft nur, solange sich
     etwas bewegt — siehe oben. */
  let taktet = false

  const anstossen = () => {
    if (!laeuft || taktet) return
    taktet = true
    id = requestAnimationFrame(takt)
  }

  const scrollen = () => {
    const jetzt = window.scrollY
    const tempo = Math.abs(jetzt - letzterY)
    letzterY = jetzt
    /* Gedeckelt: ein Sprung über die halbe Seite (Ankerklick) darf die Saat
       nicht durch die Sektion schiessen. */
    schub = Math.min(SCHUB_MAX, schub + Math.min(tempo, 60) * 0.9)
    anstossen()
  }

  const zeiger = (e: PointerEvent) => {
    zielSeite = ((e.clientX / window.innerWidth) * 2 - 1) * SEITE_MAX
    anstossen()
  }

  const takt = () => {
    taktet = false
    if (!laeuft) return
    schub *= ABKLINGEN
    seite += (zielSeite - seite) * TRAEGHEIT
    const s = Math.round(schub * 10) / 10
    const q = Math.round(seite * 10) / 10
    const schubNeu = s !== letzterSchub
    const seiteNeu = q !== letzteSeite
    if (schubNeu || seiteNeu) {
      for (const e of ebenenHolen()) {
        if (schubNeu) e.style.setProperty('--saat-schub', `${s}px`)
        if (seiteNeu) e.style.setProperty('--saat-seite', `${q}px`)
      }
      letzterSchub = s
      letzteSeite = q
    }
    /* Weiter nur, solange noch etwas abklingt oder nachläuft. */
    if (schub > 0.05 || Math.abs(zielSeite - seite) > 0.05) anstossen()
  }

  window.addEventListener('scroll', scrollen, { passive: true })
  window.addEventListener('pointermove', zeiger, { passive: true })

  return () => {
    laeuft = false
    cancelAnimationFrame(id)
    window.removeEventListener('scroll', scrollen)
    window.removeEventListener('pointermove', zeiger)
    for (const e of ebenen) {
      e.style.removeProperty('--saat-schub')
      e.style.removeProperty('--saat-seite')
    }
  }
}
