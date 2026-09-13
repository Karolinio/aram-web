import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/reem-kufi'
import './stile/grundlage.css'
import './stile/bausteine.css'
import './stile/rechtsseiten.css'

import Datenschutz from './komponenten/Datenschutz.tsx'

/* Der Koerper der Rechtsseiten ist dunkel — sonst blitzt beim Ueberscrollen
   und unter einer kurzen Seite das Orange der Startseite durch. */
document.body.classList.add('koerper--nacht')

createRoot(document.getElementById('wurzel')!).render(
  <StrictMode>
    <Datenschutz />
  </StrictMode>,
)
