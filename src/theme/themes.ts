export type ThemeMode = 'dark' | 'light';

export type AppColors = {
  background: string;
  surface: string;
  surface2: string;
  card: string;
  text: string;
  muted: string;
  primary: string;
  primary2: string;
  border: string;
  danger: string;
  success: string;
  tab: string;
  shadow: string;
};

export const darkColors: AppColors = {
  background: '#0f172a',
  surface: '#111827',
  surface2: '#1f2937',
  card: '#111827',
  text: '#f9fafb',
  muted: '#9ca3af',
  primary: '#f97316',
  primary2: '#fb923c',
  border: '#334155',
  danger: '#ef4444',
  success: '#22c55e',
  tab: '#020617',
  shadow: '#000000',
};

export const lightColors: AppColors = {
  background: '#fff7ed',
  surface: '#ffffff',
  surface2: '#ffedd5',
  card: '#ffffff',
  text: '#111827',
  muted: '#6b7280',
  primary: '#ea580c',
  primary2: '#f97316',
  border: '#fed7aa',
  danger: '#dc2626',
  success: '#16a34a',
  tab: '#ffffff',
  shadow: '#9a3412',
};

export function getThemeColors(mode: ThemeMode) {
  return mode === 'dark' ? darkColors : lightColors;
}
