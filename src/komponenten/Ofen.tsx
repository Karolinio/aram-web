import Sektion from './ui/Sektion.tsx'
import Gericht from './ui/Gericht.tsx'
import { slot } from '../gerichte.ts'
import { ARAM } from '../aram.config.ts'

/**
 * Sektion 1 — Der Ofen.
 *
 * Der Hero. Hintergrund ist der Ofen mit Feuer (rechteckig, echtes Foto), darüber
 * schwebt ein Fatayer (freigestellt) und kommt beim Scrollen aus der Tiefe nach vorn.
 * Der Text liegt auf einer Ofentür-Glasfläche mit Glutkante unten.
 *
 * Warum der Name über dem Bild und nicht darin: der Laden heisst Aram, und ein
 * Ladenschild hängt vor dem Gebäude, nicht darauf.
 */
export default function Ofen() {
  const feuer = slot('ofen-feuer')!
  const fatayer = slot('fatayer-hero')!

  return (
    <Sektion id="start" className="ofen" aria-labelledby="ofen-titel">
      {(f) => (
        <>
          {/* Hintergrund: der Ofen. Steht still, wird nur dunkler wenn Inhalt kommt. */}
          <div className="ofen__grund" aria-hidden="true">
            <Gericht slot={feuer} fortschritt={1} className="ofen__feuer" />
            <div className="ofen__glut" />
          </div>

          <div className="schale ofen__buehne">
            <div className="ofen__satz">
              <h1 id="ofen-titel" className="ofen__marke">
                {ARAM.name}
              </h1>

              <div className="glas ofen__karte">
                <p className="augenbraue">Bonn-Hardtberg</p>
                <p className="lead ofen__zeile">{ARAM.einzeiler}</p>
                <p className="leise ofen__detail">
                  Jeder Teig wird morgens von Hand gerollt und erst bei deiner Bestellung
                  belegt. Du siehst zu, wie dein Fatayer entsteht.
                </p>
                <div className="ofen__knoepfe">
                  <a className="knopf hebt-mit" href={ARAM.kontakt.telefonHref}>
                    Anrufen · {ARAM.kontakt.telefon}
                  </a>
                  <a className="knopf knopf--leise" href="#karte">
                    Zur Karte
                  </a>
                </div>
              </div>
            </div>

            {/* Das Fatayer kommt aus dem Ofen heraus, auf den Betrachter zu. */}
            <div className="ofen__gericht">
              <Gericht slot={fatayer} fortschritt={f} />
            </div>
          </div>

          <div className="ofen__weiter" aria-hidden="true">
            <span />
          </div>
        </>
      )}
    </Sektion>
  )
}
