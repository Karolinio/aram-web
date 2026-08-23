import { ARAM } from '../aram.config.ts'
import { tagName, wochenbloecke, ZEITEN } from '../oeffnung.ts'
import { useVersatz } from '../bewegung.ts'
import { Datenzeile, Etikett, Kopf, Sektion } from './ui/bausteine.tsx'

/**
 * Der Laden — Adresse, Zeiten, drei Brüder.
 *
 * ═══ Was sich am 23.08. geändert hat ═══
 *
 * Karol: „bei der Laden auch nochmal eine coole Animation und noch mehr
 * Identität reinbringen … bereite auch die Sektion vor."
 *
 * Zwei Dinge, und keins davon ist Schmuck:
 *
 * DIE ZEITEN SAGEN JETZT, WAS SIE BEDEUTEN. Vorher standen dort sechs Zeilen,
 * in denen fünfmal dasselbe stand wie in der ersten. Dass bei Aram JEDEN Tag
 * ausser Montag dasselbe gilt, ist die eigentliche Auskunft — und sie ging in
 * der Aufzählung unter. Zusammengefasst wird gerechnet, nicht getippt (siehe
 * `wochenbloecke` in oeffnung.ts): ändert der Inhaber im Editor eine Zeit,
 * ändert sich der Satz mit.
 *
 * DER STAPEL. Statt eines einzelnen Fotos liegen die Aufnahmen übereinander wie
 * auf einem Tisch, jede ein Stück versetzt und leicht gedreht, jede mit eigenem
 * Tempo beim Scrollen. Daraus entsteht Bewegung, ohne dass sich etwas dreht
 * oder skaliert — derselbe Griff wie in der Galerie, nur enger.
 *
 * ═══ Warum nur zwei Fotos und nicht vier ═══
 *
 * Weil es zwei gibt. `LADENBILDER` hat einen dritten Platz mit einem Kommentar
 * darüber, was dorthin gehört; er bleibt leer, bis das Foto da ist. Ein
 * Platzhalter, der aussieht wie ein Bild, ist ein Versprechen.
 */

/**
 * Die Aufnahmen des Ladens.
 *
 * ═══ Was hier NICHT hineingehört ═══
 *
 * Keine Galeriefotos. Sie stehen dreissig Zeilen weiter oben schon, und dasselbe
 * Bild zweimal auf einer Seite macht aus einem Beweis eine Wiederholung.
 *
 * ═══ Was noch fehlt ═══
 *
 * Eine Aufnahme der Ladenfront von der Strasse, bei Tageslicht, quer. Sie ist
 * das eine Bild, das ein Ortsfremder braucht, um den Laden wiederzuerkennen,
 * wenn er davorsteht — und genau das gibt es von Aram noch nicht. Sobald sie da
 * ist: eine Zeile hier, sonst nichts.
 */
const LADENBILDER = [
  {
    quelle: '/bilder/echt/team-laden.webp',
    alt: 'Fünf Männer vor der Ladenfront, einer hält ein Blech mit Fladen',
    unterschrift: 'Vor der Tür, an einem Werktag',
    /* Gemessen, nicht geschätzt: 1024 × 784. Ich hatte 900 × 675 hingeschrieben
       — 2 % daneben, und der Fabrikprüfer hat es gemeldet. Falsche Masse
       reservieren die falsche Höhe, und das ist genau die Art Sprung, die
       diese Seite seit dem 17.08. bei 0,005 hält. */
    breite: 1024,
    hoehe: 784,
    /* Negativ = bleibt gegen den Scroll zurück, positiv = eilt vor. Der
       Unterschied zwischen den beiden Werten IST der Effekt; gleiche Werte
       ergeben zwei Bilder, die sich gemeinsam verschieben, also gar nichts. */
    tempo: -0.06,
    dreh: -2.4,
  },
  {
    quelle: '/bilder/echt/brueder.webp',
    alt: 'Zwei der Brüder vor dem Laden, unter dem orangefarbenen Schild',
    unterschrift: 'Zwei der Brüder',
    breite: 500,
    hoehe: 600,
    tempo: 0.05,
    dreh: 3.1,
  },
] as const

function Ladenbild({ b, i }: { b: (typeof LADENBILDER)[number]; i: number }) {
  const ref = useVersatz<HTMLDivElement>(b.tempo)
  return (
    <figure
      className={`ladenbild ladenbild--${i + 1}`}
      ref={ref}
      style={{ '--dreh': `${b.dreh}deg` } as React.CSSProperties}
    >
      <img
        src={b.quelle}
        alt={b.alt}
        width={b.breite}
        height={b.hoehe}
        loading="lazy"
        decoding="async"
      />
      <figcaption>{b.unterschrift}</figcaption>
    </figure>
  )
}

/**
 * Die Öffnungszeiten als Satz — und nur als Tabelle, wenn es einer sein muss.
 *
 * Ein Block heisst: an allen offenen Tagen gilt dasselbe. Dann steht dort ein
 * Satz. Mehrere Blöcke heissen: es gilt nicht dasselbe — dann ist die
 * Aufzählung die richtige Form, und sie kommt zurück.
 */
function Zeiten() {
  const { offen, zu } = wochenbloecke()

  if (ZEITEN.length === 0 || offen.length === 0) {
    return <span className="luecke">Öffnungszeiten fehlen noch</span>
  }

  return (
    <div className="zeitblock">
      {offen.map((b) => (
        <p className="zeitblock__lauf" key={`${b.vonTag}-${b.von}`}>
          <span className="zeitblock__tage">
            {b.vonTag === b.bisTag
              ? tagName(b.vonTag)
              : `${tagName(b.vonTag)} bis ${tagName(b.bisTag)}`}
          </span>
          <span className="zeitblock__uhr">
            {b.von} – {b.bis}
          </span>
        </p>
      ))}

      {zu.length > 0 && (
        <p className="zeitblock__ruhe">
          {/* „Ruhetag" und nicht „geschlossen": das eine ist eine Entscheidung
              des Betriebs, das andere klingt nach einer verschlossenen Tür.
              Auf ihrem eigenen Flyer steht „MONTAG IST RUHETAG". */}
          {zu.map((t) => tagName(t)).join(' und ')} ist Ruhetag
        </p>
      )}
    </div>
  )
}

export default function Laden() {
  return (
    <Sektion id="laden" grund="tief" kante klasse="laden" beschriftetVon="laden-titel">
      <div className="schale laden__gitter">
        <div className="laden__stapel">
          {LADENBILDER.map((b, i) => (
            <Ladenbild key={b.quelle} b={b} i={i} />
          ))}
        </div>

        <div className="laden__wort">
          <Kopf
            id="laden-titel"
            etikett="Der Laden"
            titel="Ein kleiner Laden in Bonn-Hardtberg"
            lead="Geführt wird der Laden vom Inhaber und seinen Brüdern. Wer hereinkommt, sieht die Arbeitsfläche, das Blech mit den Teigscheiben und den Ofen — es gibt nichts, was hinter einer Tür passiert."
          />

          {/* Die Zeiten stehen VOR der Adresse und ausserhalb der Datenliste.
              Sie sind die häufigste Frage an einen Imbiss, und eine Auskunft,
              die man erst in einer Aufzählung suchen muss, ist eine Auskunft
              zweiter Klasse. */}
          <div className="laden__zeiten">
            <Etikett>Geöffnet</Etikett>
            <Zeiten />
          </div>

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
          </dl>
        </div>
      </div>
    </Sektion>
  )
}
