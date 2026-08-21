"""Fremde Kopfzeilen AUSMESSEN, statt sie anzusehen.

Ich kann in dieser Sitzung keine Bilder betrachten. Eine Kopfzeile laesst sich
aber zahlenmaessig fassen — und die Zahlen sind ohnehin das, was man zum
Nachbauen braucht.

Die Unterkante wird als STUFE gesucht, nicht als staerkster Sprung: eine
Kopfzeile ist ein Streifen, dessen Zeilen sich UNTEREINANDER aehneln und die
sich vom Rest darunter als Block abheben. Der staerkste Einzelsprung ist
dagegen meist eine Schriftzeile.

Gesucht wird nur im plausiblen Bereich: eine Kopfzeile ist zwischen 5 und 14
Prozent der Bildhoehe hoch. Alles darunter ist eine Linie, alles darueber ein
Abschnitt.
"""
import glob
import numpy as np
from PIL import Image

def lum(a): return 0.2126*a[...,0] + 0.7152*a[...,1] + 0.0722*a[...,2]

print(f'{"Referenz":12} {"Bild":>11} {"Höhe":>7} {"Balken":>7} {"darunter":>9} {"Δ hell":>7} {"Streuung":>9}')
zeilen=[]
for f in sorted(glob.glob('/private/tmp/claude-501/-Users-karolgenczyk/67ec3bbe-fdb3-4c1b-b862-8e3fe66f0de6/scratchpad/mobbin/*.bin')):
    name=f.split('/')[-1].replace('.bin','')
    im=np.asarray(Image.open(f).convert('RGB'), dtype=float)
    h,w,_=im.shape
    l=lum(im)
    zeile=l.mean(axis=1)
    lo,hi = int(h*0.04), int(h*0.16)
    # Stufe: Mittelwert oberhalb gegen Mittelwert der naechsten 40 Zeilen
    bestes, kante = -1, lo
    for k in range(lo, hi):
        oben = zeile[2:k]; unten = zeile[k+1:k+1+40]
        if len(oben)<4 or len(unten)<10: continue
        # Ein guter Schnitt: grosser Unterschied der Mittelwerte UND kleine
        # Streuung oberhalb (ein Balken ist in sich gleichmaessig).
        wert = abs(oben.mean()-unten.mean()) / (1+oben.std())
        if wert>bestes: bestes, kante = wert, k
    balken=l[3:kante-1]; unten=l[kante+3:kante+3+60]
    if balken.size==0 or unten.size==0: continue
    d=balken.mean()-unten.mean()
    zeilen.append((name,h,kante,balken.mean(),unten.mean(),d,balken.std(),unten.std()))
    print(f'{name:12} {w}x{h:<7} {kante:>5}px {balken.mean():>7.0f} {unten.mean():>9.0f} {d:>+7.0f} '
          f'{balken.std():>5.0f}/{unten.std():<4.0f}')

print()
hel=[z[5] for z in zeilen]
dunkler=[z for z in zeilen if z[5] < -3]
heller =[z for z in zeilen if z[5] >  3]
print(f'DUNKLER als ihr Grund: {len(dunkler)} von {len(zeilen)}  ({", ".join(z[0] for z in dunkler)})')
print(f'HELLER  als ihr Grund: {len(heller)} von {len(zeilen)}  ({", ".join(z[0] for z in heller)})')
print(f'Median Helligkeits-Δ: {np.median(hel):+.0f}')
print()
# Kontrastdaempfung: um wieviel flacher ist der Balken als der Grund?
d=[z[6]/max(z[7],1e-6) for z in zeilen]
print(f'Streuung im Balken gegen Streuung darunter: Median {np.median(d):.2f}')
print('  (unter 1 = das Glas flacht ab, wie es soll; über 1 = der Balken ist')
print('   unruhiger als sein Grund und liest deshalb als eigene Fläche)')
