import { ARAM, lueckenVorLive } from '../aram.config.ts'
import { Etikett } from './ui/bausteine.tsx'

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
            width={1220}
            height={540}
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
              <a href="/impressum.html">Impressum</a>
            </li>
            <li>
              <a href="/datenschutz.html">Datenschutz</a>
            </li>
          </ul>
        </nav>
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
