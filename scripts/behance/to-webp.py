"""Convert behance-export/raw/*.png captures into the WebPs the /behance page uses.
   python3 scripts/behance/to-webp.py   (needs Pillow)"""
import glob, os
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
SRC = os.path.join(ROOT, 'behance-export', 'raw')
DST = os.path.join(ROOT, 'public', 'behance', 'shots')
os.makedirs(DST, exist_ok=True)

for f in sorted(glob.glob(os.path.join(SRC, '*.png'))):
    name = os.path.basename(f)[:-4]
    im = Image.open(f).convert('RGB')
    if im.width > 2880:
        im = im.resize((2880, round(im.height * 2880 / im.width)), Image.LANCZOS)
    im.save(os.path.join(DST, f'{name}.webp'), 'WEBP', quality=84, method=6)
    print('✓', name)
