"""Wie gross steht ein Produkt auf einer fremden Produktseite?

Das ist die eine Zahl, die man vor dem Bauen einer Reise braucht und nicht
raten sollte: wieviel Bildschirm bekommt der Gegenstand, und wo sitzt seine
Mitte. Zu klein liest als Illustration, zu gross als Tapete.

Gemessen wird ueber die SAETTIGUNG: ein freigestelltes oder freistehendes
Produkt ist fast immer der farbigste zusammenhaengende Fleck auf einer sonst
ruhigen Flaeche. Das findet man ohne Erkennung von Gegenstaenden.
"""
import glob
import numpy as np
from PIL import Image
from scipy import ndimage

print(f'{"Referenz":12} {"Fläche":>8} {"Breite":>8} {"Mitte x":>9} {"Mitte y":>9}')
werte=[]
for f in sorted(glob.glob('/private/tmp/claude-501/-Users-karolgenczyk/67ec3bbe-fdb3-4c1b-b862-8e3fe66f0de6/scratchpad/mobbin/r_*.bin')):
    name=f.split('/')[-1].replace('r_','').replace('.bin','')
    im=Image.open(f).convert('RGB'); w,h=im.size
    a=np.asarray(im,dtype=float)/255
    mx=a.max(axis=2); mn=a.min(axis=2)
    saett=np.where(mx>0, (mx-mn)/np.maximum(mx,1e-6), 0)
    maske=saett > max(0.28, float(np.quantile(saett,0.92)))
    maske=ndimage.binary_opening(maske, np.ones((5,5)))
    marken,n=ndimage.label(maske)
    if n==0: print(f'{name:12}  kein Fleck gefunden'); continue
    groessen=ndimage.sum(maske,marken,range(1,n+1))
    i=int(np.argmax(groessen))+1
    ys,xs=np.where(marken==i)
    flaeche=len(xs)/(w*h)
    breite=(xs.max()-xs.min()+1)/w
    print(f'{name:12} {flaeche*100:>7.1f}% {breite*100:>7.1f}% {100*(xs.mean()/w):>8.0f}% {100*(ys.mean()/h):>8.0f}%')
    werte.append((flaeche,breite,xs.mean()/w,ys.mean()/h))
if werte:
    import statistics as st
    print()
    print(f'Median Fläche des Gegenstands: {st.median(w[0] for w in werte)*100:.1f} % des Bildschirms')
    print(f'Median Breite:                 {st.median(w[1] for w in werte)*100:.1f} % der Bildschirmbreite')
    print(f'Median Mitte:                  x {st.median(w[2] for w in werte)*100:.0f} %, y {st.median(w[3] for w in werte)*100:.0f} %')
