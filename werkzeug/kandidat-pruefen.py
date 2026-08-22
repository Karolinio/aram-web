"""Erzeugte Kandidaten gegen die fuenf Bedingungen aus ABLICHTUNG.md pruefen.

Ich verlange vom Inhaber fuenf Eigenschaften. Waere es redlich, sie bei
erzeugten Bildern nicht zu pruefen? Dieselben Zahlen, dasselbe Urteil.

  RANDKONTAKT    beruehrt das Motiv den Bildrand → nicht freistellbar
  DECKUNG        Anteil Motiv am Bild
  TEILE          eins ist ein Gegenstand, mehrere sind eine Ansammlung
  TRENNUNG       Helligkeitsabstand Grund zu Motiv → laesst es sich schneiden
  GRUNDRUHE      Streuung im Hintergrund → ist er wirklich glatt
  SCHAERFE       Varianz des Laplace-Operators auf dem Motiv
"""
import sys, glob
import numpy as np
from PIL import Image
from scipy import ndimage
from rembg import remove, new_session

sitzung = new_session('isnet-general-use')
print(f'{"Datei":16} {"Rand":>6} {"Deckung":>8} {"Teile":>6} {"Trennung":>9} {"Grundruhe":>10} {"Schärfe":>8}  Urteil')
for f in sorted(glob.glob('rohbilder/erzeugt/schiff-*.png')):
    bild = Image.open(f).convert('RGB')
    bild.thumbnail((1600, 1600))
    frei = remove(bild, session=sitzung)
    a = np.array(frei)[:, :, 3]
    fest = a > 40
    h, w = fest.shape
    rand = np.concatenate([fest[0], fest[-1], fest[:, 0], fest[:, -1]]).mean() * 100
    deck = fest.mean() * 100
    marken, n = ndimage.label(ndimage.binary_opening(fest, np.ones((9, 9))))
    gross = sum(1 for i in range(1, n + 1) if (marken == i).sum() > fest.sum() * 0.06)
    g = np.asarray(bild.convert('L'), dtype=float)
    trennung = abs(g[~fest].mean() - g[fest].mean())
    grundruhe = g[~fest].std()
    schaerfe = ndimage.laplace(g)[fest].var()
    ok = rand < 0.5 and 8 < deck < 60 and gross == 1 and trennung > 25 and grundruhe < 30
    frei.save(f.replace('.png', '-frei.png'))
    print(f'{f.split("/")[-1]:16} {rand:>5.2f}% {deck:>7.1f}% {gross:>6} {trennung:>9.0f} {grundruhe:>10.1f} {schaerfe:>8.0f}  {"BRAUCHBAR" if ok else "nein"}')
