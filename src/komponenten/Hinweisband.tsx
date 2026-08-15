import { inhalt, hinweisGilt } from '../inhalt.ts'

/**
 * Das Band ganz oben: Urlaub, Feiertag, kurzfristige Änderung.
 *
 * Inhalt kommt aus `inhalt/hinweis.json` und wird vom Kunden selbst gepflegt —
 * einer von genau zwei Bereichen, die er anfassen darf.
 *
 * `hinweisGilt()` prüft das Ablaufdatum mit. Ein Urlaubshinweis, der im
 * September noch von August erzählt, ist schlimmer als gar keiner: er sagt dem
 * Gast, dass hier niemand hinschaut.
 */
export default function Hinweisband() {
  if (!hinweisGilt()) return null

  return (
    <aside className="hinweisband">
      <div className="schale hinweisband__zeile">
        <span className="hinweisband__punkt" aria-hidden="true" />
        <p className="hinweisband__text">{inhalt.hinweis.text}</p>
      </div>
    </aside>
  )
}
