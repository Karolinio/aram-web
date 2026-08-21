"""Alle Freisteller als EINE Seite, die Karol im Browser oeffnen kann.

Ich kann die Bilder in dieser Sitzung nicht ansehen — die Uebertragung lehnt
sie ab. Eine Seite im Browser umgeht das vollstaendig: sie zeigt sie IHM.

Jedes Stueck liegt auf einem Schachbrett, damit man Reste vom Hintergrund
sofort sieht. Darunter stehen die Zahlen, nach denen ich sie ausgewaehlt habe —
dann kann er meine Auswahl pruefen statt sie zu glauben.
"""
import glob, base64, io, json
from PIL import Image

stuecke=[]
for f in sorted(glob.glob('rohbilder/frei/stueck-*.png')) + sorted(glob.glob('rohbilder/frei/[0-9][0-9].png')):
    im=Image.open(f).convert('RGBA')
    w,h=im.size
    voll=im.copy(); voll.thumbnail((460,460), Image.LANCZOS)
    puf=io.BytesIO(); voll.save(puf,'WEBP',quality=82,method=4)
    d=base64.b64encode(puf.getvalue()).decode()
    name=f.split('/')[-1].replace('.png','')
    art='Stück' if name.startswith('stueck') else 'ganzes Bild'
    stuecke.append(dict(name=name, art=art, w=w, h=h, sv=round(w/h,2), kb=len(puf.getvalue())//1024, d=d))

karten=''.join(f'''
  <figure class="stueck">
    <div class="brett"><img src="data:image/webp;base64,{s["d"]}" alt="{s["name"]}" loading="lazy"></div>
    <figcaption>
      <b>{s["name"]}</b>
      <span>{s["art"]} · {s["w"]}×{s["h"]} · Seitenverhältnis {s["sv"]} · {s["kb"]} kB</span>
    </figcaption>
  </figure>''' for s in stuecke)

open('/private/tmp/claude-501/-Users-karolgenczyk/67ec3bbe-fdb3-4c1b-b862-8e3fe66f0de6/scratchpad/aram-freisteller.html','w').write(f'''<title>Aram Freisteller</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Reem+Kufi:wght@400..700&display=swap">
<style>
  :root {{
    --clay: #F5E5D3; --clay-tief: #E9CFB6; --tinte: #432610;
    --gedaempft: #694B39; --linie: #CFBAA4; --orange: #FE6201; --akzent: #973F13;
    --display: 'Fraunces', Georgia, serif; --text: 'Reem Kufi', system-ui, sans-serif;
  }}
  * {{ box-sizing: border-box; }}
  body {{ margin:0; background:var(--clay); color:var(--tinte);
         font-family:var(--text); font-size:1rem; line-height:1.55;
         -webkit-font-smoothing:antialiased; }}
  .rahmen {{ max-width:76rem; margin-inline:auto; padding:clamp(2rem,5vw,3.5rem) clamp(1.25rem,4vw,3rem); }}
  h1 {{ font-family:var(--display); font-variation-settings:'opsz' 96,'SOFT' 90,'WONK' 1;
        font-weight:800; font-size:clamp(2rem,1.2rem+3.4vw,3.2rem); line-height:1;
        letter-spacing:-0.015em; margin:0; }}
  .etikett {{ font-size:0.78rem; font-weight:600; letter-spacing:0.18em;
              text-transform:uppercase; color:var(--akzent); margin:0 0 0.9rem; }}
  p {{ max-width:36rem; margin:1.1rem 0 0; }}
  .leise {{ color:var(--gedaempft); }}
  .gitter {{ display:grid; gap:1.4rem; margin-top:2.5rem;
             grid-template-columns:repeat(auto-fill,minmax(15rem,1fr)); }}
  .stueck {{ margin:0; }}
  /* Schachbrett: JEDER Rest vom Hintergrund faellt darauf sofort auf — auf
     einer einfarbigen Flaeche sieht man einen grauen Saum nicht. */
  .brett {{
    aspect-ratio:1; display:grid; place-items:center; padding:0.7rem;
    border-radius:10px; border:1px solid var(--linie);
    background-color:#fff;
    background-image:
      linear-gradient(45deg,#e2e2e2 25%,transparent 25%,transparent 75%,#e2e2e2 75%),
      linear-gradient(45deg,#e2e2e2 25%,transparent 25%,transparent 75%,#e2e2e2 75%);
    background-size:18px 18px; background-position:0 0,9px 9px;
  }}
  .brett img {{ max-width:100%; max-height:100%; object-fit:contain; display:block; }}
  figcaption {{ margin-top:0.55rem; display:flex; flex-direction:column; gap:0.1rem; }}
  figcaption b {{ font-family:var(--display); font-variation-settings:'opsz' 36,'SOFT' 70,'WONK' 0;
                  font-size:1rem; font-weight:700; }}
  figcaption span {{ font-size:0.82rem; color:var(--gedaempft); font-variant-numeric:tabular-nums; }}
</style>
<div class="rahmen">
  <p class="etikett">{len(stuecke)} Freisteller, lokal erzeugt</p>
  <h1>Was sich aus euren Fotos herausschneiden lässt</h1>
  <p>Auf dem Schachbrett sieht man jeden Rest vom Hintergrund sofort — auf einer
     einfarbigen Fläche fällt ein grauer Saum nicht auf.</p>
  <p class="leise">„Stück“ heißt: einzeln aus einem Gruppenfoto herausgelöst.
     Ein Blech voller Gebäck ist als Ganzes unbrauchbar für eine Flugbahn — die
     einzelnen Stücke darin sind genau das, was gebraucht wird.</p>
  <div class="gitter">{karten}</div>
</div>''')
print(f'{len(stuecke)} Stücke ins Schaufenster gelegt')
