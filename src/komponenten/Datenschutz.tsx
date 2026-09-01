import { ARAM } from '../aram.config.ts'
import Rechtsseite, { Fehlt } from './Rechtsseite.tsx'

/**
 * Die Datenschutzerklärung — aus dem Code abgeleitet, nicht abgeschrieben.
 *
 * ═══ Warum diese hier stimmen kann, während die meisten es nicht tun ═══
 *
 * Die übliche Erklärung auf einer kleinen Seite ist ein Textbaustein aus einem
 * Generator. Sie nennt Cookies, die es nicht gibt, Google Fonts, die nicht
 * geladen werden, und ein Analysewerkzeug, das nie eingebaut wurde — und sie
 * schweigt über das, was die Seite wirklich tut.
 *
 * Diese hier ist gegen den Code geprüft. Nachgesehen am 17.08.2026:
 *
 *   Cookies            keine. Gesucht nach `cookie`, nichts gefunden.
 *   localStorage       keiner.
 *   sessionStorage     EINER: die Bestellauswahl, siehe bestellung.ts. Sie
 *                      verlässt das Gerät nicht und ist beim Schliessen des
 *                      Tabs weg.
 *   fremde Server      KEINE beim Laden. Beide Schriften liegen auf dem
 *                      eigenen Server, es gibt keine Karte, kein Video, kein
 *                      Analysewerkzeug, kein Einwilligungsbanner.
 *   ausgehend          genau eine Adresse: wa.me — und erst, wenn jemand
 *                      darauf drückt.
 *
 * ═══ Was offen bleibt, und warum es offen bleiben MUSS ═══
 *
 * Der Hoster. Wer die Seite ausliefert, sieht bei jedem Aufruf die IP-Adresse
 * und ist damit Auftragsverarbeiter — er gehört mit Namen und Sitz in diese
 * Erklärung. Solange es keinen Server gibt, gibt es auch keinen Hoster, und
 * einen zu erfinden wäre schlimmer als die sichtbare Lücke.
 *
 * ═══ Der Vorbehalt ═══
 *
 * Ich bin kein Anwalt. Das ist ein sorgfältiger, gegen den Code geprüfter
 * Entwurf — kein Rechtsrat. Vor dem Livegang gehört er vor jemanden, der
 * dafür haftet.
 */
export default function Datenschutz() {
  const r = ARAM.recht

  return (
    <Rechtsseite etikett="Wie wir mit Daten umgehen" titel="Datenschutz">
      <p className="lead">
        Kurz vorweg: diese Seite setzt keine Cookies, lädt nichts von fremden
        Servern und misst nicht, was du hier tust. Deshalb gibt es auch kein
        Einwilligungsbanner. Es gäbe nichts einzuwilligen.
      </p>

      <h2>Verantwortlich</h2>
      <p>
        {r.firma ?? <Fehlt was="Firma" />}
        <br />
        {r.anschrift ?? <Fehlt was="Anschrift" />}
        <br />
        Telefon: <a href={ARAM.kontakt.telefonHref}>{ARAM.kontakt.telefon}</a>
      </p>

      <h2>Beim Aufruf der Seite</h2>
      <p>
        Wie bei jedem Aufruf einer Website überträgt dein Gerät technische
        Angaben an den Server, der sie ausliefert: IP-Adresse, Zeitpunkt,
        aufgerufene Datei, Browsertyp. Diese Angaben sind für die Auslieferung
        technisch notwendig; die Rechtsgrundlage ist Art. 6 Abs. 1 lit. f
        DSGVO, also unser berechtigtes Interesse daran, dass die Seite funktioniert
        und sicher bleibt.
      </p>
      <p>
        Ausgeliefert wird die Seite von{' '}
        {r.hoster ?? <Fehlt was="Name und Sitz des Hosters" />}. Wie lange dort
        Serverprotokolle aufbewahrt werden, richtet sich nach dessen
        Auftragsverarbeitungsvertrag.
      </p>

      <h2>Was diese Seite NICHT tut</h2>
      <ul>
        <li>Keine Cookies, auch keine „technisch notwendigen".</li>
        <li>Keine Reichweitenmessung, keine Statistik, kein Tracking.</li>
        <li>
          Keine Inhalte von fremden Servern. Beide Schriften liegen auf unserem
          eigenen Server; es gibt keine eingebettete Karte, kein Video und keine
          Schaltflächen sozialer Netzwerke.
        </li>
        <li>Kein Kontaktformular und damit keine Formulardaten.</li>
      </ul>

      <h2>Deine Auswahl in der Speisekarte</h2>
      <p>
        Wenn du Gerichte antippst, merkt sich der Browser deine Auswahl im{' '}
        <em>Sitzungsspeicher</em> deines Geräts, damit sie beim Weiterscrollen
        nicht verloren geht. Diese Angaben werden <strong>nicht</strong> an uns
        übertragen und sind gelöscht, sobald du den Tab schliesst. Sie verlassen
        dein Gerät nur, wenn du selbst auf „Per WhatsApp bestellen" drückst.
      </p>

      <h2>WhatsApp</h2>
      <p>
        Der Bestellknopf ist ein gewöhnlicher Link auf{' '}
        <code>wa.me</code>. Erst wenn du ihn drückst, baut dein Gerät eine
        Verbindung zu WhatsApp Ireland Ltd. auf und überträgt dabei deine
        IP-Adresse dorthin; anschliessend gelten deren Datenschutzbestimmungen.
        Ohne diesen Klick findet keine Verbindung statt.
      </p>
      <p>
        Wenn du uns schreibst, verarbeiten wir deine Nachricht und deine
        Telefonnummer, um die Bestellung zu bearbeiten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b
        DSGVO. Wir löschen den Verlauf, sobald er für die Abwicklung nicht mehr
        gebraucht wird und keine Aufbewahrungsfrist entgegensteht.
      </p>

      <h2>Anruf</h2>
      <p>
        Ein Druck auf die Telefonnummer öffnet nur die Telefon-App deines
        Geräts. Über die Website werden dabei keine Daten übertragen.
      </p>

      <h2>Deine Rechte</h2>
      <p>
        Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung
        der Verarbeitung, Datenübertragbarkeit und Widerspruch (Art. 15 bis 21
        DSGVO). Melde dich dafür unter den oben genannten Kontaktdaten.
        Ausserdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde
        beschweren; zuständig ist die Landesbeauftragte für Datenschutz und
        Informationsfreiheit Nordrhein-Westfalen.
      </p>

      <p className="rechtsseite__fuss leise">
        Stand: 17. August 2026. Diese Erklärung ist gegen den Quelltext dieser
        Seite geprüft. Sie beschreibt, was der Code tatsächlich tut, und nicht
        das, was ein Textbaustein üblicherweise behauptet.
      </p>
    </Rechtsseite>
  )
}
