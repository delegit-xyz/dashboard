export interface DaysHoursMinutesSeconds {
  d: number
  h: number
  m: number
  s: number
}
export function convertMiliseconds(
  miliseconds: number,
): DaysHoursMinutesSeconds {
  let days = 0
  let hours = 0
  let minutes = 0
  let seconds = 0
  let total_hours = 0
  let total_minutes = 0
  let total_seconds = 0

  total_seconds = Math.floor(miliseconds / 1000)
  total_minutes = Math.floor(total_seconds / 60)
  total_hours = Math.floor(total_minutes / 60)
  days = Math.floor(total_hours / 24)

  seconds = total_seconds % 60
  minutes = total_minutes % 60
  hours = total_hours % 24

  return { d: days, h: hours, m: minutes, s: seconds }
}

export const displayRemainingTime = ({
  d,
  h,
  m,
  s,
}: DaysHoursMinutesSeconds) => {
  if (d > 0) {
    return `${d} days ${h}h`
  }

  if (d === 0 && h > 0) {
    return `${h}h ${m}min`
  }

  if (d === 0 && h === 0 && m > 0) {
    return `${m}min ${s}s`
  }

  if (d === 0 && h === 0 && m === 0 && s > 0) {
    return `${s}s`
  }

  return `${d} days ${h}h ${m}min ${s}s`
}
