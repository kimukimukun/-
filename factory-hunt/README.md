# FACTORY-HUNT - 工場現場 報告書自動生成システム

音声・テキスト入力でAIが自動生成する、飲料工場向けモバイル報告書作成Webアプリ。

## 機能

- **モバイルフレンドリーUI** - 現場スマホでの操作を想定した大ボタン・大文字UI
- **音声入力** - ブラウザの音声認識APIで日本語音声入力対応
- **AI整形** - Claude 3.5 Sonnetが砕けたメモを正式な報告書フォーマットに変換
- **日報 / 異常報告書** の2モード対応
- **写真添付** - 最大5枚の現場写真をアップロード
- **PDFダウンロード** - jsPDFで生成した報告書をダウンロード
- **Supabaseに保存** - 作成した報告書をクラウドDBに保存

## セットアップ

### 1. 依存関係のインストール

```bash
cd factory-hunt
npm install
```

### 2. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成:

```bash
cp .env.local.example .env.local
```

以下の値を設定:
- `NEXT_PUBLIC_SUPABASE_URL` - SupabaseプロジェクトのURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabaseの匿名キー
- `SUPABASE_SERVICE_ROLE_KEY` - Supabaseのサービスロールキー（写真アップロード用）
- `ANTHROPIC_API_KEY` - Anthropic APIキー

### 3. Supabaseのセットアップ

Supabase SQL Editorで `supabase/schema.sql` を実行してテーブルとストレージバケットを作成。

### 4. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセス。

## 技術スタック

| 種別 | 技術 |
|------|------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Lucide React |
| Backend | Next.js API Routes |
| DB/Storage | Supabase |
| AI | Claude claude-sonnet-4-6 (Anthropic API) |
| PDF | jsPDF + jspdf-autotable |

## ファイル構成

```
factory-hunt/
├── src/
│   ├── app/
│   │   ├── page.tsx          # メインページ
│   │   ├── layout.tsx        # レイアウト
│   │   ├── globals.css       # グローバルスタイル
│   │   └── api/
│   │       ├── format-report/ # AI整形APIエンドポイント
│   │       └── upload-photo/  # 写真アップロードAPIエンドポイント
│   ├── components/
│   │   ├── Header.tsx          # ヘッダー
│   │   ├── ReportTypeSelector.tsx  # 日報/異常報告書選択
│   │   ├── InputForm.tsx       # メモ入力フォーム
│   │   └── ReportPreview.tsx   # 生成報告書プレビュー
│   └── lib/
│       ├── ai-formatter.ts    # AI整形ロジック
│       ├── pdf-generator.ts   # PDF生成
│       └── supabase.ts        # Supabaseクライアント
└── supabase/
    └── schema.sql             # DBスキーマ
```

## 今後の拡張予定

- [ ] 日本語フォント(NotoSansJP)のPDF埋め込み
- [ ] Supabase Authによるログイン機能
- [ ] 過去レポート一覧・検索機能
- [ ] 週次・月次サマリー自動生成
- [ ] PWA対応（オフライン下書き保存）
