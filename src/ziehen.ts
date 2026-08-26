import { useEffect, useRef, useState } from 'react'

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

export function useZiehband<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [stand, setStand] = useState<Stand>({ links: false, rechts: true })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const messen = () => {
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
      beobachter.disconnect()
    }
  }, [])

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
