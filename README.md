# ことはちゃんのホームページ

HTMLとCSSだけで作った、GitHub Pages向けの自己紹介ページです。

## パソコンで確認する

`index.html` をブラウザで開いてください。インストールやビルドは不要です。

## 内容を変更する

- `index.html`：名前、自己紹介、掲載する内容
- `style.css`：色、文字の大きさ、レイアウト

## GitHub Pagesに公開する

1. GitHubで `ユーザー名.github.io` という名前の公開リポジトリを作ります。すでにある場合は既存の内容を確認してから使います。
2. このフォルダーの `index.html`、`style.css`、`.nojekyll` をリポジトリの直下に追加し、変更を保存（コミット）します。
3. リポジトリの **Settings → Pages** を開きます。
4. **Source** を **Deploy from a branch** にします。
5. **Branch** にファイルを保存したブランチ（通常は `main`）、フォルダーに **/(root)** を選び、**Save** を押します。
6. 公開処理が完了したら、`https://ユーザー名.github.io/` を開きます。

公式ガイド：https://docs.github.com/ja/pages/quickstart
