import { Kopf, Sektion } from "./ui/bausteine.tsx";

/**
 * Der Ofen — die einzige dunkle Sektion der Seite.
 *
 * ═══ Warum es sie überhaupt gibt ═══
 *
 * Karol am 23.08.: „Wir machen noch eine Ofenanimation in dieser 3D-GSAP-
 * Scroll-Driven. Wie aus dem Mehl durch dieses Walzen so ein Käseschiff wird,
 * dann fliegt das und landet dann unten im Ofen."
 *
 * Das Landen braucht einen Ort. Ohne eigene Sektion hätte der Ofen mitten in
 * der Galerie auftauchen müssen — ein gemauerter Bogen zwischen sieben
 * Produktfotos ist kein Höhepunkt, sondern ein Missverständnis.
 *
 * ═══ Warum sie dunkel ist, und warum das die einzige bleibt ═══
 *
 * Die ganze Seite läuft auf zwei Clay-Tönen. Ein schwarzer Block darin ist ein
 * Ereignis — solange es EINER ist. Zwei wären eine zweite Farbwelt, und dann
 * ist keine von beiden mehr besonders. Deshalb steht hier der Ofen und sonst
 * nichts Dunkles auf dieser Seite.
 *
 * ═══ Warum der Ofen ihr eigener ist ═══
 *
 * Die Teigstufen sind erzeugt — Mehl und Teig sind Material ohne erkennbaren
 * Ort, und Aufnahmen davon gibt es nicht. Der Ofen ist etwas anderes: er IST
 * ihr Laden. Er kommt deshalb aus Galeriefoto 09, beschnitten auf den Bogen.
 * Ihre Ziegel, ihre Flamme. Siehe werkzeug/ofenbild.py.
 *
 * ═══ Was diese Datei NICHT tut ═══
 *
 * Sie animiert nichts. Das Schiff liegt fest im Fenster und wird von
 * Kaeseschiff.tsx geführt; die Sektion hält nur den Ofen an seinem Platz und
 * liest die Glut aus einer Variablen, die dasselbe Bauteil setzt. Eine zweite
 * Zeitleiste für dasselbe Ereignis war schon einmal der Fehler.
 */
export default function Ofen() {
  return (
    <Sektion id="ofen" grund="nacht" klasse="ofen" beschriftetVon="ofen-titel">
      {/* ═══ Der Text steht AUSSERHALB der klebenden Bühne ═══

          Nicht Geschmack, sondern ein gemessener Fehler: die Überschrift trägt
          eine Parallaxe (`useVersatz` in Kopf), und die rechnet ihren Bereich
          aus der Dokumentposition. In einem klebenden Block ist die für die
          ganze Klebedauer dieselbe — der Versatz lief also sofort auf seinen
          Endwert von −36 px und blieb dort. Sichtbar war das als „Und dann",
          das auf „In die Glut" stand.

          Ausserhalb der Bühne scrollt die Überschrift normal davon, die
          Parallaxe stimmt, und der Ofen bleibt trotzdem stehen. */}
      <div className="schale ofen__wort">
        <Kopf
          id="ofen-titel"
          etikett="Und dann"
          titel="In die Glut"
          lead="Belegt wird erst bei der Bestellung, gebacken wird sofort danach. Deshalb dauert es ein paar Minuten, und deshalb kommt es heiss."
        />
      </div>

      <div className="ofen__buehne">
        {/* Das Maul liegt nicht mittig im Bild, sondern bei 32,3 % seiner
            Breite — gemessen, nicht geschätzt (werkzeug/ofenbild.py). Der
            Versatz im Stilblatt schiebt genau diesen Punkt in die Mitte des
            Fensters, damit das Schiff hineinfällt und nicht danebentrifft. */}
        <div className="ofen__maul" aria-hidden="true">
          <img
            src="/bilder/reise/ofen-maul.webp"
            width={900}
            height={600}
            alt=""
            loading="lazy"
            decoding="async"
          />
          {/* Die Glut. Sie hängt an `--ofen-glut`, und diese Variable setzt das
              Käseschiff in demselben Frame, in dem es eintaucht. */}
          <span className="ofen__glut" />
        </div>
      </div>
    </Sektion>
  );
}
