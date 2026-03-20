export type ReportType = 'daily' | 'incident'

export interface FormattedReport {
  title: string
  reportDate: string
  operatorName: string
  section: string
  reportType: ReportType
  items: ReportItem[]
  summary: string
}

export interface ReportItem {
  time: string
  event: string
  cause: string
  action: string
  result: string
  severity?: 'normal' | 'warning' | 'critical'
}

const SYSTEM_PROMPT_DAILY = `あなたは飲料工場の日報を整形する専門アシスタントです。
現場担当者が入力した砕けたメモを、工場長や品質管理部門に提出できる正式な日報フォーマットに変換してください。

出力は必ず以下のJSON形式にしてください：
{
  "title": "日報タイトル",
  "reportDate": "YYYY-MM-DD形式の日付",
  "operatorName": "担当者名（不明な場合は空文字）",
  "section": "担当セクション（不明な場合は空文字）",
  "reportType": "daily",
  "items": [
    {
      "time": "HH:MM形式の時刻",
      "event": "発生した事象の説明",
      "cause": "原因（不明・特になしの場合は「特になし」）",
      "action": "取った処置・対応",
      "result": "処置後の結果・状態",
      "severity": "normal | warning | critical のいずれか"
    }
  ],
  "summary": "全体的なまとめ（100文字以内）"
}

severityの判定基準：
- normal: 通常作業・異常なし
- warning: 軽微な異常・要注意
- critical: 重大な異常・即時対応が必要だったもの`

const SYSTEM_PROMPT_INCIDENT = `あなたは飲料工場の異常報告書を整形する専門アシスタントです。
現場担当者が入力した砕けたメモを、工場長や品質管理部門に提出できる正式な異常報告書フォーマットに変換してください。

出力は必ず以下のJSON形式にしてください：
{
  "title": "異常報告書タイトル",
  "reportDate": "YYYY-MM-DD形式の日付",
  "operatorName": "担当者名（不明な場合は空文字）",
  "section": "担当セクション（不明な場合は空文字）",
  "reportType": "incident",
  "items": [
    {
      "time": "HH:MM形式の時刻",
      "event": "発生した異常事象の詳細説明",
      "cause": "推定原因・考察",
      "action": "取った緊急処置・対応内容",
      "result": "処置後の結果・現在の状態",
      "severity": "warning | critical のいずれか"
    }
  ],
  "summary": "異常の概要と今後の対応方針（150文字以内）"
}`

export async function formatReportWithAI(
  rawInput: string,
  reportType: ReportType,
  currentDate: string
): Promise<FormattedReport> {
  const systemPrompt = reportType === 'daily' ? SYSTEM_PROMPT_DAILY : SYSTEM_PROMPT_INCIDENT

  const userPrompt = `本日の日付: ${currentDate}

以下の現場メモを整形してください：

${rawInput}`

  const response = await fetch('/api/format-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userPrompt }),
  })

  if (!response.ok) {
    throw new Error('AI整形APIの呼び出しに失敗しました')
  }

  const data = await response.json()
  return data.result as FormattedReport
}
