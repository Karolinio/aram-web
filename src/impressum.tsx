import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/reem-kufi'
import './stile/grundlage.css'
import './stile/bausteine.css'
import './stile/rechtsseiten.css'

import Impressum from './komponenten/Impressum.tsx'

createRoot(document.getElementById('wurzel')!).render(
  <StrictMode>
    <Impressum />
  </StrictMode>,
)
