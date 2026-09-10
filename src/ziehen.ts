import { useEffect, useRef, useState } from 'react'

/** Wie viele Bögen EIN Durchlauf hat. Die Liste steht zweimal im Band. */
import { BILDER_JE_SATZ } from './galeriemass.ts'

/**
 * Ein waagerechtes Band, das man mit der Maus zieht.
 *
 * ═══ Warum das den Scroll ablöst ═══
 *
 * Karol am 26.08.: „Man soll als Webseite-Gast die Bögen selber mit der Maus
 * nach links oder rechts bewegen und nicht durch einfaches Runterscrollen.
 * Sonst kann es passieren, dass Kunden nicht jedes Bild links und rechts am
 * Ende genießen können."
 *
 * Der zweite Satz ist der eigentliche Befund und er stimmt: eine Reihe, die
 * vom Scrollstand abhängt, zeigt jedes Bild genau so lange, wie der Besucher
 * zufällig braucht — und wer zügig scrollt, sieht das letzte nie. Bilder
 * ansehen ist keine Bewegung durch die Seite, sondern eine Pause darin. Eine
 * Pause kann man nicht an den Scroll hängen.
 *
 * ═══ Warum ein echter Überlauf und keine gerechnete Verschiebung ═══
 *
 * Der naheliegende Weg wäre, `transform: translateX` beim Ziehen
 * mitzurechnen. Damit baut man drei Dinge selbst nach, die der Browser schon
 * kann und besser kann: Schwung auf dem Trackpad und am Finger, die Grenzen
 * am Anfang und Ende, und die Pfeiltasten.
 *
 * `overflow-x: auto` bringt alles davon mit. Diese Datei fügt nur das eine
 * hinzu, was fehlt: dass man mit gedrückter MAUSTASTE ziehen kann. Finger und
 * Stift lässt sie ausdrücklich in Ruhe — dort scrollt der Browser schon von
 * selbst, mit Schwung, und ein zweiter Regler auf derselben Achse ruckelt.
 */

type Stand = {
  /** Ob nach links noch etwas kommt. */
  links: boolean
  /** Ob nach rechts noch etwas kommt. */
  rechts: boolean
}

/** Ein paar Pixel Toleranz — `scrollLeft` ist bei Zoom und Bruchteilen nie exakt. */
const RAND = 2

/**
 * ═══ Das Schweben ═══
 *
 * Karol am 07.09.: „mach die Bilder so, dass die von alleine von links nach
 * rechts schweben, ohne dass der User extra die Galerie nach links oder nach
 * rechts scrollen muss."
 *
 * Das Ziehen bleibt trotzdem — sein eigener Einwand vom 26.08. gilt weiter:
 * „sonst kann es passieren, dass Kunden nicht jedes Bild am Ende geniessen
 * koennen." Ein Band, das nur von selbst laeuft, nimmt dem Gast genau die
 * Kontrolle wieder weg, die er damals verlangt hat. Also beides: es laeuft von
 * allein, und es haelt an, sobald jemand hinsieht.
 */

/** Wie schnell das Band von allein zieht, in Pixeln je Sekunde. */
const SCHWEBE_TEMPO = 26
/**
 * Wohin.
 *
 * −1 heisst: `scrollLeft` sinkt, die Bilder wandern nach RECHTS — Karols
 * Wortlaut. Wer die Reihe lieber in Leserichtung durchlaufen sieht (Bilder
 * nach links, wie eine Laufschrift), setzt hier +1; sonst aendert sich nichts.
 */
const SCHWEBE_RICHTUNG = -1
/** Wie lange nach einer Beruehrung gewartet wird, bevor es weitergeht. */
const SCHWEBE_RUHE = 1800

/**
 * `jeSatz` statt der festen `BILDER_JE_SATZ`: seit dem 10.09. gibt es ZWEI
 * Baender auf der Seite — die Galerie aus dem Laden und die Produktgalerie —
 * und sie haben unterschiedlich viele Bilder. Eine Konstante fuer beide haette
 * das zweite Band an der falschen Stelle umlaufen lassen.
 */
export function useZiehband<T extends HTMLElement>(schwebt = false, jeSatz = BILDER_JE_SATZ) {
  const ref = useRef<T>(null)
  const [stand, setStand] = useState<Stand>({ links: false, rechts: true })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const messen = () => {
      /* Ein umlaufendes Band hat kein Ende — beide Pfeile bleiben nutzbar.
         Mit der Randmessung wuerden sie beim Umschlag kurz ausgrauen, und ein
         Knopf, der ohne erkennbaren Grund flackert, liest sich als Fehler. */
      if (schwebt) {
        setStand({ links: true, rechts: true })
        return
      }
      const weg = el.scrollWidth - el.clientWidth
      setStand({
        links: el.scrollLeft > RAND,
        rechts: el.scrollLeft < weg - RAND,
      })
    }

    let zieht = false
    let vonX = 0
    let vonLinks = 0

    const runter = (e: PointerEvent) => {
      /* Nur die Maus. Am Finger scrollt der Browser mit Schwung, und ein
         zweiter Regler auf derselben Achse nimmt ihn weg. */
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      zieht = true
      vonX = e.clientX
      vonLinks = el.scrollLeft
      /* Der Zeiger gehört ab jetzt diesem Element — auch wenn er beim Ziehen
         darüber hinausläuft. Ohne das endet jedes Ziehen am Rand der Bahn. */
      el.setPointerCapture(e.pointerId)
      el.classList.add('zieht')
    }

    const bewegen = (e: PointerEvent) => {
      if (!zieht) return
      /* Sonst markiert der Browser beim Ziehen die Bildunterschriften. */
      e.preventDefault()
      el.scrollLeft = vonLinks - (e.clientX - vonX)
    }

    const loslassen = (e: PointerEvent) => {
      if (!zieht) return
      zieht = false
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
      el.classList.remove('zieht')
    }

    /**
     * ═══ Das Schweben, im selben Effekt wie das Ziehen ═══
     *
     * Es MUSS hier stehen und nicht daneben: die beiden schreiben denselben
     * `scrollLeft`. Zwei Effekte auf derselben Zahl waeren zwei Regler auf
     * einer Achse — dieselbe Falle, aus der oben schon der Verzicht auf eine
     * eigene Verschiebung fuer den Finger folgt.
     *
     * Der Umlauf: die Liste steht ZWEIMAL im Band (die zweite Fassung ist fuer
     * Vorleseprogramme versteckt). `satz` ist der Abstand zwischen dem ersten
     * Bogen der einen und dem ersten der anderen Fassung — gemessen, nicht
     * gerechnet, damit Innenabstand und Luecke keine Rolle spielen. Sobald
     * `scrollLeft` um `satz` gewandert ist, steht dort wieder genau dasselbe
     * Bild, und ein Sprung um `satz` faellt niemandem auf.
     */
    let bandId = 0
    let letzteZeit = 0
    let ruhtBis = 0
    let imBild = true
    let zeiger = false
    let fokus = false

    const satzBreite = () => {
      const liste = el.firstElementChild
      const a = liste?.children[0] as HTMLElement | undefined
      const b = liste?.children[jeSatz] as HTMLElement | undefined
      return a && b ? b.offsetLeft - a.offsetLeft : 0
    }

    /**
     * ═══ Die Lage wird MITGEFUEHRT, nicht jedes Bild zurueckgelesen ═══
     *
     * Erster Bau: `el.scrollLeft + delta` je Bild. Gemessen wanderte das Band
     * in 2,5 Sekunden 3 Pixel statt 65.
     *
     * Der Grund ist Rundung. Bei 26 px je Sekunde sind das 0,42 px je Bild —
     * und `scrollLeft` gibt beim Zurueckelesen einen auf Geraetepixel
     * gerundeten Wert. Der Bruchteil ging also in jedem Bild verloren, und
     * uebrig blieb ungefaehr nichts.
     *
     * `lage` fuehrt die Zahl als Fliesskomma weiter. Zurueckgelesen wird nur
     * im Stillstand — dann hat der Gast sie gesetzt, und dann ist sie die
     * richtige.
     */
    let lage = -1

    const takt = (t: number) => {
      bandId = requestAnimationFrame(takt)
      const dt = letzteZeit ? Math.min(60, t - letzteZeit) : 0
      letzteZeit = t
      const satz = satzBreite()
      if (satz <= 0) return
      /* Angehalten wird bei Zeiger, Fokus, Ziehen, ausserhalb des Bildes und
         kurz nach jeder Beruehrung. Der Zeiger deckt die Maus ab, der Fokus
         die Tastatur — beides zusammen ist der Halt, den bewegter Inhalt
         braucht. */
      if (zieht || zeiger || fokus || !imBild || t < ruhtBis) {
        lage = -1
        return
      }
      if (lage < 0) lage = el.scrollLeft
      lage += (SCHWEBE_RICHTUNG * SCHWEBE_TEMPO * dt) / 1000
      if (lage < 0) lage += satz
      else if (lage >= satz) lage -= satz
      el.scrollLeft = lage
    }

    const anhalten = () => {
      ruhtBis = performance.now() + SCHWEBE_RUHE
    }
    const zeigerRein = () => { zeiger = true }
    const zeigerRaus = () => { zeiger = false; anhalten() }
    const fokusRein = () => { fokus = true }
    const fokusRaus = () => { fokus = false; anhalten() }

    let sicht: IntersectionObserver | undefined
    if (schwebt) {
      /* Anfangen, wo Platz nach BEIDEN Seiten ist: bei Richtung −1 sinkt
         `scrollLeft`, und von 0 aus gaebe es beim ersten Bild nichts zu
         unterschreiten. */
      requestAnimationFrame(() => {
        const satz = satzBreite()
        if (satz > 0) el.scrollLeft = SCHWEBE_RICHTUNG < 0 ? satz - 1 : 0
      })
      el.addEventListener('pointerenter', zeigerRein)
      el.addEventListener('pointerleave', zeigerRaus)
      el.addEventListener('focusin', fokusRein)
      el.addEventListener('focusout', fokusRaus)
      el.addEventListener('wheel', anhalten, { passive: true })
      /* Ein Band, das unter dem Fuss der Seite weiterrechnet, ist der Grund,
         warum schoene Seiten auf Handys heiss werden. */
      sicht = new IntersectionObserver(([e]) => { imBild = e.isIntersecting }, { rootMargin: '120px' })
      sicht.observe(el)
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.classList.add('schwebt')
        bandId = requestAnimationFrame(takt)
      }
    }

    el.addEventListener('pointerdown', runter)
    el.addEventListener('pointermove', bewegen)
    el.addEventListener('pointerup', loslassen)
    el.addEventListener('pointercancel', loslassen)
    el.addEventListener('scroll', messen, { passive: true })

    /* Fensterbreite ändert sich, Schriften laden nach, Bilder kommen an —
       jedes davon verschiebt `scrollWidth`. Ein einmal gemessener Stand wäre
       spätestens beim ersten Bild falsch. */
    const beobachter = new ResizeObserver(messen)
    beobachter.observe(el)
    messen()

    return () => {
      el.removeEventListener('pointerdown', runter)
      el.removeEventListener('pointermove', bewegen)
      el.removeEventListener('pointerup', loslassen)
      el.removeEventListener('pointercancel', loslassen)
      el.removeEventListener('scroll', messen)
      el.removeEventListener('pointerenter', zeigerRein)
      el.removeEventListener('pointerleave', zeigerRaus)
      el.removeEventListener('focusin', fokusRein)
      el.removeEventListener('focusout', fokusRaus)
      el.removeEventListener('wheel', anhalten)
      cancelAnimationFrame(bandId)
      sicht?.disconnect()
      el.classList.remove('schwebt')
      beobachter.disconnect()
    }
  }, [schwebt, jeSatz])

  /**
   * Einen Schritt weiter — für die Pfeilknöpfe.
   *
   * Ein Schritt ist die Breite EINES Bogens samt Abstand, nicht eine
   * Fensterbreite: wer auf den Pfeil tippt, will das nächste Bild sehen, nicht
   * drei überspringen. Gemessen wird sie am ersten Kind statt fest
   * hingeschrieben — die Bögen sind je nach Fensterbreite verschieden gross.
   */
  const schieben = (richtung: 1 | -1) => {
    const el = ref.current
    if (!el) return
    /* Wer blaettert, will sehen — nicht mit dem Band um die Position ringen.
       Das `pointerenter` fehlt bei einem Klick auf den Knopf, weil der
       ausserhalb der Bahn liegt. */
    el.dispatchEvent(new WheelEvent('wheel'))
    const erstes = el.querySelector<HTMLElement>(':scope > * > *')
    const schritt = erstes ? erstes.getBoundingClientRect().width + 24 : el.clientWidth * 0.6
    el.scrollBy({
      left: schritt * richtung,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
  }

  return { ref, stand, schieben }
}
