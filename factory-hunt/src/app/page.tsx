'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import ReportTypeSelector from '@/components/ReportTypeSelector'
import InputForm from '@/components/InputForm'
import ReportPreview from '@/components/ReportPreview'
import { ReportType, FormattedReport, formatReportWithAI } from '@/lib/ai-formatter'
import { generatePDF } from '@/lib/pdf-generator'
import { supabase } from '@/lib/supabase'

type Step = 'input' | 'preview'

export default function Home() {
  const [step, setStep] = useState<Step>('input')
  const [reportType, setReportType] = useState<ReportType>('daily')
  const [isLoading, setIsLoading] = useState(false)
  const [isPDFLoading, setIsPDFLoading] = useState(false)
  const [formattedReport, setFormattedReport] = useState<FormattedReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFormSubmit = async (data: {
    rawInput: string
    operatorName: string
    section: string
    photos: File[]
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      const today = new Date().toISOString().split('T')[0]
      const report = await formatReportWithAI(data.rawInput, reportType, today)

      // 担当者情報を上書き（入力があれば）
      if (data.operatorName) report.operatorName = data.operatorName
      if (data.section) report.section = data.section

      // Supabaseに保存（設定済みの場合）
      try {
        const { data: savedReport } = await supabase
          .from('reports')
          .insert({
            report_type: reportType,
            raw_input: data.rawInput,
            formatted_content: JSON.stringify(report),
            report_date: report.reportDate || today,
            operator_name: data.operatorName || null,
            section: data.section || null,
            status: 'completed',
            photo_urls: [],
          })
          .select()
          .single()

        // 写真をアップロード
        if (savedReport && data.photos.length > 0) {
          const photoUrls: string[] = []
          for (const photo of data.photos) {
            const formData = new FormData()
            formData.append('file', photo)
            formData.append('reportId', savedReport.id)

            const res = await fetch('/api/upload-photo', {
              method: 'POST',
              body: formData,
            })
            if (res.ok) {
              const { url } = await res.json()
              photoUrls.push(url)
            }
          }

          if (photoUrls.length > 0) {
            await supabase
              .from('reports')
              .update({ photo_urls: photoUrls })
              .eq('id', savedReport.id)
          }
        }
      } catch (dbError) {
        // Supabase未設定の場合はスキップ（ローカル動作を継続）
        console.warn('Supabase save skipped (not configured):', dbError)
      }

      setFormattedReport(report)
      setStep('preview')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!formattedReport) return
    setIsPDFLoading(true)
    try {
      await generatePDF(formattedReport)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'PDF生成に失敗しました'
      setError(message)
    } finally {
      setIsPDFLoading(false)
    }
  }

  const handleReset = () => {
    setStep('input')
    setFormattedReport(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 px-4 py-5 pb-8 max-w-2xl mx-auto w-full">
        {/* エラー表示 */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-red-700">エラーが発生しました</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        )}

        {step === 'input' && (
          <>
            {/* レポートタイプ選択 */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                報告書の種類
              </p>
              <ReportTypeSelector value={reportType} onChange={setReportType} />
            </div>

            {/* 入力フォーム */}
            <InputForm
              reportType={reportType}
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
            />
          </>
        )}

        {step === 'preview' && formattedReport && (
          <ReportPreview
            report={formattedReport}
            onDownloadPDF={handleDownloadPDF}
            onReset={handleReset}
            isPDFLoading={isPDFLoading}
          />
        )}
      </main>
    </div>
  )
}
