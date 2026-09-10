"""
Aram-Licht — die Gradation, die aus einem freigestellten Handyfoto ein
Produktbild macht, OHNE das Produkt zu veraendern.

Warum im Code und nicht im Modell: der erste Versuch lief ueber Higgsfield
mit einem Schoenheits-Auftrag ("relight, deepen the browns, wie ein guter
Foodfotograf"). Gemessen kam ein anderes Gericht zurueck — Farbabstand 44,8,
mit Kaeseflecken und Kraeutern, die es auf seinem Lahmacun nicht gibt. Das
Modell kann freistellen und erfinden; "verbessern ohne zu veraendern" kann es
nicht zuverlaessig. Eine Gradation dagegen ist eine Funktion: sie hat eine
Obergrenze, und die kann man nachmessen.

Drei Griffe, alle mild:
  WAERME    +4 % Rot in den Lichtern, -3 % Blau in den Tiefen. Ihre Backstube
            ist ein Holzofen; Handykameras ziehen bei Kunstlicht ins Kuehle.
  KURVE     eine sanfte S-Kurve. Holt Zeichnung in die Kruste zurueck, die
            beim Freistellen flach wird.
  SAETTIGUNG +12 %. Nicht mehr: darueber kippt Hackfleisch ins Orange.
"""
import numpy as np
from PIL import Image

WAERME_LICHT, WAERME_TIEFE, SAETTIGUNG, KURVE = 0.04, 0.03, 0.12, 0.14

def graduiere(im: Image.Image) -> Image.Image:
    a = np.array(im.convert('RGBA')).astype(np.float32)
    rgb, alpha = a[..., :3] / 255.0, a[..., 3:4]
    hell = rgb.mean(-1, keepdims=True)

    # S-Kurve um die Mitte: x + k*(x-0.5)*(1-|2x-1|)
    rgb = np.clip(rgb + KURVE * (rgb - 0.5) * (1 - np.abs(2 * rgb - 1)), 0, 1)

    rgb[..., 0] += WAERME_LICHT * hell[..., 0]              # Rot in den Lichtern
    rgb[..., 2] -= WAERME_TIEFE * (1 - hell[..., 0])        # Blau aus den Tiefen
    rgb = np.clip(rgb, 0, 1)

    grau = rgb.mean(-1, keepdims=True)
    rgb = np.clip(grau + (rgb - grau) * (1 + SAETTIGUNG), 0, 1)

    return Image.fromarray(np.concatenate([rgb * 255, alpha], -1).astype(np.uint8), 'RGBA')

def abstand(vorher: Image.Image, nachher: Image.Image) -> float:
    """Mittlerer Farbabstand ueber die deckenden Bildpunkte — die Obergrenze."""
    a, b = np.array(vorher.convert('RGBA')).astype(float), np.array(nachher.convert('RGBA')).astype(float)
    m = a[..., 3] > 230
    return float(np.linalg.norm(a[..., :3][m] - b[..., :3][m], axis=-1).mean())

def beschneiden(im: Image.Image, rand: float = 0.02) -> Image.Image:
    """Auf den Inhalt beschneiden, mit etwas Luft — sonst klebt das Produkt am Rand."""
    bb = im.getbbox()
    if not bb: return im
    w, h = im.size
    r = int(max(bb[2] - bb[0], bb[3] - bb[1]) * rand)
    return im.crop((max(0, bb[0] - r), max(0, bb[1] - r), min(w, bb[2] + r), min(h, bb[3] + r)))
