import { beforeEach, describe, expect, it } from 'vitest';
import { THEME_STORAGE_KEY, applyTheme, resolveInitialTheme } from '../utils/theme';

describe('theme helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to dark when no theme preference is stored', () => {
    expect(resolveInitialTheme()).toBe('dark');
  });

  it('stores and applies the requested theme', () => {
    expect(applyTheme('light')).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });
});
