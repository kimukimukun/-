'use client'

import { useState, useCallback } from 'react'
import { Mic, MicOff, Camera, X, Loader2, Sparkles } from 'lucide-react'
import { ReportType } from '@/lib/ai-formatter'

interface Props {
  reportType: ReportType
  onSubmit: (data: {
    rawInput: string
    operatorName: string
    section: string
    photos: File[]
  }) => void
  isLoading: boolean
}

const PLACEHOLDER_DAILY = `例：
14:30 調合タンクA 温度が設定より2度高い。冷却水バルブを開いて調整。5分後に正常値に戻った。
15:00 ライン1の充填機、ボトルジャムが発生。手動で取り除き復旧。原因はボトルの変形。
17:00 作業終了。本日の生産数 2,400本。品質チェック問題なし。`

const PLACEHOLDER_INCIDENT = `例：
14:30 調合タンクAで異常温度を検知。設定値55℃に対し62℃を記録。
即座に冷却水供給を増加し、ライン稼働を一時停止。
品質管理部に連絡済み。原因は冷却バルブの部分閉塞の可能性あり。
14:45 温度が55℃に回復。設備点検後に再稼働。`

export default function InputForm({ reportType, onSubmit, isLoading }: Props) {
  const [rawInput, setRawInput] = useState('')
  const [operatorName, setOperatorName] = useState('')
  const [section, setSection] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newPhotos = [...photos, ...files].slice(0, 5)
    setPhotos(newPhotos)

    const newPreviews = newPhotos.map((f) => URL.createObjectURL(f))
    setPhotoPreviews(newPreviews)
  }, [photos])

  const removePhoto = useCallback((index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    const newPreviews = photoPreviews.filter((_, i) => i !== index)
    setPhotos(newPhotos)
    setPhotoPreviews(newPreviews)
  }, [photos, photoPreviews])

  const handleVoiceInput = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SpeechRecognitionClass = w.webkitSpeechRecognition || w.SpeechRecognition
    if (!SpeechRecognitionClass) {
      alert('お使いのブラウザは音声入力に対応していません。Chrome等をお試しください。')
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SpeechRecognitionClass()
    recognition.lang = 'ja-JP'
    recognition.continuous = true
    recognition.interimResults = false

    recognition.onstart = () => setIsRecording(true)
    recognition.onend = () => setIsRecording(false)
    recognition.onerror = () => setIsRecording(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r[0].transcript)
        .join('')
      setRawInput((prev) => prev + (prev ? '\n' : '') + transcript)
    }

    if (isRecording) {
      recognition.stop()
    } else {
      recognition.start()
    }
  }, [isRecording])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rawInput.trim()) {
      alert('現場メモを入力してください')
      return
    }
    onSubmit({ rawInput, operatorName, section, photos })
  }

  const placeholder = reportType === 'daily' ? PLACEHOLDER_DAILY : PLACEHOLDER_INCIDENT

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 担当者情報 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">担当者情報</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">担当者名</label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              placeholder="山田 太郎"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">担当セクション</label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="調合ライン1"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* メモ入力エリア */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">現場メモ入力</h2>
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
            {isRecording ? '録音停止' : '音声入力'}
          </button>
        </div>

        <textarea
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder={placeholder}
          rows={8}
          className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          required
        />
        <p className="text-xs text-gray-400 mt-1.5">
          ※ 砕けた表現・箇条書きOK。AIが自動で整形します。
        </p>
      </div>

      {/* 写真アップロード */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
          写真添付 <span className="text-gray-400 font-normal normal-case">（最大5枚）</span>
        </h2>

        <div className="grid grid-cols-3 gap-2">
          {photoPreviews.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`写真${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {photoPreviews.length < 5 && (
            <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <Camera size={24} className="text-gray-400" />
              <span className="text-xs text-gray-400">追加</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isLoading || !rawInput.trim()}
        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all ${
          isLoading || !rawInput.trim()
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : reportType === 'daily'
            ? 'bg-blue-700 text-white active:bg-blue-800 shadow-lg shadow-blue-200'
            : 'bg-orange-500 text-white active:bg-orange-600 shadow-lg shadow-orange-200'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            AI整形中...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            AIで報告書を生成する
          </>
        )}
      </button>
    </form>
  )
}
