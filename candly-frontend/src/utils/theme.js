const THEME_STORAGE_KEY = 'candly-theme';

function resolveInitialTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }

  return 'dark';
}

function applyTheme(theme) {
  const resolved = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = resolved;
  localStorage.setItem(THEME_STORAGE_KEY, resolved);
  return resolved;
}

export { THEME_STORAGE_KEY, applyTheme, resolveInitialTheme };
