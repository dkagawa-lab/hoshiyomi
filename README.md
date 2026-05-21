# Hoshiyomi

出生図をもとに無料診断と星読み相談を提供する、販売検証向けのNext.js MVPです。

## できること

- 生年月日・出生時刻・出生地からホロスコープを計算
- 太陽、月、水星から海王星、ASC、MC、ハウス、主要アスペクトを表示
- 無料会員登録後は初回5回まで相談でき、その後は1日3回。通常プランは月50回、プライベートプランは月200回で相談回数と占い師タイプを切り替え
- 追加100回パックを1,500円で購入可能
- `ANTHROPIC_API_KEY` があれば本番回答、無ければデモ回答
- `ANTHROPIC_MODEL` または `ANTHROPIC_MODEL_FREE_TRIAL` / `ANTHROPIC_MODEL_FREE_AFTER_TRIAL` / `ANTHROPIC_MODEL_FREE` / `ANTHROPIC_MODEL_STANDARD` / `ANTHROPIC_MODEL_LUXURY` でプラン別に回答モデルを切り替え可能
- `SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` があれば、相談履歴・回数・追加枠をサーバー側で保存
- Supabase接続時は、問い合わせフォームの内容も `contact_inquiries` に保存
- `STRIPE_SECRET_KEY` とPrice IDがあればStripe Checkoutへ遷移し、Webhookでプラン・追加100回をDBへ反映
- LINE webhookの受け口を用意

## 起動

```bash
npm install
npm run dev
```

`http://localhost:3000` を開きます。

## 本番化に必要な設定

1. Vercelにデプロイ
2. `.env.example` を元に環境変数を設定
3. Supabaseで `supabase/schema.sql` を実行
4. Stripeで通常プランとプライベートプランのPrice IDを作成
5. Stripeで追加100回パックのPrice IDを作成
6. 通常プランの初回480円用に、Stripeで500円OFF・1回限りのCoupon IDを作成
7. Stripe webhookを `/api/stripe/webhook` に設定
8. 問い合わせフォーム、プライバシーポリシー、決済条件、特定商取引法表記を実情報に差し替え
9. LINE DevelopersでWebhook URLを `/api/line/webhook` に設定

Supabaseを設定していないローカル環境では、これまで通りブラウザ内の保存でデモ動作します。Supabaseを設定すると、相談API側で回数判定と履歴保存を行います。

## AI回答の本番設定

まずは `.env.local` に `ANTHROPIC_API_KEY` を入れると、`/api/chat` がデモ回答ではなく本番回答を返します。

モデルを変えたい場合は、全プラン共通なら `ANTHROPIC_MODEL`、プラン別に変えるなら以下を設定します。

```bash
ANTHROPIC_MODEL_FREE_TRIAL=
ANTHROPIC_MODEL_FREE_AFTER_TRIAL=
ANTHROPIC_MODEL_FREE=
ANTHROPIC_MODEL_STANDARD=
ANTHROPIC_MODEL_LUXURY=
```

無料プランでも、最初の10回は `ANTHROPIC_MODEL_FREE_TRIAL` を優先して使います。未設定の場合は通常プラン用モデル、共通モデル、デフォルトの高性能モデルの順に使います。11回目以降は `ANTHROPIC_MODEL_FREE_AFTER_TRIAL`、`ANTHROPIC_MODEL_FREE`、共通モデル、軽量モデルの順に使います。

有料プランでは、保存済みの相談履歴もAPI側で参照します。質問を重ねるほど、過去の悩み、願い、判断の癖を踏まえた回答に寄せる設計です。
