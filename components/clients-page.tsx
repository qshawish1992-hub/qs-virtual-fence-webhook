'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Building2, Plus, Search, UserRound, X, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createOrganization, getOrganizations } from '@/lib/queries'

type Organization = Record<string, unknown> & { id: string }

const text = (value: unknown, fallback = '—') => String(value ?? fallback)

export default function ClientsPage() {
  const [clients, setClients] = useState<Organization[]>([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Organization | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'مطعم', package: 'أساسي' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getOrganizations().then(rows => setClients(rows as Organization[])).catch(error => setError(error instanceof Error ? error.message : 'تعذر تحميل العملاء.')).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => clients.filter(client => `${client.name ?? ''} ${client.type ?? ''}`.toLowerCase().includes(query.toLowerCase())), [clients, query])
  const saveClient = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.name.trim()) return
    setSaving(true); setError('')
    try {
      const created = await createOrganization({ name: form.name.trim(), type: form.type, package: form.package, status: 'active' })
      setClients(current => [created as Organization, ...current]); setShowAdd(false); setForm({ name: '', type: 'مطعم', package: 'أساسي' })
    } catch (error) { setError(error instanceof Error ? error.message : 'تعذر إضافة العميل.') } finally { setSaving(false) }
  }

  return <main dir="rtl" className="min-h-screen bg-background p-4 text-foreground sm:p-8"><div className="mx-auto flex max-w-[1500px] flex-col gap-6">
    <header className="flex items-center justify-between border-b border-border pb-5"><Link href="/" className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Zap className="size-5" /></div><span className="text-xl font-bold">QS Automate Manager</span></Link><UserRound className="size-5 text-muted-foreground" /></header>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground"><ArrowRight className="size-4" /> لوحة التحكم</Link><h1 className="mt-2 text-3xl font-bold">العملاء</h1><p className="mt-1 text-sm text-muted-foreground">بيانات العملاء المباشرة من Supabase</p></div><Button onClick={() => setShowAdd(true)}><Plus data-icon="inline-start" /> إضافة عميل جديد</Button></div>
    {error && <div role="alert" className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-orange-300">{error}</div>}
    {loading ? <div className="rounded-xl border border-border p-8 text-center text-muted-foreground">جارٍ تحميل العملاء...</div> : <Card><CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><CardTitle>قائمة العملاء ({clients.length})</CardTitle><div className="flex items-center gap-2"><Search className="size-4 text-muted-foreground" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="ابحث عن عميل" aria-label="البحث عن عميل" className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary" /></div></CardHeader><CardContent className="overflow-x-auto"><table className="w-full text-right text-sm"><thead><tr className="border-b border-border text-muted-foreground"><th className="p-3">العميل</th><th className="p-3">النوع</th><th className="p-3">الحالة</th><th className="p-3">الباقة</th><th className="p-3">الرسوم الشهرية</th></tr></thead><tbody>{filtered.map(client => <tr key={client.id} onClick={() => setSelected(client)} className="cursor-pointer border-b border-border hover:bg-muted/40"><td className="p-3"><div className="flex items-center gap-3"><Avatar><AvatarFallback><Building2 /></AvatarFallback></Avatar><span className="font-medium">{text(client.name, 'عميل بدون اسم')}</span></div></td><td className="p-3">{text(client.type)}</td><td className="p-3"><Badge variant={String(client.status).toLowerCase() === 'active' ? 'default' : 'secondary'}>{text(client.status)}</Badge></td><td className="p-3">{text(client.package)}</td><td className="p-3">{Number(client.monthly_fee || 0).toLocaleString('ar-LY')} د.ل</td></tr>)}</tbody></table></CardContent></Card>}
    {showAdd && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><form onSubmit={saveClient} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">إضافة عميل جديد</h2><button type="button" aria-label="إغلاق" onClick={() => setShowAdd(false)}><X /></button></div><div className="mt-5 flex flex-col gap-4"><input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="اسم العميل" className="h-10 rounded-md border border-border bg-background px-3" /><input value={form.type} onChange={event => setForm({ ...form, type: event.target.value })} placeholder="النوع" className="h-10 rounded-md border border-border bg-background px-3" /><input value={form.package} onChange={event => setForm({ ...form, package: event.target.value })} placeholder="الباقة" className="h-10 rounded-md border border-border bg-background px-3" /><Button type="submit" disabled={saving}>{saving ? 'جارٍ الحفظ...' : 'حفظ العميل'}</Button></div></form></div>}
    {selected && <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}><div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6" onClick={event => event.stopPropagation()}><div className="flex items-center justify-between"><h2 className="text-xl font-bold">{text(selected.name)}</h2><button aria-label="إغلاق" onClick={() => setSelected(null)}><X /></button></div><p className="mt-4 text-muted-foreground">{text(selected.type)} · {text(selected.package)} · {text(selected.status)}</p></div></div>}
  </div></main>
}
