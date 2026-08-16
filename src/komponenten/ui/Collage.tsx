import { GEBAECKE } from '../../gebaecke.ts'

/**
 * Die stille Collage im Hintergrund.
 *
 * ═══ Was sie ist und was sie ausdrücklich nicht ist ═══
 *
 * Ihre Gerichte, sehr blass, verstreut über den Clay-Grund. Sie soll NICHT
 * auffallen — sie soll dafür sorgen, dass die Fläche nicht leer ist. Der
 * Unterschied zwischen einer ruhigen Fläche und einer leeren ist, dass die
 * ruhige etwas trägt, das man erst beim zweiten Hinsehen bemerkt.
 *
 * Deshalb die harten Grenzen, und sie sind der ganze Trick:
 *
 *   Deckkraft   höchstens 9 % — darüber wird aus Textur ein Muster
 *   Bewegung    keine. Der Schwarm fliegt, die Collage liegt still.
 *   Schärfe     keine Kanten: sie liegt unter dem Papierkorn und unter allem
 *               anderen, `z-index: 0`
 *
 * ═══ Warum die Anordnung fest ist und nicht zufällig ═══
 *
 * Zufällige Positionen ergeben immer irgendwo drei Stücke, die sich zu einem
 * Fleck überlagern — und ein Fleck ist keine Collage, sondern ein Schmutzrand.
 * Die Werte unten sind gesetzt: keine zwei Stücke näher als eine halbe Breite,
 * und die Grössen wechseln, damit kein Raster entsteht.
 */

type Stueck = {
  /** Index in GEBAECKE. */
  g: number
  /** Welche Ansicht dieses Gerichts. */
  a: number
  li: number
  ob: number
  gr: number
  dreh: number
  deck: number
}

const STUECKE: Stueck[] = [
  { g: 1, a: 0, li: -4, ob: 4, gr: 20, dreh: -14, deck: 0.075 },
  { g: 4, a: 1, li: 26, ob: 22, gr: 13, dreh: 9, deck: 0.06 },
  { g: 2, a: 2, li: 62, ob: 2, gr: 17, dreh: 18, deck: 0.07 },
  { g: 5, a: 0, li: 86, ob: 26, gr: 15, dreh: -8, deck: 0.055 },
  { g: 3, a: 1, li: 6, ob: 52, gr: 14, dreh: 22, deck: 0.065 },
  { g: 7, a: 2, li: 44, ob: 62, gr: 19, dreh: -19, deck: 0.06 },
  { g: 6, a: 0, li: 74, ob: 58, gr: 12, dreh: 12, deck: 0.07 },
  { g: 0, a: 0, li: 18, ob: 82, gr: 16, dreh: -6, deck: 0.055 },
  { g: 2, a: 1, li: 58, ob: 88, gr: 11, dreh: 26, deck: 0.06 },
  { g: 4, a: 2, li: 92, ob: 80, gr: 14, dreh: -22, deck: 0.05 },
]

export default function Collage() {
  return (
    <div className="collage" aria-hidden="true">
      {STUECKE.map((s, i) => {
        const g = GEBAECKE[s.g]
        if (!g) return null
        const quelle = g.bilder[Math.min(s.a, g.bilder.length - 1)]
        return (
          <img
            key={i}
            className="collage__stueck"
            src={quelle}
            alt=""
            width={g.breite}
            height={g.hoehe}
            loading="lazy"
            decoding="async"
            style={{
              left: `${s.li}%`,
              top: `${s.ob}%`,
              width: `${s.gr}%`,
              opacity: s.deck,
              transform: `rotate(${s.dreh}deg)`,
            }}
          />
        )
      })}
    </div>
  )
}
