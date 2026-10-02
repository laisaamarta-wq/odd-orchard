# Odd Orchard — Behance: тексты, порядок загрузки, публикация

Live: https://odd-orchard.vercel.app · Case page: https://odd-orchard.vercel.app/behance/

Все тексты для Behance — на английском (как и сам сайт). Пояснения — на русском.

---

## 0. Что загружать (папка `behance-export/`)

| Файл | Что это | Тип на Behance |
|---|---|---|
| `plates/cover-1616x1264.png` | Обложка: Cherry, Vesper на нити | Cover |
| `plates/plate-01.jpg … plate-12.jpg` | 12 плит, 2800 px шириной (2×) | Image |
| `motion/mo-world-switch-1280x800.mp4` | Переключение 4 миров кликом | Video |
| `motion/mo-add-to-basket-1280x800.mp4` | Add to basket → корзина | Video |
| `motion/mo-mobile-780x1688.mp4` | Мобильный: свайп миров, bottom sheet | Video |
| `motion/mo-field-notes-1280x800.mp4` | Горизонтальный скролл глав *(опционально)* | Video |
| `motion/mo-keepers-1080.mp4`, `mo-specimen-1080.mp4`, `mo-ritual-1280x800.mp4` | Запасные клипы — для Reels/Dribbble или вместо GIF | — |
| `motion/gif-idle-{kiwi,orange,cherry,pitaya}-480.gif` | Хранители в покое, петли 3 с | Photo Grid (4 в ряд) |
| `motion/gif-world-switch-720.gif` | Короткая петля переключения | запасной |

Проверенные ограничения Behance: изображение < 50 MB и не больше 32 Мп (наши плиты — до ~10.6 Мп), видео < 1 GB и не шире 1280 px при прямой загрузке, обложка — минимум 808 × 632.

---

## 1. Create Project

1. Behance → **Share your work → Project** (на десктопе, не в приложении).
2. Справа **Styles**:
   - Background color: `#0D0C09` (тёмная рама между цветными плитами смотрится лучше, чем белая).
   - **Spacing between content: 0** — плиты рассчитаны на то, чтобы стыковаться без зазоров, цвет сменяется на стыке, как на сайте.
3. Сохраняйте черновик по ходу (**Save as draft**) — Behance не сохраняет автоматически.

## 2. Порядок модулей

Не больше 4 видео и одной сетки GIF — этого достаточно; остальное держите в запасе.

| # | Модуль | Файл / текст |
|---|---|---|
| 1 | Image | `plate-01.jpg` |
| 2 | Text | **Intro** (ниже) |
| 3 | Image | `plate-02.jpg` |
| 4 | Image | `plate-03.jpg` |
| 5 | Image | `plate-04.jpg` |
| 6 | Image | `plate-05.jpg` |
| 7 | Photo Grid | 4 × `gif-idle-*.gif` (порядок kiwi, orange, cherry, pitaya) |
| 8 | Image | `plate-06.jpg` |
| 9 | Image | `plate-07.jpg` |
| 10 | Video | `mo-world-switch-1280x800.mp4` |
| 11 | Image | `plate-08.jpg` |
| 12 | Video | `mo-add-to-basket-1280x800.mp4` |
| 13 | Image | `plate-09.jpg` |
| 14 | Video *(опц.)* | `mo-field-notes-1280x800.mp4` |
| 15 | Image | `plate-10.jpg` |
| 16 | Video | `mo-mobile-780x1688.mp4` |
| 17 | Image | `plate-11.jpg` |
| 18 | Image | `plate-12.jpg` |
| 19 | Text | **Live + credits** (ниже) — ссылка кликабельна |

**Image vs. video/GIF.** Как изображения — всё, что читается в статике: плиты с текстом, сетки скриншотов, палитры. Как видео — всё, где смысл в движении и в последовательности: переход между мирами, корзина, мобильный свайп. GIF — только короткие бесшовные петли без звука (хранители в покое): они автоматически играют в ленте и весят мало. Для максимального качества видео можно залить на Vimeo и вставить через **Embed** — тогда оно будет full-bleed, а не 1280 px.

## 3. Тексты модулей

**Intro** (после plate 01):

> Odd Orchard is a fictional cold-pressed juice from an orchard that isn’t on any map. Four flavors, four worlds — each with its own palette, fruit, copy and a creature that keeps it. Switching a flavor recolours the whole site, and every keeper arrives in character.

**Live + credits** (последний модуль):

> **Visit the orchard → odd-orchard.vercel.app**
>
> Role — Concept, art direction, UX/UI design, AI visual creation, front-end development
> Design — Marta Jakovleva
> Development — React 19, Vite, GSAP + ScrollTrigger, Lenis · AI-assisted with Claude Code
> Visuals — Higgsfield (GPT Image 2.5), processed with Python + Pillow
> Type — Bricolage Grotesque, Instrument Serif, JetBrains Mono
>
> Odd Orchard is a fictional brand; checkout is a placeholder.

Текст внутри плит (для справки и для alt-текстов):

- **Title:** Odd Orchard — Every flavor has a keeper
- **Subtitle:** An interactive brand world for a fictional cold-pressed juice. Concept, art direction, AI visuals, front-end.
- **Overview:** Odd Orchard is a fictional cold-pressed juice from an orchard that isn’t on any map. The site sells four flavors and treats each one as a world, not a product variant.
- **Challenge:** Juice brands look alike: fruit, splash, bright colour, repeat. The aim was a brand remembered by character, and a site where switching a flavor feels like stepping somewhere else, not changing a filter.
- **Approach:** Every flavor is defined once, as data: seven colour tokens, a keeper, four fruit pieces, copy and a motion verb. The interface reads that record and rebuilds itself around it.
- **Design concept:** Grotesque says what it is. Serif says how it feels. Mono labels turn every screen into a specimen sheet. The palette is four complete worlds of seven tokens, tweened live on the root element when the flavor changes.
- **Interaction:** The switch is staged, not faded. One click runs a single timeline: the old keeper exits, the new world opens from the tapped button, the palette tweens on the root, the bottle drops in, and the new keeper arrives in character.
- **Responsive:** On smaller screens the hero drops its secondary copy and the keeper line moves under the bottle. The story turns vertical, the basket becomes a bottom sheet you can drag closed, and a swipe switches worlds.
- **Result:** A complete, working brand experience: four worlds, four keepers, a functioning basket and a story told through scroll. Built in React with GSAP and live on Vercel.
- **CTA:** Visit the orchard → odd-orchard.vercel.app

## 4. Cover

Загрузите `cover-1616x1264.png`. В кадрировании растяните рамку на всё изображение (пропорции уже 808 × 632). Не добавляйте текст поверх: на превью 202 × 158 читаются только бутылка, Vesper и бордовый цвет — этого достаточно, название проекта Behance покажет под обложкой.

## 5. Project settings

- **Project title:** `Odd Orchard — Every flavor has a keeper`
- **Description** (≤ 1500 знаков):

> Odd Orchard is a concept juice brand built as an interactive website. Four flavors, four worlds: each brings its own palette, fruit, copy and a creature that keeps it — Moss the velvet chameleon, Marmalade the citrus moth, Vesper the cherry bat and Pip the air axolotl. Switching a flavor recolours the entire site and every keeper arrives with its own choreography. Self-initiated concept: art direction, UX/UI, AI visuals (Higgsfield) and front-end (React, GSAP).
> Live: https://odd-orchard.vercel.app

- **Tags** (10): `web design`, `interactive design`, `art direction`, `branding`, `packaging`, `juice`, `character design`, `ai art`, `gsap`, `motion design`
- **Tools used:** добавьте то, что реально использовалось и есть в списке Behance: React, GSAP, Vercel, Higgsfield (если поле не предлагает — впишите вручную или пропустите). Figma не указывайте, если её не было.
- **Creative fields** (до 3): Web Design · Interaction Design · Branding
- **Generative AI:** если редактор предлагает отметку об использовании генеративного AI — включите: хранители и фрукты сгенерированы.
- **Co-owners:** нет.
- **Copyright:** All Rights Reserved.
- **Adult content:** нет.

## 6. Ссылка на live website

1. В последнем текстовом модуле — кликабельная строка `Visit the orchard → odd-orchard.vercel.app`.
2. В Description — полный URL.
3. Плита 12 показывает адрес визуально (на изображении он не кликабелен — поэтому текстовый модуль обязателен).

## 7. Publish

1. **Preview** — пролистайте на десктопе и в мобильном превью: стыки плит без зазоров, видео играют.
2. Visibility: **Everyone**.
3. **Publish**. Сразу после публикации — добавьте проект в Mood board / поделитесь в LinkedIn с ссылкой на Behance.

## 8. Как не перегрузить проект

- Порядок держит одну линию: идея → язык → хранители → продукт → движение → адаптив → результат. Не вставляйте сырые скриншоты между плитами — всё нужное уже внутри плит.
- 4 видео — максимум. Field notes и specimen — опциональные.
- Текстовых модулей только два: intro и финал. Остальной текст уже в плитах.

## 9. Пересоздать ассеты после изменений сайта

```bash
npm run build && npm run preview          # или OO_BASE=https://odd-orchard.vercel.app
npm run behance:capture                   # скриншоты → public/behance/shots/*.webp
npm run build && npm run preview          # пересобрать case page с новыми скриншотами
npm run behance:export                    # плиты + обложка → behance-export/plates
npm run behance:motion                    # видео и GIF → behance-export/motion (нужен ffmpeg)
```

Нужен Playwright (`npm i -D playwright && npx playwright install chromium`) и Pillow (`pip install pillow`).

---

## Checklist

- [x] production site untouched — основной бандл собирается байт-в-байт как раньше (`index-Nvll_UeC.js`, `index-8Or_MJKH.css`); case собирается отдельным конфигом
- [x] case study route works — `/behance/`
- [x] desktop presentation ready — плиты 1400 px, экспорт 2800 px
- [x] mobile presentation ready — `/behance/` масштабирует плиты целиком на узких экранах
- [x] cover ready — `cover-1616x1264.png`
- [x] screenshots exported — `public/behance/shots`, raw PNG в `behance-export/raw`
- [x] motion assets ready — `behance-export/motion`
- [x] copy ready — раздел 3
- [x] credits ready — раздел 3, Live + credits
- [x] live URL ready — https://odd-orchard.vercel.app
- [x] Behance order ready — раздел 2
- [x] publishing settings ready — раздел 5
