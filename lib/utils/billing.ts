export interface BillingResult {
  amount: number
  isProrated: boolean
  daysInPeriod: number
  totalDaysInMonth: number
}

export function calculateMonthlyBilling(
  joinDateStr: string,
  billingYear: number,
  billingMonth: number,
  ampereCount: number,
  amperePrice: number
): BillingResult {
  const totalDaysInMonth = new Date(billingYear, billingMonth, 0).getDate()
  const joinDate = new Date(joinDateStr)
  const joinYear = joinDate.getFullYear()
  const joinMonth = joinDate.getMonth() + 1
  const joinDay = joinDate.getDate()

  const isFirstMonth = joinYear === billingYear && joinMonth === billingMonth
  const isProrated = isFirstMonth && joinDay > 1

  if (isProrated) {
    const daysInPeriod = totalDaysInMonth - joinDay + 1
    const fullMonthly = ampereCount * amperePrice
    const amount = Math.round((fullMonthly * daysInPeriod) / totalDaysInMonth)
    return { amount, isProrated: true, daysInPeriod, totalDaysInMonth }
  }

  return {
    amount: ampereCount * amperePrice,
    isProrated: false,
    daysInPeriod: totalDaysInMonth,
    totalDaysInMonth,
  }
}

export function subscriberIsEligibleForMonth(
  joinDateStr: string,
  year: number,
  month: number
): boolean {
  const joinDate = new Date(joinDateStr)
  const monthEnd = new Date(year, month, 0)
  return joinDate <= monthEnd
}
