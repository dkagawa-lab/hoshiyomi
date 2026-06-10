# HOSHIYOMI X自動投稿

当日の天体イベント(月星座・星座移動・新月満月・逆行の開始/終了)を自動計算し、Claude APIで投稿文を生成してXに1日3回自動投稿します。GitHub Actionsで動くのでサーバー不要です。

## 仕組み

```
GitHub Actions (cron: 07:30 / 12:30 / 21:00 JST)
  → pyswisseph で当日の天体位置を計算(外部データ不要)
  → 検出イベント: 新月・満月 / 惑星の星座移動 / 逆行の開始・終了・継続中
  → Claude API が時間帯別の投稿文を生成(朝=今日の過ごし方 / 昼=豆知識 / 夜=ふり返り)
  → X API v2 で投稿
```

APIキー未設定でもテンプレート文で動作します(Claude APIなしでも可)。

## セットアップ

### 1. X API のキーを取得

1. https://developer.x.com で開発者アカウント登録(Freeプランで可)
2. アプリを作成し、**App permissions を「Read and write」に変更**(重要: デフォルトはRead only)
3. 権限変更後に Access Token & Secret を**再生成**(変更前のトークンでは書き込めません)
4. 以下4つを控える: API Key / API Key Secret / Access Token / Access Token Secret

Freeプランの投稿上限は変動するため最新の制限を公式で確認してください。1日3投稿(月約90件)なら現行の無料枠内に収まる想定です。

### 2. この一式をGitHubリポジトリへpush

このリポジトリでは、スクリプト本体を `scripts/x-auto-post/`、GitHub Actions設定を `.github/workflows/hoshiyomi-x-post.yml` に配置しています。

### 3. Secrets を登録

リポジトリの Settings → Secrets and variables → Actions → New repository secret:

| Secret名 | 内容 |
|---|---|
| `X_API_KEY` | X API Key |
| `X_API_SECRET` | X API Key Secret |
| `X_ACCESS_TOKEN` | Access Token |
| `X_ACCESS_SECRET` | Access Token Secret |
| `ANTHROPIC_API_KEY` | Claude APIキー(任意。なければテンプレ文) |

### 4. テスト実行

Actions タブ → 「HOSHIYOMI X auto post」→ Run workflow → dry_run を `1` のまま実行。
ログに生成された文面が出ます。問題なければ dry_run を `0` にして本投稿テスト。

以後は放置で毎日3回自動投稿されます。

## ローカルでのテスト

```bash
pip install -r scripts/x-auto-post/requirements.txt
DRY_RUN=1 python scripts/x-auto-post/generate_and_post.py morning   # morning / noon / night
```

## 運用上の注意

- **自動化ラベル**: Xのルール上、自動投稿アカウントはプロフィール設定の「アカウント情報 → 自動化」で自動化ラベルを付けることが推奨されています(運営者アカウントの紐付け)。
- **重複コンテンツ禁止**: 同一文面の繰り返し投稿はXのスパムポリシー違反になります。このスクリプトはClaude生成で毎回文面が変わるため通常は問題ありませんが、テンプレートモード(APIキーなし)で長期運用する場合は文面バリエーションを増やしてください。
- **断定表現の禁止**: プロンプト側で「必ず当たる」等の表現を禁止済みですが、生成文は最初の数週間は目視確認を推奨します。
- **投稿時間の変更**: `.github/workflows/hoshiyomi-x-post.yml` の cron を編集(UTC指定なのでJST-9時間)。
- **手動投稿との併用**: 自動投稿は「毎日の存在感」用。新月・満月などの大きなイベント日は、手動で画像付き投稿や引用を足すとエンゲージメントが伸びます。

## カスタマイズのポイント

- 投稿のキャラクター・口調: `generate_and_post.py` の `prompt` 内を編集
- リンクを入れる頻度: `include_link` の条件を編集(現状: 朝の投稿とイベント発生日)
- 投稿回数を増やす: cron行を追加し、`SLOT_BRIEF` に時間帯を追加
