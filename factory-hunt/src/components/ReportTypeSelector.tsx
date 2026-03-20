'use client'

import { FileText, AlertTriangle } from 'lucide-react'
import { ReportType } from '@/lib/ai-formatter'

interface Props {
  value: ReportType
  onChange: (type: ReportType) => void
}

export default function ReportTypeSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange('daily')}
        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
          value === 'daily'
            ? 'border-blue-600 bg-blue-50 text-blue-700'
            : 'border-gray-200 bg-white text-gray-500'
        }`}
      >
        <FileText size={28} />
        <span className="text-sm font-semibold">日報</span>
        <span className="text-xs text-center leading-tight opacity-70">
          通常の作業記録
        </span>
      </button>

      <button
        type="button"
        onClick={() => onChange('incident')}
        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
          value === 'incident'
            ? 'border-orange-500 bg-orange-50 text-orange-600'
            : 'border-gray-200 bg-white text-gray-500'
        }`}
      >
        <AlertTriangle size={28} />
        <span className="text-sm font-semibold">異常報告書</span>
        <span className="text-xs text-center leading-tight opacity-70">
          トラブル・異常発生時
        </span>
      </button>
    </div>
  )
}
