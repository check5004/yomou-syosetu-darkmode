# Chromeウェブストア用素材

作成日：2026-09-26。まだストアへ提出していない素材候補です。[検証結果と留意点](../../docs/STORE_ASSET_VALIDATION.md)を先に確認してください。

## 紹介画像

![ライト／ダークと3配色を表すイラスト](promo-440x280.png)

- 提出用：[promo-440x280.png](promo-440x280.png) — 440×280、RGB PNG、透過なし。
- 原画像：[promo-original.png](promo-original.png) — 1572×1001。
- [生成プロンプトと使用ツール](PROMPT.md)。実在作品・第三者ロゴ・サイト画面は使っていません。

## スクリーンショット候補

各画像は1280×800のPNGです。架空の読書画面は、対象サイトの見た目を保証する画像ではありません。実設定画面を第一候補として、デモ画像は補助候補として扱います。

| 画像 | 内容 | 区分 |
| --- | --- | --- |
| [01-light-dark.png](screenshots/01-light-dark.png) | ライト／ダークの比較 | 独自の架空デモに実配色を適用 |
| [02-three-palettes.png](screenshots/02-three-palettes.png) | 夜・漆黒・暖色の比較 | 独自の架空デモに実配色を適用 |
| [03-supported-pages.png](screenshots/03-supported-pages.png) | ランキング・検索・目次の例 | 対応クラスを使った独自の架空デモ |
| [04-reader-settings.png](screenshots/04-reader-settings.png) | 本文調整と設定ポップアップ | 架空デモと実設定画面の組み合わせ |
| [05-actual-settings-only.png](screenshots/05-actual-settings-only.png) | 実際の設定画面で3配色を比較 | ストアの第一候補。実ポップアップの画面 |

作品名・作者名・あらすじ・本文・数値はこの試作用に作成した架空データです。対象サイトのHTML・CSS・画像は同梱していません。実設定画面は拡張機能のソースをそのまま使い、撮影時のみ保存APIをローカルで代替しています。

## 再生成

Node.js、既存のChromeまたはEdge、Playwrightがある環境で、リポジトリのルートから実行します。拡張機能を使う人にこれらの開発ツールは不要です。

```sh
node scripts/store-screenshots.mjs
```

必要に応じて`PLAYWRIGHT_MODULE_PATH`と`CHROME_PATH`で既存のインストール先を指定します。スクリプトは外部サイトへアクセスせず、ループバック上のローカル素材を撮影します。ブラウザーを新たにダウンロードする処理もありません。

`verification.json`に寸法、適用した配色、本文設定、外部リクエストの有無を記録します。撮影用スクリプトは配布ZIPに含みません。紹介イラストの再生成は上記プロンプトを使用し、提出サイズへの縮小後も目視で確認してください。
