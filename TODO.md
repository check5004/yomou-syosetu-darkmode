# ToDo

更新日：2026-09-27

## 優先：Chromeウェブストアで公開する

- [x] Chrome拡張機能を実装し、主要ページの表示と設定を検証する。
- [x] GitHub ReleasesでZIPを配布する。
- [x] アプリアイコン・README・プライバシーポリシーを用意する。
- [x] [ストア申請のハードル・本人入力項目・入力文案](docs/CHROME_WEB_STORE.md)を整理する。
- [ ] 公開に使うGoogleアカウントを選び、2段階認証を設定する。
- [ ] Chromeウェブストアの開発者登録を行い、初回登録料を支払う。
- [x] 公開する開発者名（Tate）と連絡先メールの指定を受け取る。
- [ ] 連絡先メールの認証と、Trader／Non-Traderの本人申告を完了する。
- [ ] 必要な場合はGoogleの画面で本人・住所・電話番号の確認を完了する。
- [x] 紹介イラスト（440×280）を作成し、[素材の作成方法](docs/STORE_ASSET_VALIDATION.md)を記録する。
- [x] 保存済みの実サイトのHTML・CSSを使い、検索・ランキング・小説目次の3画面（1280×800）へ差し替える。作品由来の文字の範囲だけをCSSでぼかして撮影し、レイアウトと操作UIを確認する。
- [ ] ストア向けスクリーンショット3枚の最終確認を行い、提出画像を確定する。
- [ ] 128×128アイコンの余白をストアの画像ガイドに合わせて最終調整する。
- [ ] 申請用ZIPを確定し、説明文・単一目的・権限の理由・プライバシー申告を登録する。
- [ ] 公開範囲・配信国・公開タイミングを決めて審査へ提出する。
- [ ] 承認後にストアからインストールして確認し、READMEへストアのリンクを追加する。
- [ ] 初回公開後、必要に応じてGitHub Actionsからのストア更新自動化を検討する。

## 後日：iPhone／iPadのSafariに対応する

- [ ] Apple Developer Programの年会費を含め、Safari版を公開するか決める。
- [ ] Safari用APIの互換性と、モバイル版サイトの配色・操作を確認する。
- [ ] App Store ConnectのSafari Web Extension PackagerでiOS向けにパッケージ化する。
- [ ] iPhone／iPad実機で設定保存・配色・目次・本文・モバイル用設定UIを検証する。
- [ ] App Store向けの説明文・画像・プライバシー申告を用意する。
- [ ] TestFlightで確認後、App Storeの審査へ提出する。

Safari版の一般配布には原則として[Apple Developer Program](https://developer.apple.com/jp/programs/enroll/)への加入が必要です。現時点では[ブラウザーから使える公式Packager](https://developer.apple.com/documentation/safariservices/packaging-and-distributing-safari-web-extensions-with-app-store-connect)があり、MacやXcodeは必須ではありません。Safari版の実装・アカウント登録・課金は未着手です。
