"""Die Besetzung der Reise zur Wahl stellen.

Ich kann die Freisteller nicht ansehen — die Bilduebertragung dieser Sitzung
lehnt jedes Bild ab. Auswaehlen kann ich nach Form und Fuellgrad, aber ob ein
langgestreckter Freisteller ein KAESESCHIFF ist oder eine Teigrolle, sieht nur
jemand, der hinschaut.

Diese Seite zeigt genau die Kandidaten, die formal in Frage kommen, jeweils
GENAU SO GROSS, wie sie in der Reise fliegen wuerden. Ein Freisteller auf einer
Kontaktbogen-Kachel sagt nichts darueber, wie er als Hauptfigur wirkt.
"""
import glob, base64, io, os
import numpy as np
from PIL import Image

def masse(f):
    im = Image.open(f).convert('RGBA')
    a = np.array(im)[:, :, 3] > 48
    if a.sum() == 0: return None
    ys, xs = np.where(a)
    w = xs.max()-xs.min()+1; h = ys.max()-ys.min()+1
    return im, w/h, a.sum()/(w*h)

gruppen = {'Käseschiff — langgestreckt': [], 'Manakisch — rund': [], 'Fata’er — dazwischen': []}
for f in sorted(glob.glob('rohbilder/frei/*.png')):
    r = masse(f)
    if not r: continue
    im, sv, fuelle = r
    if fuelle < 0.45: continue          # zu locker: meist Schatten oder Krümel
    if sv >= 1.95:   g = 'Käseschiff — langgestreckt'
    elif 0.85 <= sv <= 1.3: g = 'Manakisch — rund'
    elif 1.3 < sv < 1.95:  g = 'Fata’er — dazwischen'
    else: continue
    gruppen[g].append((f, im, sv, fuelle))

def karte(f, im, sv, fuelle, breite_rem):
    k = im.copy(); k.thumbnail((520, 520), Image.LANCZOS)
    p = io.BytesIO(); k.save(p, 'WEBP', quality=84, method=4)
    d = base64.b64encode(p.getvalue()).decode()
    name = f.split('/')[-1].replace('.png','')
    return f'''
  <figure class="k">
    <div class="brett" style="--b:{breite_rem}rem">
      <img src="data:image/webp;base64,{d}" alt="{name}" loading="lazy">
    </div>
    <figcaption><b>{name}</b><span>Seitenverhältnis {sv:.2f} · Füllgrad {fuelle:.2f}</span></figcaption>
  </figure>'''

breiten = {'Käseschiff — langgestreckt': 21, 'Manakisch — rund': 16, 'Fata’er — dazwischen': 18}
abschnitte = ''
for g, liste in gruppen.items():
    if not liste: continue
    karten = ''.join(karte(*e, breiten[g]) for e in sorted(liste, key=lambda e: -e[3]))
    abschnitte += f'<section><h2>{g}</h2><div class="gitter">{karten}</div></section>'

ziel = '/private/tmp/claude-501/-Users-karolgenczyk/67ec3bbe-fdb3-4c1b-b862-8e3fe66f0de6/scratchpad/aram-besetzung.html'
open(ziel,'w').write(f'''<title>Besetzung der Reise</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Reem+Kufi:wght@400..700&display=swap">
<style>
  :root {{ --glut:#964300; --creme:#FBF4EA; --gold:#FFDB7A; --clay:#F5E5D3; --tinte:#432610;
           --display:'Fraunces',Georgia,serif; --text:'Reem Kufi',system-ui,sans-serif; }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; background:var(--glut); color:var(--creme); font-family:var(--text);
          line-height:1.55; -webkit-font-smoothing:antialiased; }}
  .rahmen {{ max-width:78rem; margin-inline:auto; padding:clamp(2rem,5vw,3.5rem) clamp(1.25rem,4vw,3rem); }}
  h1 {{ font-family:var(--display); font-variation-settings:'opsz' 96,'SOFT' 90,'WONK' 1;
        font-weight:800; font-size:clamp(2rem,1.2rem+3.4vw,3.2rem); line-height:1;
        letter-spacing:-0.015em; margin:0; }}
  h2 {{ font-family:var(--display); font-variation-settings:'opsz' 48,'SOFT' 85,'WONK' 1;
        font-weight:700; font-size:1.5rem; margin:2.8rem 0 0.3rem; color:var(--gold); }}
  .etikett {{ font-size:0.78rem; font-weight:600; letter-spacing:0.18em; text-transform:uppercase;
              color:var(--gold); margin:0 0 0.9rem; }}
  p {{ max-width:38rem; margin:1.1rem 0 0; color:rgba(251,244,234,0.86); }}
  .gitter {{ display:flex; flex-wrap:wrap; gap:2rem 2.4rem; align-items:flex-end; margin-top:1.6rem; }}
  .k {{ margin:0; }}
  /* Der Gegenstand steht in der GRÖSSE, in der er fliegen würde — auf dem
     Grund, auf dem er fliegen würde. Ein Freisteller auf Weiss sagt nichts
     darüber, wie er auf gebranntem Orange wirkt. */
  .brett {{ width:var(--b); display:grid; place-items:center; }}
  .brett img {{ width:100%; height:auto; display:block;
                filter: drop-shadow(0 14px 22px rgba(40,14,0,.5)) drop-shadow(0 3px 6px rgba(40,14,0,.35)); }}
  figcaption {{ margin-top:0.7rem; display:grid; gap:0.1rem; }}
  figcaption b {{ font-family:var(--display); font-variation-settings:'opsz' 36,'SOFT' 70,'WONK' 0;
                  font-size:0.95rem; }}
  figcaption span {{ font-size:0.8rem; color:rgba(251,244,234,0.6); font-variant-numeric:tabular-nums; }}
</style>
<div class="rahmen">
  <p class="etikett">Wer fliegt in der Reise</p>
  <h1>Such die Besetzung aus</h1>
  <p>Jeder Gegenstand steht hier in der Grösse, in der er in der Reise fliegen
     würde, und auf dem Grund, auf dem er fliegen würde. Ein Freisteller auf
     einer weissen Kachel sagt nichts darüber, wie er als Hauptfigur wirkt.</p>
  <p>Ich brauche drei Namen: einen fürs <b>Käseschiff</b> (das aufbricht), einen
     fürs <b>Manakisch</b> (das sich aus der Kante dreht) und einen dritten
     dazwischen. Sortiert ist nach Füllgrad — je höher, desto sauberer der
     Freisteller.</p>
  {abschnitte}
</div>''')
print(f'{sum(len(v) for v in gruppen.values())} Kandidaten, {os.path.getsize(ziel)//1024} kB')
for g,v in gruppen.items(): print(f'  {g}: {len(v)}')
