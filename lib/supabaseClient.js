import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder-anon-key')

export const supabaseEnvError = !url || !key
  ? 'متغيرات Supabase غير موجودة. أضف NEXT_PUBLIC_SUPABASE_URL وNEXT_PUBLIC_SUPABASE_ANON_KEY إلى إعدادات البيئة ثم أعد المحاولة.'
  : null
