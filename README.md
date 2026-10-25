# ことはちゃんのホームページ

HTML・CSS・JavaScriptで作った、GitHub Pages向けの個人サイトです。

公開サイト：<https://foxman0303.github.io/>

Codex向けのプロジェクト情報・作業指針は、ルートの [AGENTS.md](./AGENTS.md) にまとめています。

## パソコンで確認する

`index.html` をブラウザで開いてください。インストールやビルドは不要です。

作品のテトリスはJavaScriptモジュールを使うため、ローカルで遊ぶ場合はNode.jsで次を実行し、表示されたURLを開いてください。

```sh
node scripts/preview.cjs
```

## ページ構成

- `index.html`：自己紹介
- `works/index.html`：作品一覧。作品が増えたらカードを追加します。
- `works/tetris/index.html`：ブラウザで遊べるテトリス
- `works/tetris/engine.mjs`：ブロック移動・回転・ライン消去などのゲームルール
- `works/tetris/game.js`：描画・キーボードとタッチ操作・スコア保存

ゲームルールのテスト：`node --test tests/tetris.test.mjs`

## 内容を変更する

- `index.html`：名前、自己紹介、掲載する内容
- `style.css`：色、文字の大きさ、レイアウト

## GitHub Pagesに公開する

1. GitHubで `ユーザー名.github.io` という名前の公開リポジトリを作ります。すでにある場合は既存の内容を確認してから使います。
2. `index.html`、`style.css`、`.nojekyll` と `works/` フォルダーを同じ構成のまま追加し、変更を保存（コミット）します。
3. リポジトリの **Settings → Pages** を開きます。
4. **Source** を **Deploy from a branch** にします。
5. **Branch** にファイルを保存したブランチ（通常は `main`）、フォルダーに **/(root)** を選び、**Save** を押します。
6. 公開処理が完了したら、`https://ユーザー名.github.io/` を開きます。

公式ガイド：https://docs.github.com/ja/pages/quickstart
