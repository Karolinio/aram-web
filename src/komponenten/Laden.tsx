import { ARAM } from '../aram.config.ts'
import { ZEITEN } from '../oeffnung.ts'
import { useVersatz } from '../bewegung.ts'
import { Bild, Datenzeile, Kopf, Sektion } from './ui/bausteine.tsx'

const WOCHENTAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']

/**
 * Der Laden — drei Brüder, Adresse, Zeiten. Kurz.
 *
 * ═══ Warum hier Lücken stehen statt Text ═══
 *
 * Anschrift und Öffnungszeiten sind nicht bekannt: sie stehen nirgends auf der
 * alten Seite, und der Inhaber ist im Urlaub. Sie werden GEZEIGT als das, was
 * sie sind. Ein erfundener Wert wäre schlimmer als eine sichtbare Lücke — bei
 * Öffnungszeiten steht sonst jemand vor einer verschlossenen Tür, und bei einer
 * Anschrift schickt man ihn in die falsche Strasse.
 *
 * Das Foto ist echt und ihres: zwei der Brüder vor der Ladentür.
 *
 * Es war bis zum 16.08. das Teamfoto mit allen fünf Männern — bis dieses in den
 * Hero wanderte. Dasselbe Bild zweimal auf einer Seite ist kein Motiv, sondern
 * ein Fehler: es macht aus einem Beweis eine Wiederholung.
 */
export default function Laden() {
  const bild = useVersatz<HTMLDivElement>(-0.05)

  return (
    <Sektion id="laden" grund="hell" kante klasse="laden" beschriftetVon="laden-titel">
      <div className="schale laden__gitter">
        <div className="laden__bild" ref={bild}>
          <Bild
            quelle="/bilder/echt/brueder.webp"
            alt="Zwei der Brüder vor dem Laden, unter dem orangefarbenen Schild"
            breite={500}
            hoehe={600}
            unterschrift="Zwei der Brüder, vor der Tür"
          />
        </div>

        <div className="laden__wort">
          <Kopf
            id="laden-titel"
            etikett="Der Laden"
            titel="Ein kleiner Laden in Bonn-Hardtberg"
            lead="Geführt wird der Laden vom Inhaber und seinen Brüdern. Wer hereinkommt, sieht die Arbeitsfläche, das Blech mit den Teigscheiben und den Ofen — es gibt nichts, was hinter einer Tür passiert."
          />

          <dl className="daten">
            <Datenzeile was="Wo">
              {ARAM.ort.strasse ? (
                <>
                  {ARAM.ort.strasse}
                  <br />
                  {ARAM.ort.plz} {ARAM.ort.stadt}
                </>
              ) : (
                <>
                  <span className="luecke">Anschrift fehlt noch</span>
                  <br />
                  {ARAM.ort.stadt}
                </>
              )}
            </Datenzeile>

            <Datenzeile was="Telefon">
              <a href={ARAM.kontakt.telefonHref}>{ARAM.kontakt.telefon}</a>
            </Datenzeile>

            <Datenzeile was="Wann">
              {ZEITEN.length === 0 ? (
                <span className="luecke">Öffnungszeiten fehlen noch</span>
              ) : (
                <ul className="zeiten">
                  {ZEITEN.map((z, i) => (
                    <li key={`${z.tag}-${z.von}-${i}`}>
                      <span>{WOCHENTAGE[z.tag]}</span>
                      <span className="preis">
                        {z.von}–{z.bis}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Datenzeile>
          </dl>
        </div>
      </div>
    </Sektion>
  )
}
