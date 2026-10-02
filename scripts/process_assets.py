#!/usr/bin/env python3
"""Turn the raw Higgsfield PNGs in ./raw into web-ready transparent WebPs in ./public/assets.

- bottles / characters: trimmed to their alpha bounds, resized, WebP with alpha
- fruit sheets (2x2 grids): split into 4 pieces, each trimmed -> fruit-<flavor>-<1..4>.webp
"""
import os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'raw')
OUT = os.path.join(ROOT, 'public', 'assets')
os.makedirs(OUT, exist_ok=True)
FLAVORS = ['kiwi', 'orange', 'cherry', 'pitaya']


def trim(im, pad=0.02, thresh=12):
    a = im.getchannel('A').point(lambda v: 255 if v > thresh else 0)
    box = a.getbbox()
    if not box:
        return im
    l, t, r, b = box
    p = int(max(r - l, b - t) * pad)
    return im.crop((max(0, l - p), max(0, t - p), min(im.width, r + p), min(im.height, b + p)))


def save(im, name, max_w=None, max_h=None, q=86):
    if max_w and im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    if max_h and im.height > max_h:
        im = im.resize((round(im.width * max_h / im.height), max_h), Image.LANCZOS)
    path = os.path.join(OUT, name + '.webp')
    im.save(path, 'WEBP', quality=q, method=6)
    print(f'{name:22s} {im.width}x{im.height}  {os.path.getsize(path)//1024} KB')


for f in FLAVORS:
    b = Image.open(os.path.join(RAW, f'bottle-{f}.png')).convert('RGBA')
    save(trim(b, pad=0.01), f'bottle-{f}', max_h=1000)
    c = Image.open(os.path.join(RAW, f'char-{f}.png')).convert('RGBA')
    save(trim(c), f'char-{f}', max_w=1000, max_h=1000)
    s = Image.open(os.path.join(RAW, f'fruit-{f}.png')).convert('RGBA')
    w, h = s.size
    quads = [(0, 0, w // 2, h // 2), (w // 2, 0, w, h // 2), (0, h // 2, w // 2, h), (w // 2, h // 2, w, h)]
    for i, q in enumerate(quads, 1):
        save(trim(s.crop(q)), f'fruit-{f}-{i}', max_w=420, max_h=420, q=84)
print('done')
