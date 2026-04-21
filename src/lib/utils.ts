import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const avatarColors = [
  { bg: 'bg-primary-container', text: 'text-primary' },
  { bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
  { bg: 'bg-tertiary-container', text: 'text-on-tertiary-container' },
  { bg: 'bg-emerald-container', text: 'text-on-emerald-container' },
  { bg: 'bg-amber-container', text: 'text-on-amber-container' },
  { bg: 'bg-rose-container', text: 'text-on-rose-container' },
  { bg: 'bg-surface-variant', text: 'text-primary' },
] as const;

export function getAvatarColor(identifier: string, forceIndex?: number) {
  if (forceIndex !== undefined && forceIndex >= 0 && forceIndex < avatarColors.length) {
    return avatarColors[forceIndex];
  }
  let hash = 0;
  const str = identifier.toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
}

export function getInitials(name: string) {
  if (!name) return '?';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length > 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts.map(n => n[0]).join('').toUpperCase();
}

export const bannerGradients = [
  'from-primary to-primary-container',
  'from-secondary to-secondary-container',
  'from-tertiary to-tertiary-container',
  'from-emerald-500 to-emerald-200',
  'from-amber-500 to-amber-200',
  'from-rose-500 to-rose-200',
  'from-slate-500 to-slate-200',
] as const;
