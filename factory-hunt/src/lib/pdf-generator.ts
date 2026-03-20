import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FormattedReport } from './ai-formatter'

export async function generatePDF(report: FormattedReport): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15

  // ヘッダー背景
  const headerColor = report.reportType === 'daily' ? [30, 64, 175] : [234, 88, 12]
  doc.setFillColor(...(headerColor as [number, number, number]))
  doc.rect(0, 0, pageWidth, 40, 'F')

  // タイトルテキスト（英語表記でPDF文字化け回避）
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.text(report.reportType === 'daily' ? 'DAILY REPORT' : 'INCIDENT REPORT', margin, 13)

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  // jsPDFは日本語フォント非内蔵のため、タイトルはローマ字・英語で出力
  // 実運用ではカスタムフォント埋め込みを推奨
  const titleText = sanitizeForPDF(report.title)
  doc.text(titleText, margin, 24)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `Date: ${report.reportDate}  |  Operator: ${sanitizeForPDF(report.operatorName) || 'N/A'}  |  Section: ${sanitizeForPDF(report.section) || 'N/A'}`,
    margin,
    34
  )

  // 概要
  doc.setTextColor(50, 50, 50)
  let currentY = 50

  if (report.summary) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary / Overview', margin, currentY)
    currentY += 5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const summaryLines = doc.splitTextToSize(sanitizeForPDF(report.summary), pageWidth - margin * 2)
    doc.text(summaryLines, margin, currentY)
    currentY += summaryLines.length * 5 + 8
  }

  // 作業記録テーブル
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Work Records / Detail', margin, currentY)
  currentY += 5

  const tableData = report.items.map((item) => [
    item.time || '-',
    sanitizeForPDF(item.event),
    sanitizeForPDF(item.cause) || '-',
    sanitizeForPDF(item.action),
    sanitizeForPDF(item.result),
    item.severity === 'critical' ? 'CRITICAL' : item.severity === 'warning' ? 'WARNING' : 'NORMAL',
  ])

  autoTable(doc, {
    startY: currentY,
    head: [['Time', 'Event', 'Cause', 'Action Taken', 'Result', 'Status']],
    body: tableData,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: headerColor as [number, number, number],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 15 },
      5: { cellWidth: 20 },
    },
    didParseCell: (data) => {
      if (data.column.index === 5 && data.section === 'body') {
        const val = data.cell.raw as string
        if (val === 'CRITICAL') data.cell.styles.textColor = [220, 38, 38]
        else if (val === 'WARNING') data.cell.styles.textColor = [202, 138, 4]
        else data.cell.styles.textColor = [22, 163, 74]
      }
    },
  })

  // フッター
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `FACTORY-HUNT | Generated: ${new Date().toISOString().slice(0, 19).replace('T', ' ')} | Page ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    )
  }

  // ダウンロード
  const fileName = `${report.reportType === 'daily' ? 'daily-report' : 'incident-report'}_${report.reportDate}.pdf`
  doc.save(fileName)
}

// 日本語文字をASCII安全な文字列に変換（jsPDF日本語非対応の暫定対策）
function sanitizeForPDF(text: string): string {
  if (!text) return ''
  // 基本的な日本語→ローマ字変換は複雑なため、文字をそのまま渡す
  // jsPDFはUTF-8をサポートしているが日本語フォントが必要
  // 実運用では日本語フォント(NotoSansJP等)をBase64埋め込みを推奨
  return text
}
