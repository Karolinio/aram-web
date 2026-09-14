import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/reem-kufi'
import './stile/grundlage.css'
import './stile/bausteine.css'
import './stile/rechtsseiten.css'

import Rechtsseite from './komponenten/Rechtsseite.tsx'
import { ARAM } from './aram.config.ts'
import { pfad } from './pfad.ts'

/**
 * Die Seite, die es nicht gibt.
 *
 * Bis zum 14.09. kam hier die graue Standardseite von GitHub — ein
 * Besucher mit einem alten Link (die Vorgaengerseite hatte andere
 * Adressen) stand vor einer fremden Wand. Dieselbe Huelle wie die
 * Rechtsseiten: Nachtgrund, ein Satz, zwei Wege zurueck.
 */
document.body.classList.add('koerper--nacht')

createRoot(document.getElementById('wurzel')!).render(
  <StrictMode>
    <Rechtsseite etikett="Nicht gefunden" titel="Diese Seite gibt es nicht">
      <p className="lead">
        Der Link ist alt oder vertippt. Was es gibt, steht auf der Startseite:
        die Karte, der Laden, die Zeiten.
      </p>
      <p>
        <a className="knopf" href={pfad('')}>Zur Startseite</a>
      </p>
      <p>
        Oder gleich anrufen: <a href={ARAM.kontakt.telefonHref}>{ARAM.kontakt.telefon}</a>
      </p>
    </Rechtsseite>
  </StrictMode>,
)
