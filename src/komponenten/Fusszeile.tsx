import { ARAM, lueckenVorLive } from '../aram.config.ts'
import { Etikett } from './ui/bausteine.tsx'
import { pfad } from '../pfad.ts'

/**
 * Der Fuss.
 *
 * ═══ Warum Impressum und Datenschutz hier als Lücke stehen ═══
 *
 * Rechtsform und ladungsfähige Anschrift fehlen. Solange sie fehlen, geht die
 * Seite nicht live — und ein Link auf ein Impressum, das es nicht gibt, ist
 * schlimmer als ein fehlender Link: er behauptet, die Pflicht sei erfüllt.
 *
 * Der Kasten mit den offenen Punkten erscheint NUR in der Entwicklung. Er ist
 * für Karol, nicht für Gäste — aber er muss existieren, damit niemand diese
 * Seite für fertig hält und mit ihr live geht.
 */
export default function Fusszeile() {
  const offen = lueckenVorLive()

  return (
    <footer className="fuss">
      <div className="schale fuss__gitter">
        <div className="fuss__marke">
          <img
            src="/bilder/echt/logo.webp"
            alt=""
            width={875}
            height={381}
            loading="lazy"
            className="fuss__logo"
          />
          <p className="leise">
            {ARAM.langname}
            <br />
            {ARAM.ort.stadt}
          </p>
        </div>

        <nav className="fuss__navi" aria-label="Rechtliches und Kontakt">
          <Etikett klasse="fuss__titel">Kontakt</Etikett>
          <ul>
            <li>
              <a href={ARAM.kontakt.telefonHref}>{ARAM.kontakt.telefon}</a>
            </li>
            <li>
              <a href={ARAM.kontakt.whatsapp} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </li>
            <li>
              {ARAM.kontakt.mail ? (
                <a href={`mailto:${ARAM.kontakt.mail}`}>{ARAM.kontakt.mail}</a>
              ) : (
                <span className="luecke">E-Mail fehlt noch</span>
              )}
            </li>
          </ul>
        </nav>

        <nav className="fuss__navi" aria-label="Rechtliches">
          <Etikett klasse="fuss__titel">Rechtliches</Etikett>
          <ul>
            {/* Verlinkt, nicht als Lücke. Die Seiten EXISTIEREN jetzt — und
                sie zeigen selbst, welche Angabe darauf noch fehlt. Das ist der
                richtige Ort dafür: eine Pflichtseite, die eine Lücke benennt,
                ist ehrlich; ein Fuss, der die Pflichtseite verschweigt, ist es
                nicht. Den Livegang blockiert weiterhin `lueckenVorLive()`. */}
            <li>
              <a href={pfad('impressum.html')}>Impressum</a>
            </li>
            <li>
              <a href={pfad('datenschutz.html')}>Datenschutz</a>
            </li>
          </ul>
        </nav>
      </div>

      {/* KI-Kennzeichnung nach EU AI Act Art. 50 Abs. 4 — Regel und Begründung
          in website-factory/engine/ki-kennzeichnung.md. Die erzeugten Gerichte,
          die Teigstufen und der Dampf sind keine Aufnahmen des Betriebs; das
          steht hier, damit niemand es dafür hält. */}
      <div className="schale">
        <p className="leise fuss__ki">
          Alle Gerichte, der Laden, das Team und der Ofen sind echte Fotos aus der
          Rochusstraße. Mit KI erzeugt sind nur der Dampf und die drei Teigstufen
          des fliegenden Käseschiffs; sie sind im Quelltext als solche gekennzeichnet.
        </p>
      </div>

      {/* ═══ Die unterste Leiste: © links, Urheber rechts (25.09.) ═══
          Karol baut die Seite ohne Honorar; die Gegenleistung ist diese eine
          Zeile. Form nach Mobbin, wo sie bei Agenturen durchweg gleich aussieht
          (Current „Designed and built by Logic + Rhythm", Structured „Website
          by Locomotive", Faculty „Design by Studio Faculty"): EINE Zeile in der
          untersten Leiste, so gross wie die Rechtslinks, gegenüber vom ©, über
          einer Haarlinie. Kein grosses Logo — das Signet ist so klein wie ein
          Favicon, damit die Seite Arams bleibt.

          NICHT ins Impressum: dort steht, wer die Seite BETREIBT, und das ist
          Arfan. `nofollow`, weil derselbe Fusslink auf vielen Kundenseiten für
          Google sonst nach Linktausch aussieht — der Wert ist der Klick. */}
      <div className="schale fuss__leiste">
        <p className="fuss__recht">
          © {new Date().getFullYear()} {ARAM.langname}
        </p>
        <a
          className="urheber"
          href="https://finesites.de"
          target="_blank"
          rel="nofollow noopener"
        >
          <span className="urheber__vor">Website von</span>
          <img
            className="urheber__signet"
            src={pfad('bilder/marke/finesites.svg')}
            alt=""
            width={18}
            height={18}
            loading="lazy"
            decoding="async"
          />
          <span className="urheber__name">finesites</span>
          <span className="visuell-versteckt"> (öffnet in neuem Tab)</span>
        </a>
      </div>

      {import.meta.env.DEV && offen.length > 0 && (
        <div className="schale">
          <div className="nichtlive">
            <p className="nichtlive__titel">Diese Seite darf noch nicht live gehen</p>
            <ul>
              {offen.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <p className="nichtlive__fuss leise">
              Dieser Kasten steht nur in der Entwicklung. Er verschwindet, sobald die Werte in
              <code> src/aram.config.ts </code> und <code> inhalt/zeiten.json </code> stehen.
            </p>
          </div>
        </div>
      )}
    </footer>
  )
}
