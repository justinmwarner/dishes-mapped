import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...values: Array<string | false | null | undefined>): string {
  const mergedClasses = clsx(values)
  return twMerge(mergedClasses)
}
