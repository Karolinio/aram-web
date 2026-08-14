import Sektion from './ui/Sektion.tsx'
import Gericht from './ui/Gericht.tsx'
import { slotsVon } from '../gerichte.ts'

/**
 * Sektion 2 — Was es gibt.
 *
 * Vier freigestellte Gerichte auf verschiedenen Z-Ebenen, die einander überlappen und
 * beschneiden. Sie kommen nacheinander aus der Tiefe — jedes in seinem eigenen
 * Scrollabschnitt, damit nicht vier Dinge gleichzeitig ankommen.
 *
 * Die Anordnung ist bewusst NICHT ein Raster: ein Vierer-Raster mit gleich grossen
 * Karten ist die Lieferando-Form, und dagegen wird hier gebaut. Die Gerichte liegen
 * versetzt, in unterschiedlichen Grössen, wie auf einem Blech.
 */
export default function WasEsGibt() {
  const gerichte = slotsVon('gerichte')

  return (
    <Sektion id="gerichte" className="gerichte" aria-labelledby="gerichte-titel">
      {(f) => (
        <div className="schale">
          <header className="gerichte__kopf">
            <p className="augenbraue">Aus dem Steinofen</p>
            <h2 id="gerichte-titel">
              Fünf Dinge, für die
              <br />
              Leute wiederkommen.
            </h2>
            <p className="lead leise">
              Syrische Backkunst, jeden Tag frisch. Nichts liegt vor, nichts wartet.
            </p>
          </header>

          <div className="gerichte__blech">
            {gerichte.map((s, i) => (
              <figure key={s.id} className={`gerichte__platz gerichte__platz--${i + 1}`}>
                <Gericht slot={s} fortschritt={f} />
                <figcaption className="gerichte__name">
                  <span className="gerichte__nummer">{String(i + 1).padStart(2, '0')}</span>
                  {s.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </Sektion>
  )
}
