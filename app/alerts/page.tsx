'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Bell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllAlerts } from '@/lib/queries'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAllAlerts().then(setAlerts).catch((reason) => setError(reason instanceof Error ? reason.message : 'تعذر تحميل التنبيهات.')).finally(() => setLoading(false))
  }, [])

  return <main dir="rtl" className="min-h-screen bg-background p-4 text-foreground sm:p-8"><div className="mx-auto flex max-w-5xl flex-col gap-6"><header className="flex items-center justify-between"><div><Link href="/" className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowRight className="size-4" /> العودة للوحة التحكم</Link><h1 className="text-3xl font-bold">كل التنبيهات</h1></div><Bell className="size-7 text-primary" /></header>{loading && <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">جارٍ تحميل التنبيهات...</div>}{error && <div className="rounded-xl border border-orange-500/30 bg-card p-6 text-center text-orange-400">{error}</div>}{!loading && !error && <Card><CardHeader><CardTitle>{alerts.length.toLocaleString('ar-LY')} تنبيه</CardTitle></CardHeader><CardContent className="grid gap-3">{alerts.map((item) => <article key={item.id} className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">{item.description || item.alert_type || 'تنبيه'}</h2><p className="mt-1 text-sm text-muted-foreground">{item.detected_object || 'غير محدد'} · {item.created_at ? new Date(item.created_at).toLocaleString('ar-LY') : 'وقت غير محدد'}</p></div><div className="flex items-center gap-2"><Badge variant="secondary">{item.severity || 'متوسط'}</Badge><Badge variant="outline">{item.status || 'جديد'}</Badge></div></article>)}{alerts.length === 0 && <p className="py-8 text-center text-muted-foreground">لا توجد تنبيهات حالياً.</p>}</CardContent></Card>}</div></main>
}
