import { TELANGANA_MIN_WAGE } from "./constants"

export interface WorkerInput {
  platform: string
  city: string
  ordersPerDay: number
  hoursPerDay: number
  monthlyPay: number
}

export interface CalculationResult {
  hourly_wage: number
  expected_min: number
  deficit: number
  status: string
  deficitPercentage: number
}

export function calculateUnderpayment(input: WorkerInput): CalculationResult {
  const hourly_wage = Math.round(input.monthlyPay / (input.hoursPerDay * 26))
  const expected_min = 93 * input.hoursPerDay * 26
  let deficit = expected_min - input.monthlyPay

  if (deficit < 0) {
    deficit = 0
  }

  let status = "Fair"
  if (hourly_wage >= 93) {
    status = "Fair"
  } else if (hourly_wage >= 70) {
    status = "Moderate Exploitation"
  } else {
    status = "Severe Exploitation"
  }

  const deficitPercentage = deficit > 0
    ? Math.round((deficit / expected_min) * 100)
    : 0

  return {
    hourly_wage,
    expected_min,
    deficit,
    status,
    deficitPercentage,
  }
}
