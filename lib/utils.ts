import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCompactNumber(number: number): string {
  if (isNaN(number)) return "0"

  if (number < 1000) {
    return number.toString()
  } else if (number < 1000000) {
    return (number / 1000).toFixed(1).replace(/\.0$/, "") + "K"
  } else if (number < 1000000000) {
    return (number / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
  } else {
    return (number / 1000000000).toFixed(1).replace(/\.0$/, "") + "B"
  }
}

