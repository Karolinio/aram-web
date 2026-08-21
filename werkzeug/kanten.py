"""Welche Kante berührt das Motiv — und ist das schlimm?

„Randkontakt 8 %" ist noch kein Urteil. Ein Gebäck, das UNTEN aus dem Bild
laeuft, kann trotzdem fliegen: es taucht dann von unten auf, und niemand
vermisst, was nie zu sehen war. Ein Gebäck, das LINKS und RECHTS anstoesst, ist
dagegen wirklich beschnitten — dort fehlt Substanz, und jede Drehung zeigt es.

Deshalb wird hier je Kante gezaehlt, nicht insgesamt.
"""
import glob, json
import numpy as np
from PIL import Image

zeilen=[]
for f in sorted(glob.glob('rohbilder/frei/[0-9][0-9].png')):
    nr=int(f.split('/')[-1][:2])
    a=np.array(Image.open(f).split()[-1], dtype=np.uint8) > 40
    h,w=a.shape
    kanten={'oben':a[0].mean(),'unten':a[-1].mean(),'links':a[:,0].mean(),'rechts':a[:,-1].mean()}
    ys,xs=np.where(a)
    if len(xs)==0: continue
    # Wie gross ist das Motiv im Verhaeltnis zum Bild?
    fuell=len(xs)/(h*w)
    seiten = kanten['links']+kanten['rechts']
    urteil = ('FLIEGT' if seiten<0.02 and kanten['oben']<0.02
              else ('nur unten offen' if seiten<0.02 else 'seitlich beschnitten'))
    zeilen.append((nr,kanten,fuell,urteil))

print(f'{"Nr":>3}  {"oben":>6} {"unten":>6} {"links":>6} {"rechts":>6}  {"Fläche":>7}  Urteil')
for nr,k,fu,u in sorted(zeilen):
    print(f'{nr:>3}  {k["oben"]*100:>5.1f}% {k["unten"]*100:>5.1f}% {k["links"]*100:>5.1f}% {k["rechts"]*100:>5.1f}%  {fu*100:>6.1f}%  {u}')
