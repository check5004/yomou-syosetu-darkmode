# アプリアイコン

「夜の読書」を表す、開いた本と三日月のオリジナル画像です。非公式拡張機能の独自アイコンとして使用します。

- 生成方法: built-in `image_gen`（`logo-brand`、新規生成）
- 作成日: 2026-09-26
- 原画像: `assets/app-icon.png`
- README 用縮小版: `assets/app-icon-256.png`
- Chrome 用: `extension/icons/app-icon-{16,32,48,128}.png`
- 縮小方法: Sharp の Lanczos3 リサイズ。画像内容の変更はありません。
- 元の SVG と `icon-*.png` は初期案として保持しています。配布用マニフェストは新しい `app-icon-*.png` を参照します。

## 生成プロンプト

```text
Use case: logo-brand
Asset type: production Chrome extension app icon for a Japanese dark-mode reading extension named 読もう、夜。; no lettering is to appear in the image.
Primary request: Create a polished, minimal square app icon combining a bold open book in warm ivory and a mint crescent moon above and partially behind the book.
Scene/backdrop: Deep navy #111722 rounded-square field with gently rounded corners, filling the square canvas. Outside the rounded-square corners, use genuine transparency.
Style/medium: Clean premium flat bitmap logo, crisp geometric silhouette, smooth edges, restrained luminous feeling achieved with colors rather than effects.
Composition/framing: Centered unified moon-and-book symbol filling approximately 80% of the field; generous but not excessive padding. The book is front-facing and open, with two clearly separated broad pages and a simple spine. The crescent is large enough to recognize at toolbar sizes, rising above the book. Keep the design legible at 16 pixels.
Color palette: Deep navy #111722 field, warm ivory #f1eee4 book, soft mint #8bcfc1 moon.
Constraints: Output one square icon, ideally 1024 × 1024. No text, no letters, no watermark, no stars, no tiny decoration, no mockup, no border, no 3D, no photorealism, no heavy glow, no gradients, no surrounding presentation.
```
