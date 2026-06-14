'use client'

import { useState } from 'react'
import { formatCurrency, formatMonthYear } from '@/lib/utils/format'

export interface PaymentExportRow {
  subscriberName: string
  phone: string | null
  ampere: number
  amount: number
  isPaid: boolean
  isProrated: boolean
  daysInPeriod?: number | null
  totalDaysInMonth?: number | null
}

interface Props {
  rows: PaymentExportRow[]
  month: number
  year: number
  generatorName?: string | null
  totalExpected: number
  totalPaid: number
  totalUnpaid: number
  paidCount: number
  unpaidCount: number
}

export function ExportButton({
  rows, month, year, generatorName,
  totalExpected, totalPaid, totalUnpaid, paidCount, unpaidCount,
}: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<'pdf' | 'excel' | null>(null)

  const monthYear = formatMonthYear(month, year)
  const collectionRate = rows.length > 0 ? Math.round((paidCount / rows.length) * 100) : 0
  const fileName = `دفعات-${year}-${String(month).padStart(2, '0')}`

  // ── PDF via browser print window ──────────────────────────────
  function handlePDF() {
    setLoading('pdf')

    const rowsHtml = rows.map((row, i) => `
      <tr>
        <td style="text-align:center;color:#94a3b8">${i + 1}</td>
        <td>${row.subscriberName}</td>
        <td style="direction:ltr;text-align:center">${row.phone ?? '—'}</td>
        <td style="text-align:center;font-weight:600;color:#b45309">${row.ampere} A</td>
        <td style="text-align:center;font-weight:700">${formatCurrency(row.amount)}</td>
        <td style="text-align:center;font-weight:600;color:${row.isPaid ? '#059669' : '#dc2626'}">
          ${row.isPaid ? '✓ مدفوع' : '✗ غير مدفوع'}
        </td>
        <td style="text-align:center;font-size:11px;color:#64748b">
          ${row.isProrated ? `مقسّط · ${row.daysInPeriod}/${row.totalDaysInMonth} يوم` : 'شهر كامل'}
        </td>
      </tr>
    `).join('')

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${fileName}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI',Tahoma,Arial,sans-serif; direction:rtl; color:#1e293b; padding:28px; font-size:13px; }
    .top { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #2563eb; padding-bottom:14px; margin-bottom:18px; }
    .top h1 { font-size:18px; font-weight:700; color:#0f172a; }
    .top p { font-size:11px; color:#94a3b8; margin-top:4px; }
    .badge { background:#eff6ff; color:#2563eb; font-size:11px; font-weight:600; padding:4px 10px; border-radius:20px; border:1px solid #bfdbfe; }
    .summary { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:18px; }
    .card { border:1px solid #e2e8f0; border-radius:10px; padding:10px 14px; text-align:center; }
    .card .lbl { font-size:10px; color:#94a3b8; margin-bottom:3px; }
    .card .val { font-size:15px; font-weight:700; }
    .c1 .val { color:#1e293b; } .c2 .val { color:#059669; } .c3 .val { color:#dc2626; } .c4 .val { color:#2563eb; }
    .sub-val { font-size:10px; color:#94a3b8; margin-top:2px; }
    table { width:100%; border-collapse:collapse; font-size:12px; }
    thead tr { background:#f8fafc; }
    th { border:1px solid #e2e8f0; padding:8px 10px; font-weight:600; color:#64748b; text-align:right; font-size:11px; }
    td { border:1px solid #e2e8f0; padding:8px 10px; }
    tr:nth-child(even) td { background:#f8fafc; }
    .footer { margin-top:16px; text-align:center; color:#94a3b8; font-size:10px; }
    @media print { @page { margin:15mm; } }
  </style>
</head>
<body>
  <div class="top">
    <div>
      <h1>كشف دفعات ${monthYear}${generatorName ? ' — ' + generatorName : ''}</h1>
      <p>تاريخ الإصدار: ${new Date().toLocaleDateString('ar-IQ')} · ${rows.length} مشترك</p>
    </div>
    <span class="badge">⚡ نظام المولدات</span>
  </div>
  <div class="summary">
    <div class="card c1"><div class="lbl">الإجمالي المتوقع</div><div class="val">${formatCurrency(totalExpected)}</div><div class="sub-val">${rows.length} مشترك</div></div>
    <div class="card c2"><div class="lbl">تم التحصيل</div><div class="val">${formatCurrency(totalPaid)}</div><div class="sub-val">${paidCount} مشترك</div></div>
    <div class="card c3"><div class="lbl">المتبقي</div><div class="val">${formatCurrency(totalUnpaid)}</div><div class="sub-val">${unpaidCount} مشترك</div></div>
    <div class="card c4"><div class="lbl">نسبة التحصيل</div><div class="val">${collectionRate}%</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:36px;text-align:center">#</th>
        <th>اسم المشترك</th>
        <th style="text-align:center">الهاتف</th>
        <th style="text-align:center">الأمبير</th>
        <th style="text-align:center">المبلغ</th>
        <th style="text-align:center">الحالة</th>
        <th style="text-align:center">نوع الفاتورة</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  <div class="footer">نظام إدارة اشتراكات المولدات الكهربائية · ${monthYear}</div>
  <script>window.onload = function(){ window.print() }</script>
</body>
</html>`

    const win = window.open('', '_blank', 'width=960,height=700')
    if (win) {
      win.document.write(html)
      win.document.close()
    }
    setLoading(null)
    setOpen(false)
  }

  // ── Excel via SheetJS ─────────────────────────────────────────
  async function handleExcel() {
    setLoading('excel')
    try {
      const XLSX = await import('xlsx')

      const header = ['#', 'اسم المشترك', 'رقم الهاتف', 'الأمبير (A)', 'المبلغ (د.ع)', 'الحالة', 'نوع الفاتورة']
      const data = rows.map((row, i) => [
        i + 1,
        row.subscriberName,
        row.phone ?? '',
        row.ampere,
        row.amount,
        row.isPaid ? 'مدفوع' : 'غير مدفوع',
        row.isProrated ? `مقسّط (${row.daysInPeriod}/${row.totalDaysInMonth} يوم)` : 'شهر كامل',
      ])

      const summary = [
        [],
        ['الملخص'],
        ['الإجمالي المتوقع (د.ع)', '', '', '', totalExpected],
        ['تم التحصيل (د.ع)', '', '', '', totalPaid],
        ['المتبقي (د.ع)', '', '', '', totalUnpaid],
        ['عدد المدفوعين', '', '', '', paidCount],
        ['عدد غير المدفوعين', '', '', '', unpaidCount],
        ['نسبة التحصيل', '', '', '', `${collectionRate}%`],
      ]

      const wsData = [header, ...data, ...summary]
      const ws = XLSX.utils.aoa_to_sheet(wsData)
      ws['!cols'] = [
        { wch: 5 }, { wch: 30 }, { wch: 18 }, { wch: 12 },
        { wch: 18 }, { wch: 14 }, { wch: 26 },
      ]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, monthYear)
      XLSX.writeFile(wb, `${fileName}.xlsx`)
    } finally {
      setLoading(null)
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-4 py-2.5 rounded-xl text-sm shadow-sm transition-colors"
      >
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0-3-3m3 3 3-3M3 17v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3" />
        </svg>
        تصدير
        <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden py-1">
            <button
              onClick={handlePDF}
              disabled={loading !== null}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 0 0 2-2V9.414a1 1 0 0 0-.293-.707l-5.414-5.414A1 1 0 0 0 12.586 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z"/>
                </svg>
              </div>
              <div className="text-right flex-1">
                <p className="font-semibold text-slate-800">
                  {loading === 'pdf' ? 'جاري التحضير...' : 'تصدير PDF'}
                </p>
                <p className="text-xs text-slate-400">طباعة أو حفظ كـ PDF</p>
              </div>
            </button>

            <div className="mx-4 border-t border-slate-100" />

            <button
              onClick={handleExcel}
              disabled={loading !== null}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/>
                </svg>
              </div>
              <div className="text-right flex-1">
                <p className="font-semibold text-slate-800">
                  {loading === 'excel' ? 'جاري التنزيل...' : 'تصدير Excel'}
                </p>
                <p className="text-xs text-slate-400">ملف .xlsx جاهز للتعديل</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
