'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { Bell, CircleDollarSign, ClipboardList, Ellipsis, Users, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { getAlerts, getOrganizations, getSubscriptions } from '@/lib/queries'

const dateOf = (item) => item?.created_at ? new Date(item.created_at) : new Date(0)
const money = (value) => `${Number(value || 0).toLocaleString('ar-LY')} د.ل`

export function Dashboard() {
  const [organizations, setOrganizations] = useState([])
  const [alerts, setAlerts] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    Promise.all([getOrganizations(), getAlerts(100), getSubscriptions()])
      .then(([orgs, rows, subs]) => {
        if (!mounted) return
        setOrganizations(orgs); setAlerts(rows); setSubscriptions(subs)
      })
      .catch((reason) => mounted && setError(reason instanceof Error ? reason.message : 'تعذر الاتصال بقاعدة البيانات.'))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  const chart = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const day = new Date(); day.setHours(0, 0, 0, 0); day.setDate(day.getDate() - (6 - index))
    const next = new Date(day); next.setDate(day.getDate() + 1)
    return { day: day.toLocaleDateString('ar-LY', { weekday: 'short' }), alerts: alerts.filter((item) => dateOf(item) >= day && dateOf(item) < next).length }
  }), [alerts])

  if (loading) return <main dir="rtl" className="flex min-h-screen items-center justify-center bg-background p-6 text-muted-foreground">جارٍ تحميل بيانات Supabase...</main>
  if (error) return <main dir="rtl" className="flex min-h-screen items-center justify-center bg-background p-6"><div className="rounded-2xl border border-orange-500/30 bg-card p-6 text-center"><h1 className="text-xl font-bold text-orange-400">تعذر تحميل لوحة التحكم</h1><p className="mt-3 text-sm text-muted-foreground">{error}</p></div></main>

  const start = new Date(); start.setHours(0, 0, 0, 0)
  const stats = [
    [Users, 'العملاء النشطون', organizations.filter((item) => String(item.status).toLowerCase() === 'active').length.toLocaleString('ar-LY')],
    [CircleDollarSign, 'الإيرادات الشهرية', money(subscriptions.reduce((sum, item) => sum + Number(item.monthly_fee || 0), 0))],
    [Bell, 'التنبيهات اليوم', alerts.filter((item) => dateOf(item) >= start).length.toLocaleString('ar-LY')],
    [ClipboardList, 'المهام المعلقة', '—'],
  ]

  return <main dir="rtl" className="min-h-screen bg-background p-4 text-foreground sm:p-8"><div className="mx-auto flex max-w-[1500px] flex-col gap-6">
    <header className="relative flex items-center justify-between border-b border-border pb-5"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Zap className="size-5" /></div><div><h1 className="text-xl font-bold">QS Automate Manager</h1><p className="text-xs text-muted-foreground">بيانات مباشرة من Supabase</p></div></div><div className="flex items-center gap-4"><Link href="/clients" className="text-sm text-muted-foreground hover:text-foreground">العملاء</Link><button type="button" aria-label="فتح القائمة" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Ellipsis className="size-5" /></button>{menuOpen && <div className="absolute left-0 top-12 z-10 flex min-w-44 flex-col gap-1 rounded-xl border border-border bg-card p-2 shadow-xl"><Link href="/clients" className="rounded-lg px-3 py-2 text-sm hover:bg-muted">إدارة العملاء</Link><Link href="/alerts" className="rounded-lg px-3 py-2 text-sm hover:bg-muted">كل التنبيهات</Link></div>}</div></header>
    <section><p className="text-sm text-orange-400">ملخص العمليات</p><h2 className="text-3xl font-bold">لوحة التحكم</h2></section>
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">{stats.map(([Icon, title, number]) => <Card key={title}><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{title}</p><p className="mt-2 text-2xl font-bold">{number}</p></div><Icon className="size-5 text-primary" /></CardContent></Card>)}</section>
    <Card><CardHeader><CardTitle>التنبيهات خلال آخر 7 أيام</CardTitle></CardHeader><CardContent><ChartContainer config={{ alerts: { label: 'التنبيهات', color: 'var(--chart-1)' } }} className="h-64 w-full"><BarChart data={chart}><CartesianGrid vertical={false} /><XAxis dataKey="day" tickLine={false} axisLine={false} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="alerts" fill="var(--color-alerts)" radius={6} /></BarChart></ChartContainer></CardContent></Card>
    <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>آخر التنبيهات</CardTitle><Link href="/alerts" className="text-sm text-primary hover:underline">عرض كل التنبيهات</Link></CardHeader><CardContent className="grid gap-3">{alerts.slice(0, 5).map((item) => <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3"><div><p className="font-medium">{item.description || item.alert_type || 'تنبيه'}</p><p className="text-xs text-muted-foreground">{dateOf(item).toLocaleString('ar-LY')}</p></div><span className="rounded-full bg-orange-500/15 px-2 py-1 text-xs text-orange-400">{item.severity || 'متوسط'}</span></div>)}</CardContent></Card>
  </div></main>
}

export default Dashboard
