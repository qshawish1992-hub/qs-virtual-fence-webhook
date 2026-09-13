const BASE_ID = 'apppVg5YKPWHBLynE'
const TABLES = { clients: 'tblEwnebVR2mGYjBu', alerts: 'tblhYuU1mb5Vpk4Fe', tasks: 'tbl489OTcCMilMDD4' } as const

type AirtableRecord = { id: string; fields: Record<string, unknown>; createdTime?: string }
export type DashboardData = { clients: AirtableRecord[]; alerts: AirtableRecord[]; tasks: AirtableRecord[]; chart: { day: string; alerts: number }[]; activeClients: number; revenue: number; alertsToday: number; pendingTasks: number }

async function getTable(tableId: string): Promise<AirtableRecord[]> {
  const token = process.env.AIRTABLE_TOKEN
  if (!token) throw new Error('AIRTABLE_TOKEN غير موجود. أضف Personal Access Token في إعدادات Vercel ثم أعد المحاولة.')
  const records: AirtableRecord[] = []
  let offset = ''
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${tableId}`)
    url.searchParams.set('pageSize', '100')
    if (offset) url.searchParams.set('offset', offset)
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 60 } })
    if (!response.ok) throw new Error(`تعذر الاتصال بـ Airtable (${response.status}). تحقق من التوكن وصلاحيات القاعدة.`)
    const data = await response.json() as { records: AirtableRecord[]; offset?: string }
    records.push(...data.records)
    offset = data.offset ?? ''
  } while (offset)
  return records
}

const value = (record: AirtableRecord, ...keys: string[]) => keys.map((key) => record.fields[key]).find((item) => item !== undefined && item !== null && item !== '')
const dateValue = (record: AirtableRecord) => { const raw = value(record, 'Timestamp', 'Due Date', 'Date'); return raw ? new Date(String(raw)) : null }

export async function getDashboardData(): Promise<DashboardData> {
  const [clients, alerts, tasks] = await Promise.all([getTable(TABLES.clients), getTable(TABLES.alerts), getTable(TABLES.tasks)])
  const active = clients.filter((r) => String(value(r, 'Status')).toLowerCase() === 'active')
  const today = new Date(); const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const alertsToday = alerts.filter((r) => { const date = dateValue(r); return date && date >= start }).length
  const chart = Array.from({ length: 7 }, (_, index) => { const day = new Date(today); day.setDate(today.getDate() - (6 - index)); const next = new Date(day); next.setDate(day.getDate() + 1); return { day: day.toLocaleDateString('ar-LY', { weekday: 'short' }), alerts: alerts.filter((r) => { const date = dateValue(r); return date && date >= day && date < next }).length } })
  const pending = tasks.filter((r) => String(value(r, 'Status')).toLowerCase() !== 'completed')
  const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7)
  const upcoming = pending.filter((r) => { const date = dateValue(r); return !date || date <= weekEnd })
  return { clients, alerts: alerts.slice().sort((a, b) => (dateValue(b)?.getTime() ?? 0) - (dateValue(a)?.getTime() ?? 0)).slice(0, 5), tasks: upcoming, chart, activeClients: active.length, revenue: active.reduce((sum, r) => sum + Number(value(r, 'Monthly Fee') ?? 0), 0), alertsToday, pendingTasks: pending.length }
}

export { value, dateValue }
export type { AirtableRecord }
