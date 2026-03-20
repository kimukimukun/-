'use client'

import { CheckCircle, AlertCircle, XCircle, Download, RotateCcw } from 'lucide-react'
import { FormattedReport } from '@/lib/ai-formatter'

interface Props {
  report: FormattedReport
  onDownloadPDF: () => void
  onReset: () => void
  isPDFLoading: boolean
}

const severityConfig = {
  normal: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: '正常' },
  warning: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', label: '注意' },
  critical: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: '異常' },
}

export default function ReportPreview({ report, onDownloadPDF, onReset, isPDFLoading }: Props) {
  const reportTypeLabel = report.reportType === 'daily' ? '日報' : '異常報告書'
  const headerColor = report.reportType === 'daily' ? 'bg-blue-700' : 'bg-orange-600'

  return (
    <div className="space-y-4">
      {/* 成功バナー */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle className="text-green-600 shrink-0" size={20} />
        <div>
          <p className="text-sm font-semibold text-green-800">報告書が生成されました</p>
          <p className="text-xs text-green-600">内容を確認してPDFをダウンロードしてください</p>
        </div>
      </div>

      {/* 報告書プレビュー */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        {/* ヘッダー */}
        <div className={`${headerColor} text-white p-4`}>
          <p className="text-xs opacity-75">{reportTypeLabel}</p>
          <h2 className="text-lg font-bold mt-0.5">{report.title}</h2>
          <div className="flex gap-4 mt-2 text-xs opacity-90">
            <span>日付: {report.reportDate}</span>
            {report.operatorName && <span>担当: {report.operatorName}</span>}
            {report.section && <span>部署: {report.section}</span>}
          </div>
        </div>

        {/* 概要 */}
        {report.summary && (
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-500 mb-1">概要</p>
            <p className="text-sm text-gray-700">{report.summary}</p>
          </div>
        )}

        {/* 作業/異常 項目 */}
        <div className="divide-y divide-gray-100">
          {report.items.map((item, i) => {
            const severity = item.severity || 'normal'
            const config = severityConfig[severity]
            const Icon = config.icon

            return (
              <div key={i} className={`p-4 ${config.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className={config.color} />
                  <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
                  <span className="text-xs text-gray-500 ml-auto font-mono">{item.time}</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-semibold text-gray-500">【事象】</span>
                    <p className="text-sm text-gray-800 mt-0.5">{item.event}</p>
                  </div>
                  {item.cause && item.cause !== '特になし' && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500">【原因】</span>
                      <p className="text-sm text-gray-800 mt-0.5">{item.cause}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-semibold text-gray-500">【処置】</span>
                    <p className="text-sm text-gray-800 mt-0.5">{item.action}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500">【結果】</span>
                    <p className="text-sm text-gray-800 mt-0.5">{item.result}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <RotateCcw size={16} />
          新規作成
        </button>

        <button
          type="button"
          onClick={onDownloadPDF}
          disabled={isPDFLoading}
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-700 text-white font-semibold text-sm hover:bg-blue-800 active:bg-blue-900 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
        >
          <Download size={16} />
          {isPDFLoading ? 'PDF生成中...' : 'PDFダウンロード'}
        </button>
      </div>
    </div>
  )
}
