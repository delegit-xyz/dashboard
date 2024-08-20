/* eslint-disable react-refresh/only-export-components */
export const THRESHOLD = BigInt(500)
export const DEFAULT_TIME = BigInt(6000)
export const ONE_DAY = BigInt(24 * 60 * 60 * 1000)

export const lockPeriod: Record<string, number> = {
  None: 0,
  Locked1x: 1,
  Locked2x: 2,
  Locked3x: 4,
  Locked4x: 8,
  Locked5x: 16,
  Locked6x: 32,
}
