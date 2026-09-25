# 紹介イラストの生成記録

- 作成日：2026-09-26
- 方法：built-in `image_gen`、新規生成（`ads-marketing`）
- 原画像：`promo-original.png`
- ストア提出用：`promo-440x280.png`（440×280、RGB PNG、透過なし）
- 書き出し：SharpのLanczos3で規定寸法に縮小。図案の内容は変更していません。
- 表す機能：明暗切り替え、夜／漆黒／暖色の3配色。
- イラストは実画面ではありません。実在の作品本文・サイト画像・ロゴは使用していません。

## 使用したプロンプト

```text
Use case: ads-marketing
Asset type: Original small promotional illustration for the Chrome Web Store, for a Japanese novel-reading dark-mode extension called "読もう、夜。". Generate one landscape image at 1320 x 840 (11:7 aspect ratio) if supported, intended to be downscaled to 440 x 280.
Primary request: Make light/dark switching and three selectable dark palettes instantly understandable through illustration alone.
Subject/composition: A large open book dominates the center, viewed straight-on with slight dimensional depth. Its left page is warm ivory with dark abstract horizontal reading lines, its right page is deep navy with pale reading lines. Above the book, a single clear pill-shaped light/dark toggle contains a small sun on the light side and crescent moon on the dark side. Below and slightly in front of the book, show exactly three evenly spaced, large selectable rounded palette chips: navy (#111722), near-black (#0b0d10), and warm brown (#1d1915), each with two short contrasting text-like strokes; a restrained mint selection ring surrounds the navy chip. Use broad legible forms that still read at 220 x 140. No tiny interface controls.
Style/medium: Polished contemporary editorial illustration, clean geometric paper shapes with a little soft depth and subtle warm texture. Calm, sophisticated, friendly and functional. No photorealism. This is clearly an illustration, never a screenshot or actual app interface.
Scene/backdrop: Full-bleed deep teal-blue background; an understated brighter halo behind the book separates it from the background. Soft mint and warm cream accents echo the existing moon-and-open-book brand. Fill the available area with balanced breathing room and all important shapes at least 6 percent away from the edges.
Constraints: Original artwork. No lettering, no numbers, no logos, no trademarks, no real website UI, no copyrighted novel text, no people, no ratings, no awards, no price badges, no watermarks, no decorative confetti or stars. The three chips must be clearly distinct in hue, not three identical black squares. Opaque background.
```
