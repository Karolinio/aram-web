"""QR-Codes aus einem Foto lesen — und zwar aus einem SCHIEFEN, GESPIEGELTEN,
glaenzenden Foto vom Tresen.

Ein QR vom Handy ist selten sauber: er steht schraeg, hat einen Lichtreflex,
und der Druck ist rot auf weiss statt schwarz auf weiss. Der eingebaute
Detektor von OpenCV gibt bei sowas oft auf. Deshalb probiert dieses Werkzeug
mehrere Aufbereitungen durch, bis eine traegt:

  1  wie es ist
  2  in Graustufen, kontrastgespreizt (CLAHE) — holt den Code aus dem Reflex
  3  nur der Rotkanal — bei rot-auf-weiss gedruckten Codes der beste Kanal
  4  hart geschwellt (Otsu)
  5  jede der obigen zusaetzlich vergroessert

Aufruf:  python3 werkzeug/qrlesen.py <bild> [...]
"""
import sys, pathlib
import cv2
import numpy as np


def fassungen(bgr):
    """Mehrere Aufbereitungen desselben Bildes, von einfach nach hart."""
    grau = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8)).apply(grau)
    # Rot gedruckt auf Weiss: im Rotkanal ist der Code fast unsichtbar,
    # im GRUEN- und Blaukanal dagegen tiefschwarz. Genau deshalb hier gruen.
    gruen = bgr[:, :, 1]
    _, otsu = cv2.threshold(clahe, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    _, otsu_gruen = cv2.threshold(gruen, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    grund = [('roh', bgr), ('grau', grau), ('clahe', clahe),
             ('gruenkanal', gruen), ('otsu', otsu), ('otsu-gruen', otsu_gruen)]
    aus = list(grund)
    for name, bild in grund:
        for f in (2, 3):
            aus.append((f'{name} x{f}', cv2.resize(bild, None, fx=f, fy=f,
                                                   interpolation=cv2.INTER_CUBIC)))
    return aus


def lesen(pfad):
    bgr = cv2.imread(str(pfad))
    if bgr is None:
        return None, 'Datei nicht lesbar'
    det = cv2.QRCodeDetector()
    for name, bild in fassungen(bgr):
        if bild.ndim == 2:
            bild = cv2.cvtColor(bild, cv2.COLOR_GRAY2BGR)
        try:
            text, punkte, _ = det.detectAndDecode(bild)
        except cv2.error:
            continue
        if text:
            return text, name
        # Der Mehrfach-Detektor findet manchmal, woran der einfache scheitert
        try:
            ok, texte, *_ = det.detectAndDecodeMulti(bild)
        except cv2.error:
            continue
        if ok:
            for t in texte:
                if t:
                    return t, name + ' (multi)'
    return None, 'keine der 18 Fassungen hat getragen'


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit('Aufruf: python3 werkzeug/qrlesen.py <bild> [...]')
    for arg in sys.argv[1:]:
        # Absolute Pfade koennen nicht geglobbt werden — erst pruefen, ob es
        # eine schlichte Datei ist, und nur sonst als Muster behandeln.
        ziel = pathlib.Path(arg)
        treffer = [ziel] if ziel.is_file() else sorted(pathlib.Path().glob(arg))
        for p in treffer:
            text, wie = lesen(p)
            if text:
                print(f'{p.name}\n  ZIEL: {text}\n  gelesen aus: {wie}')
            else:
                print(f'{p.name}\n  nicht lesbar — {wie}')
