import galerieRoh from '../inhalt/galerie.json'

/**
 * Wie viele Bögen EIN Durchlauf der Arkade hat.
 *
 * Steht hier und nicht in Galerie.tsx, weil zwei Stellen ihn brauchen: die
 * Komponente, um die Liste zweimal auszugeben, und `ziehen.ts`, um den
 * Umlaufpunkt zu finden. Stünde die Zahl an beiden Stellen, liefen sie beim
 * nächsten Bild auseinander — und der Sprung des Bandes läge dann sichtbar
 * mitten in einem Bogen.
 */
export const BILDER_JE_SATZ = (galerieRoh as unknown[]).length
