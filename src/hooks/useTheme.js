import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'notes-app-theme';

function getSystemPrefersDark() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveTheme(mode) {
  if (mode === 'dark') return 'dark';
  if (mode === 'light') return 'light';
  return getSystemPrefersDark() ? 'dark' : 'light';
}

function applyTheme(resolved) {
  document.documentElement.setAttribute('data-theme', resolved);
}

export function useTheme() {
  const [mode, setModeState] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    } catch {
      // ignore
    }
    return 'system';
  });

  const [resolved, setResolved] = useState(() => resolveTheme(mode));

  const setMode = useCallback((newMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(THEME_KEY, newMode);
    } catch {
      // ignore
    }
  }, []);

  // Apply theme whenever mode changes
  useEffect(() => {
    const newResolved = resolveTheme(mode);
    setResolved(newResolved);
    applyTheme(newResolved);
  }, [mode]);

  // Listen for system preference changes when in system mode
  useEffect(() => {
    if (mode !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const newResolved = resolveTheme('system');
      setResolved(newResolved);
      applyTheme(newResolved);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  return { mode, resolved, setMode, isDark: resolved === 'dark' };
}
