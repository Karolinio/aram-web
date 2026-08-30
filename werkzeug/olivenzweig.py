"""Den Olivenzweig aus IHREM Emblem als saubere Kurve nachzeichnen.

Auf dem Aufkleber am Tresen sitzt unten rechts ein zweites, viel ruhigeres
Zeichen als das rote Pizza-Logo: ein Ring mit „ARAM", einer Sonne, und zwei
Zweigen — links ein dunkler Olivenzweig, rechts ein heller. Der Inhaber
wuenscht sich den dunklen in der Speisekarte.

Aus dem Foto ist er nicht zu holen: er ist dort etwa 140 px gross, hinter
einer Plastikhuelle mit Reflex. Also wird er GERECHNET statt gepaust — dann
ist er beliebig gross, in jeder Farbe, und kostet 2 kB statt eines Bildes.

Wie er entsteht:

  Der Stiel ist eine kubische Bezierkurve. An gleichmaessigen Stellen darauf
  wird die TANGENTE bestimmt; jedes Blatt sitzt senkrecht dazu, abwechselnd
  links und rechts, und wird zur Spitze hin kleiner. Das ist die Bauweise
  eines echten Zweigs — Blaetter stehen nicht in einem festen Winkel zum
  Bildrand, sondern zum Stiel.

  Ein Blatt ist eine Mandel aus zwei quadratischen Boegen. Dieselbe Form wie
  das Fatayer und wie die Kufi-Schrift — siehe Entwurf 4 im Markenblatt.

Aufruf:  python3 werkzeug/olivenzweig.py > public/bilder/marke/olivenzweig.svg
"""
import math

# Der Stiel: von unten links nach oben rechts, mit einer Gegenkruemmung.
P0, P1, P2, P3 = (18, 186), (52, 120), (128, 96), (196, 26)

BLAETTER = 11          # Anzahl Blattpaare-Positionen entlang des Stiels
FRUECHTE = (0.32, 0.58, 0.79)   # wo Oliven sitzen, als Anteil des Stiels


def punkt(t):
    u = 1 - t
    return (u**3*P0[0] + 3*u*u*t*P1[0] + 3*u*t*t*P2[0] + t**3*P3[0],
            u**3*P0[1] + 3*u*u*t*P1[1] + 3*u*t*t*P2[1] + t**3*P3[1])


def tangente(t):
    u = 1 - t
    dx = 3*u*u*(P1[0]-P0[0]) + 6*u*t*(P2[0]-P1[0]) + 3*t*t*(P3[0]-P2[0])
    dy = 3*u*u*(P1[1]-P0[1]) + 6*u*t*(P2[1]-P1[1]) + 3*t*t*(P3[1]-P2[1])
    n = math.hypot(dx, dy) or 1
    return dx/n, dy/n


def blatt(x, y, winkel, laenge, breite):
    """Eine Mandel: zwei quadratische Boegen, Spitze an beiden Enden."""
    c, s = math.cos(winkel), math.sin(winkel)
    def dreh(px, py):
        return (x + px*c - py*s, y + px*s + py*c)
    a  = dreh(0, 0)
    b  = dreh(laenge, 0)
    k1 = dreh(laenge/2,  breite)
    k2 = dreh(laenge/2, -breite)
    return (f'M{a[0]:.1f} {a[1]:.1f}'
            f'Q{k1[0]:.1f} {k1[1]:.1f} {b[0]:.1f} {b[1]:.1f}'
            f'Q{k2[0]:.1f} {k2[1]:.1f} {a[0]:.1f} {a[1]:.1f}Z')


teile = [f'<path d="M{P0[0]} {P0[1]}C{P1[0]} {P1[1]} {P2[0]} {P2[1]} {P3[0]} {P3[1]}" '
         f'fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>']

for i in range(BLAETTER):
    t = 0.06 + 0.9 * i / (BLAETTER - 1)
    x, y = punkt(t)
    dx, dy = tangente(t)
    grund = math.atan2(dy, dx)
    seite = 1 if i % 2 == 0 else -1
    # Blaetter stehen schraeg nach vorn, nicht quer — sonst liest es als Farn.
    winkel = grund + seite * math.radians(52)
    schrumpf = 1 - 0.42 * t                    # zur Spitze hin kleiner
    teile.append(f'<path d="{blatt(x, y, winkel, 46*schrumpf, 12*schrumpf)}" fill="currentColor"/>')

for t in FRUECHTE:
    x, y = punkt(t)
    dx, dy = tangente(t)
    ox, oy = x - dy*13, y + dx*13          # Olive sitzt seitlich am Stiel
    teile.append(f'<ellipse cx="{ox:.1f}" cy="{oy:.1f}" rx="8.5" ry="10.5" '
                 f'fill="currentColor" opacity="0.85"/>')

print('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 210" '
      'fill="none" aria-hidden="true">')
print('\n'.join('  ' + t for t in teile))
print('</svg>')
