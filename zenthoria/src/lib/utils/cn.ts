import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Función de utilidad para combinar clases de Tailwind CSS
 * Combina clsx y tailwind-merge para un manejo óptimo de clases
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}