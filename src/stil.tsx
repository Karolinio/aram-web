import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/archivo'
import './stile/grundlage.css'
import './stile/bausteine.css'
import './stile/sektionen.css'
import './stile/stilbogen.css'

import Stilbogen from './komponenten/Stilbogen.tsx'

createRoot(document.getElementById('wurzel')!).render(
  <StrictMode>
    <Stilbogen />
  </StrictMode>,
)
