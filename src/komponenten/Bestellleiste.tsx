import { leeren, nachricht, stueckZahl, whatsappLink } from '../bestellung.ts'
import { useBestellung } from '../useBestellung.ts'

/**
 * Die Leiste am unteren Rand: was ausgewählt ist, und ein Knopf nach WhatsApp.
 *
 * ═══ Warum unten und nicht oben ═══
 *
 * Bestellt wird im Stehen, mit einer Hand. Am Handy klebt die Leiste deshalb am
 * unteren Rand, in Daumenreichweite; am Rechner sitzt sie unten rechts. Ein
 * Bestellknopf in der Kopfzeile ist am Handy die am schlechtesten erreichbare
 * Stelle des Bildschirms.
 *
 * ═══ Was der Knopf tut und was nicht ═══
 *
 * Er öffnet WhatsApp mit fertig getipptem Text. Er schickt nichts ab, er
 * bezahlt nichts, er verwaltet nichts. Der Gast liest, ergänzt vielleicht noch
 * etwas und drückt selbst auf Senden.
 */
export default function Bestellleiste() {
  const auswahl = useBestellung()
  if (auswahl.length === 0) return null

  const stueck = stueckZahl(auswahl)

  return (
    <div className="leiste" role="region" aria-label="Deine Bestellung">
      <div className="leiste__innen">
        <div className="leiste__wort">
          <p className="leiste__zahl">
            {stueck} {stueck === 1 ? 'Stück' : 'Stück'}
          </p>
          <p className="leiste__liste" title={nachricht(auswahl)}>
            {auswahl.map((e) => `${e.anzahl}× ${e.name}`).join(', ')}
          </p>
        </div>

        <div className="leiste__knoepfe">
          <button type="button" className="leiste__leeren" onClick={leeren}>
            Leeren
          </button>
          <a
            className="knopf knopf--glut"
            href={whatsappLink(auswahl)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Per WhatsApp bestellen
          </a>
        </div>
      </div>
    </div>
  )
}
