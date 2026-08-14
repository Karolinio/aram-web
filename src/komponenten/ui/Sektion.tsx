import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Eine Sektion, die ihren eigenen Scrollfortschritt kennt.
 *
 * ═══ Warum nicht GSAP ScrollTrigger für ALLES ═══
 *
 * ScrollTrigger ist richtig für das gepinnte Showpiece — dort wird der Scroll
 * angehalten und eine Zeitleiste daran gebunden. Für „wo bin ich in dieser Sektion"
 * ist ein IntersectionObserver plus ein rAF-gedrosselter Fortschritt billiger und
 * hält auf dem Handy durch: kein Layout-Thrashing, keine Scroll-Handler-Kette.
 *
 * Der Fortschritt ist 0, wenn die Sektion von unten hereinkommt, und 1, wenn sie
 * oben hinausgeht. Genau der Wert, den die Gerichte-Slots erwarten.
 */

type Props = {
  id: string
  className?: string
  /** Bekommt den Fortschritt 0–1. Als Funktion, damit nur gerechnet wird, wer es braucht. */
  children: ReactNode | ((fortschritt: number) => ReactNode)
  'aria-labelledby'?: string
}

export default function Sektion({ id, className = '', children, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null)
  const [fortschritt, setFortschritt] = useState(0)
  const braucht = typeof children === 'function'

  useEffect(() => {
    if (!braucht) return
    const el = ref.current
    if (!el) return

    /* Bei reduzierter Bewegung steht der Fortschritt auf 1: alles ist angekommen,
       nichts bewegt sich. Ersetzt, nicht weggelassen. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFortschritt(1)
      return
    }

    let laeuft = false
    let sichtbar = false

    const messen = () => {
      laeuft = false
      const r = el.getBoundingClientRect()
      const h = window.innerHeight
      /* 0 sobald die Oberkante am unteren Rand steht, 1 wenn die Unterkante oben raus ist. */
      const p = (h - r.top) / (h + r.height)
      setFortschritt(Math.min(1, Math.max(0, p)))
    }

    const anstossen = () => {
      if (laeuft || !sichtbar) return
      laeuft = true
      requestAnimationFrame(messen)
    }

    /* will-change erst beim Eintreten setzen, nicht im Ruhezustand — sonst haelt der
       Browser fuer JEDE Sektion eine eigene Ebene vor, und das Handy wird heiss. */
    const beobachter = new IntersectionObserver(
      ([e]) => {
        sichtbar = e.isIntersecting
        el.style.willChange = sichtbar ? 'transform' : 'auto'
        if (sichtbar) anstossen()
      },
      { rootMargin: '120px 0px' },
    )
    beobachter.observe(el)
    window.addEventListener('scroll', anstossen, { passive: true })
    window.addEventListener('resize', anstossen)
    messen()

    return () => {
      beobachter.disconnect()
      window.removeEventListener('scroll', anstossen)
      window.removeEventListener('resize', anstossen)
      el.style.willChange = 'auto'
    }
  }, [braucht])

  return (
    <section ref={ref} id={id} className={className} {...rest}>
      {braucht ? (children as (f: number) => ReactNode)(fortschritt) : children}
    </section>
  )
}
