import { TELANGANA_MIN_WAGE } from "./constants"

export interface WorkerInput {
  platform: string
  city: string
  ordersPerDay: number
  hoursPerDay: number
  monthlyPay: number
}

export interface CalculationResult {
  actualPayPerHour: number
  fairMinimumPerHour: number
  monthlyDeficit: number
  annualDeficit: number
  isUnderpaid: boolean
  deficitPercentage: number
  workingDaysPerMonth: number
  totalHoursPerMonth: number
}

export function calculateUnderpayment(input: WorkerInput): CalculationResult {
  const workingDaysPerMonth = 26
  const totalHoursPerMonth = input.hoursPerDay * workingDaysPerMonth
  
  // Gig Work Reality: Deduct 30% for fuel, bike maintenance, and phone data
  const fuelAndMaintenanceOverhead = 0.30 
  const netMonthlyPay = input.monthlyPay * (1 - fuelAndMaintenanceOverhead)

  const actualPayPerHour = netMonthlyPay / totalHoursPerMonth
  const fairMinimumPerHour = TELANGANA_MIN_WAGE.semi_skilled.hourly
  const fairMonthlyPay = fairMinimumPerHour * totalHoursPerMonth
  const monthlyDeficit = Math.max(0, fairMonthlyPay - netMonthlyPay)
  const annualDeficit = monthlyDeficit * 12
  const isUnderpaid = monthlyDeficit > 0
  const deficitPercentage = isUnderpaid
    ? Math.round((monthlyDeficit / fairMonthlyPay) * 100)
    : 0

  return {
    actualPayPerHour: Math.round(actualPayPerHour),
    fairMinimumPerHour,
    monthlyDeficit: Math.round(monthlyDeficit),
    annualDeficit: Math.round(annualDeficit),
    isUnderpaid,
    deficitPercentage,
    workingDaysPerMonth,
    totalHoursPerMonth,
  }
}
