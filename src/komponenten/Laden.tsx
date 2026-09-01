import { ARAM } from '../aram.config.ts'
import { tagName, wochenbloecke, ZEITEN } from '../oeffnung.ts'
import { useAuftauchen, useVersatz } from '../bewegung.ts'
import { Datenzeile, Etikett, Kopf, Sektion } from './ui/bausteine.tsx'
import Untergrund from './ui/Untergrund.tsx'

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
 * ═══ Die Ladenfront ist am 30.08. gekommen ═══
 *
 * Hier stand über Wochen, dass genau ein Bild fehlt: die Ladenfront von der
 * Strasse, bei Tageslicht, quer — das eine Bild, das ein Ortsfremder braucht,
 * um den Laden wiederzuerkennen, wenn er davorsteht.
 *
 * Der Inhaber hat sie geschickt. Sie steht jetzt an ERSTER Stelle, denn genau
 * das ist ihre Aufgabe: zuerst zeigen, wo man hin muss, dann wer dort steht.
 */
const LADENBILDER = [
  {
    quelle: '/bilder/echt/ladenfront.webp',
    alt: 'Die Ladenfront von der Strasse: orangene Markise, davor Tische, zwei Bäcker vor der Tür',
    unterschrift: 'So sieht es aus, wenn du davorstehst',
    breite: 1400,
    hoehe: 934,
    tempo: -0.04,
    dreh: -1.4,
  },
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
    tempo: 0.03,
    dreh: 2.2,
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
  const wort = useAuftauchen<HTMLDivElement>(0.9)

  return (
    <Sektion id="laden" grund="nacht" klasse="laden" beschriftetVon="laden-titel">
      <Untergrund ton="nacht" />

      <div className="schale laden__gitter">
        <div className="laden__stapel">
          {LADENBILDER.map((b, i) => (
            <Ladenbild key={b.quelle} b={b} i={i} />
          ))}
        </div>

        <div className="laden__wort" ref={wort}>
          <Kopf
            id="laden-titel"
            etikett="Der Laden"
            /* ═══ „Ein kleiner Laden in Bonn-Hardtberg" ist raus ═══

               Karol am 27.08.: „Das stimmt halt nicht … die Texte sollte er
               mir eh sagen. Das macht keinen Sinn, Texte zu schreiben, die
               nicht von ihm kommen."

               Er hat in beidem recht, und der zweite Punkt wiegt schwerer.
               „Klein" war eine Zuschreibung, die niemand geprüft hat. Auch der
               Vorspann war erfunden: „geführt vom Inhaber und seinen Brüdern"
               stammt aus einem Foto, „es gibt nichts, was hinter einer Tür
               passiert" aus meiner Feder. Beides klingt gut und ist unbelegt.

               Zum Stadtteil, damit die Zahl nicht zweimal geändert wird:
               Hardtberg ist der STADTBEZIRK und für die Rochusstraße 246 in
               53123 richtig; der Ortsteil darin heisst Lessenich/Meßdorf.
               Welche der beiden Bezeichnungen der Inhaber führen will, sagt
               er — es steht auf seiner Liste.

               Stehen bleibt nur, was auf ihrer eigenen Ladentür steht
               (Foto 11 in rohbilder/eingang): mehr als 25 Jahre. */
            titel="Mehr als 25 Jahre"
            lead={
              <>
                <span className="luecke">Diesen Absatz schreibt der Inhaber selbst</span> — was
                seinen Laden ausmacht, weiss er besser als wir.
              </>
            }
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

            {/* ═══ Telefon und E-Mail sind EIN Block ═══

                Vorher standen „Geöffnet", „Wo", „Telefon" und „E-Mail"
                untereinander in einer schmalen Spalte — viermal dasselbe
                Etikett mit Strich, viermal derselbe Aufbau. Karol: „sieht
                amateurhaft aus." Das ist der Grund: nicht die Farbe, sondern
                die Wiederholung. Vier gleiche Bausteine in einer Reihe lesen
                sich als Formular, nicht als Auskunft.

                Jetzt drei statt vier, und die beiden unteren stehen
                NEBENEINANDER. Telefon und E-Mail gehören ohnehin zusammen: es
                ist eine Frage („wie erreiche ich euch"), nicht zwei.

                Mobil zuerst — das ist die Nummer auf ihrem Flyer, und sie
                nimmt WhatsApp. */}
            <Datenzeile was="Erreichbar">
              <a href={ARAM.kontakt.telefonHref}>{ARAM.kontakt.telefon}</a>
              {ARAM.kontakt.festnetz && (
                <>
                  <br />
                  <a href={ARAM.kontakt.festnetzHref}>{ARAM.kontakt.festnetz}</a>
                </>
              )}
              <br />
              <a href={`mailto:${ARAM.kontakt.mail}`}>{ARAM.kontakt.mail}</a>
            </Datenzeile>
          </dl>
        </div>
      </div>
    </Sektion>
  )
}
