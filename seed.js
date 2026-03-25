import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Manual env parsing since standard Node.js doesn't auto-load .env.local
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

try {
  const envFile = fs.readFileSync('.env.local', 'utf8')
  envFile.split('\n').forEach(line => {
    const [key, ...value] = line.split('=')
    if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value.join('=').trim().replace(/['"]/g, '')
    if (key === 'SUPABASE_SERVICE_ROLE_KEY') supabaseKey = value.join('=').trim().replace(/['"]/g, '')
  })
} catch (e) {}

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE credentials.")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const DUMMY_DATA = [
  { platform: "Swiggy", city: "Hyderabad", orders_day: 18, hours_day: 11, monthly_pay: 14500, pay_per_hr: 52.6, deficit: 10450 },
  { platform: "Zomato", city: "Warangal", orders_day: 22, hours_day: 14, monthly_pay: 17000, pay_per_hr: 48.2, deficit: 15320 },
  { platform: "Ola", city: "Hyderabad", orders_day: 14, hours_day: 12, monthly_pay: 16000, pay_per_hr: 53.3, deficit: 11200 },
  { platform: "Uber", city: "Secunderabad", orders_day: 12, hours_day: 10, monthly_pay: 15000, pay_per_hr: 60.0, deficit: 8400 },
  { platform: "Rapido", city: "Karimnagar", orders_day: 25, hours_day: 13, monthly_pay: 13000, pay_per_hr: 33.3, deficit: 19800 },
  { platform: "Swiggy", city: "Khammam", orders_day: 15, hours_day: 9, monthly_pay: 12000, pay_per_hr: 53.3, deficit: 9200 },
  { platform: "Zomato", city: "Nizamabad", orders_day: 20, hours_day: 12, monthly_pay: 15500, pay_per_hr: 51.6, deficit: 11800 },
  { platform: "Urban Company", city: "Hyderabad", orders_day: 4, hours_day: 8, monthly_pay: 22000, pay_per_hr: 110.0, deficit: 0 }
]

async function seed() {
  console.log("Seeding dummy data to Supabase...")
  const { data, error } = await supabase.from('submissions').insert(DUMMY_DATA)
  
  if (error) {
    console.error("Error seeding data:", error)
  } else {
    console.log("Successfully seeded 8 realistic records. The dashboard is now fully active!")
  }
}

seed()
