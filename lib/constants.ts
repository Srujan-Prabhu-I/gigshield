export const PLATFORMS = [
  { id: "swiggy", name: "Swiggy", avgDeliveries: 22, avgPayPerDelivery: 30 },
  { id: "zomato", name: "Zomato", avgDeliveries: 20, avgPayPerDelivery: 27 },
  { id: "ola", name: "Ola", avgKmPerDay: 150, avgPayPerKm: 10 },
  { id: "uber", name: "Uber", avgKmPerDay: 140, avgPayPerKm: 11 },
  { id: "rapido", name: "Rapido", avgKmPerDay: 120, avgPayPerKm: 7.5 },
  { id: "urban_company", name: "Urban Company", avgJobsPerDay: 5, avgPayPerJob: 300 },
]

export const TELANGANA_MIN_WAGE = {
  unskilled: { monthly: 17494, daily: 672, hourly: 84 },
  semi_skilled: { monthly: 19285, daily: 741, hourly: 93 },
  skilled: { monthly: 21259, daily: 817, hourly: 102 },
  gig_worker_category: "semi_skilled",
}

export const CITIES = [
  "Hyderabad", "Warangal", "Nizamabad", "Karimnagar",
  "Khammam", "Ramagundam", "Secunderabad"
]

export const LANGUAGES = [
  { code: "en", label: "EN", full: "English" },
  { code: "hi", label: "HI", full: "Hindi" },
  { code: "te", label: "TE", full: "Telugu" },
]
