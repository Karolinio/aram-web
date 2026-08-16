import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Zwei Einstiege: die Seite und der Stilbogen.
 *
 * Der Stilbogen (`/stil.html`) rendert jeden Token und jedes Bauteil aus
 * DENSELBEN Dateien wie die Seite. Er ist nirgends verlinkt und trägt
 * `noindex` — er gehört zur Werkstatt, nicht zum Laden. Sein Zweck ist, die
 * Drift zwischen Direktion und Bau sichtbar zu machen, bevor der Kunde sie
 * sieht.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    cssTarget: 'safari16',
    rollupOptions: {
      /* Relative Pfade statt `resolve(__dirname, …)`: `__dirname` gibt es im
         ES-Modul nicht, und `node:path` zu typisieren hiesse @types/node nur
         für zwei Zeilen aufzunehmen. Vite löst relative Einstiege ohnehin
         gegen die Projektwurzel auf. */
      input: {
        seite: 'index.html',
        stil: 'stil.html',
      },
    },
  },
})
