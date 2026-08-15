/**
 * Theme configuration
 * Centralized styling constants for consistent UI
 */

export { COLORS } from './colors.js';

export const TOAST_STYLES = {
  error: {
    background: '#1e293b',
    color: '#fca5a5',
    border: '1px solid #ef4444',
    borderRadius: '0.5rem',
    padding: '1rem',
  },
  success: {
    background: '#1e293b',
    color: '#86efac',
    border: '1px solid #22c55e',
    borderRadius: '0.5rem',
    padding: '1rem',
  },
  info: {
    background: '#1e293b',
    color: '#93c5fd',
    border: '1px solid #3b82f6',
    borderRadius: '0.5rem',
    padding: '1rem',
  },
  warning: {
    background: '#1e293b',
    color: '#fcd34d',
    border: '1px solid #f59e0b',
    borderRadius: '0.5rem',
    padding: '1rem',
  },
} as const;

export const ICON_THEME = {
  error: {
    primary: '#ef4444',
    secondary: '#ffffff',
  },
  success: {
    primary: '#22c55e',
    secondary: '#ffffff',
  },
  info: {
    primary: '#3b82f6',
    secondary: '#ffffff',
  },
  warning: {
    primary: '#f59e0b',
    secondary: '#ffffff',
  },
} as const;

export const GRADIENT_CLASSES = {
  primary: 'bg-gradient-to-br from-blue-500 to-cyan-500',
  secondary: 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900',
  text: 'bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent',
} as const;
