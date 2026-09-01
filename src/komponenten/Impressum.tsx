import { ARAM } from '../aram.config.ts'
import Rechtsseite, { Fehlt } from './Rechtsseite.tsx'

/**
 * Das Impressum nach § 5 DDG.
 *
 * ═══ Was hier NICHT passiert ═══
 *
 * Kein Wert wird geraten. Die Angaben stammen am 01.09.2026 aus IHRER eigenen
 * Erklärung auf sites.google.com/view/arampizzeria — Anbieter, Anschrift,
 * Telefon, E-Mail.
 *
 * Nicht übernommen ist die GmbH, die unter derselben Anschrift im Register
 * steht (Amtsgericht Bonn HRB 28626): sie wird dort mit einem Liquidator
 * geführt, letzte Eintragung 25.03.2024, und ihr eigenes Impressum nennt sie
 * nicht. Welche juristische Person den Laden heute betreibt, muss der Inhaber
 * sagen — siehe aram.config.ts.
 *
 * ═══ Der Vorbehalt, den ich Karol schulde ═══
 *
 * Ich bin kein Anwalt. Das hier ist ein sorgfältiger Entwurf entlang der
 * üblichen Pflichtangaben, kein Rechtsrat. Vor dem Livegang gehört er einmal
 * vor jemanden, der dafür haftet — besonders wenn die GmbH stimmt: dann
 * kommen Registergericht, Registernummer und Geschäftsführer dazu.
 */
export default function Impressum() {
  const r = ARAM.recht

  return (
    <Rechtsseite etikett="Pflichtangaben" titel="Impressum">
      <p className="lead">
        Angaben gemäss § 5 Digitale-Dienste-Gesetz.
      </p>

      <h2>Anbieter</h2>
      <p>
        {r.firma ?? <Fehlt was="Firma mit Rechtsform" />}
        <br />
        {r.anschrift ?? <Fehlt was="Ladungsfähige Anschrift" />}
      </p>

      <h2>Vertreten durch</h2>
      <p>{r.inhaber ?? <Fehlt was="Name des Inhabers oder Geschäftsführers" />}</p>

      <h2>Kontakt</h2>
      <p>
        Telefon: <a href={ARAM.kontakt.telefonHref}>{ARAM.kontakt.telefon}</a>
        <br />
        E-Mail: {ARAM.kontakt.mail ? (
          <a href={`mailto:${ARAM.kontakt.mail}`}>{ARAM.kontakt.mail}</a>
        ) : (
          <Fehlt was="E-Mail-Adresse" />
        )}
      </p>

      {/* Nur zeigen, wenn es eine gibt oder die Frage noch offen ist. Steht
          fest, dass keine existiert, ist die Überschrift selbst schon falsch:
          § 27a UStG verlangt die Nummer, WENN eine vergeben ist. */}
      {r.steuernummer !== 'keine' && (
        <>
          <h2>Umsatzsteuer-Identifikationsnummer</h2>
          <p>{r.steuernummer ?? <Fehlt was="USt-IdNr. nach § 27a UStG" />}</p>
        </>
      )}

      <h2>Verbraucherstreitbeilegung</h2>
      <p>
        {r.streitbeilegung === 'ja' ? (
          'Wir sind bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'
        ) : r.streitbeilegung === 'nein' ? (
          'Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'
        ) : (
          <Fehlt was="Aussage zur Teilnahme (§ 36 VSBG)" />
        )}
      </p>

      <h2>Verantwortlich für den Inhalt</h2>
      <p>
        {r.inhaber && r.anschrift ? (
          <>
            {r.inhaber}
            <br />
            {r.anschrift}
          </>
        ) : (
          <Fehlt was="Angabe" />
        )}
      </p>

      <p className="rechtsseite__fuss leise">
        Diese Seite verwendet keine Cookies, bindet keine fremden Inhalte ein und
        misst kein Verhalten. Was sie technisch tut, steht in der{' '}
        <a href="/datenschutz.html">Datenschutzerklärung</a>.
      </p>
    </Rechtsseite>
  )
}
