import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely — same helper Harpia/shadcn components expect. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
