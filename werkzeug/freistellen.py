"""Freistellen und BEWERTEN — weil niemand hinsehen kann.

Ein Freisteller ist nur brauchbar, wenn drei Dinge stimmen, und alle drei
lassen sich zaehlen statt betrachten:

  RANDKONTAKT   Wieviel Prozent des Bildrands traegt noch Deckkraft. Ueber ~2 %
                heisst: das Motiv ist angeschnitten. Genau daran ist
                `fatayer-frei.webp` gescheitert — es heisst „frei" und ist ein
                Zuschnitt.
  DECKUNG       Anteil undurchsichtiger Flaeche. Unter 8 % hat das Modell das
                Motiv weggeschnitten, ueber 75 % hat es den Hintergrund behalten.
  TEILE         Zusammenhaengende Flaechen ueber 1 % Groesse. Eins ist ein
                Gegenstand, fuenf sind Konfetti.
"""
import sys, json, glob
from PIL import Image
import numpy as np
from rembg import remove, new_session

sitzung = new_session('isnet-general-use')

def bewerten(a):
    d = np.array(a.split()[-1], dtype=np.uint8)
    h, w = d.shape
    fest = d > 40
    rand = np.concatenate([fest[0], fest[-1], fest[:, 0], fest[:, -1]])
    # Zusammenhaengende Teile, grob ueber ein Raster gezaehlt
    k = 48
    raster = fest[:h//k*k, :w//k*k].reshape(h//k, k, w//k, k).mean(axis=(1,3)) > 0.35
    besucht = np.zeros_like(raster); teile = []
    for y in range(raster.shape[0]):
        for x in range(raster.shape[1]):
            if raster[y,x] and not besucht[y,x]:
                stapel=[(y,x)]; besucht[y,x]=True; n=0
                while stapel:
                    cy,cx=stapel.pop(); n+=1
                    for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
                        ny,nx=cy+dy,cx+dx
                        if 0<=ny<raster.shape[0] and 0<=nx<raster.shape[1] and raster[ny,nx] and not besucht[ny,nx]:
                            besucht[ny,nx]=True; stapel.append((ny,nx))
                teile.append(n)
    gross = [t for t in teile if t >= max(2, raster.size*0.01)]
    return dict(randkontakt=round(100*rand.mean(),1), deckung=round(100*fest.mean(),1), teile=len(gross))

inv = {z['nr']: z['datei'] for z in json.load(open('rohbilder/inventur.json'))}
ergebnis=[]
for nr in [int(x) for x in sys.argv[1:]]:
    q = 'rohbilder/eingang/' + inv[nr]
    bild = Image.open(q).convert('RGB')
    bild.thumbnail((1400, 1400))
    frei = remove(bild, session=sitzung)
    frei.save(f'rohbilder/frei/{nr:02d}.png')
    m = bewerten(frei); m['nr']=nr
    urteil = 'BRAUCHBAR' if m['randkontakt']<2.5 and 8<m['deckung']<75 and m['teile']<=2 else 'nein'
    m['urteil']=urteil
    ergebnis.append(m)
    print(f"  {nr:>2}  Rand {m['randkontakt']:>5} %   Deckung {m['deckung']:>5} %   Teile {m['teile']}   {urteil}")
json.dump(ergebnis, open('rohbilder/frei/bewertung.json','w'), indent=1)
