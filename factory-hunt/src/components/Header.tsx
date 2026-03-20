'use client'

import { Factory, ClipboardList } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-blue-800 text-white safe-top">
      <div className="px-4 py-4 flex items-center gap-3">
        <div className="bg-blue-600 rounded-lg p-2">
          <Factory size={24} />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight tracking-wide">FACTORY-HUNT</h1>
          <p className="text-blue-300 text-xs">工場現場 報告書自動生成システム</p>
        </div>
        <div className="ml-auto">
          <ClipboardList size={20} className="text-blue-300" />
        </div>
      </div>
    </header>
  )
}
