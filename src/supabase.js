import { createClient } from '@supabase/supabase-js'

const URL = 'https://uuftynthqsyyjiglntez.supabase.co'  // tu Project URL
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZnR5bnRocXN5eWppZ2xudGV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1Nzg0ODUsImV4cCI6MjA5NjE1NDQ4NX0.zjTJaMvSsidYf8gqXl3uUOGXrfPG1XBUWl4mpq_wo9w'                       // tu Publishable key

export const supabase = createClient(URL, KEY)

export async function getData(key) {
  const { data } = await supabase
    .from('porra_data')
    .select('value')
    .eq('key', key)
    .single()
  return data ? JSON.parse(data.value) : null
}

export async function setData(key, value) {
  await supabase
    .from('porra_data')
    .upsert({ key, value: JSON.stringify(value), updated_at: new Date() })
}