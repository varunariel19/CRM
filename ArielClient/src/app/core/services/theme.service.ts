import { Injectable, signal, computed, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  private readonly _theme = signal<Theme>(this.getSavedTheme());

  readonly theme   = this._theme.asReadonly();
  readonly isDark  = computed(() => this._theme() === 'dark');
  readonly isLight = computed(() => this._theme() === 'light');

  constructor() {
    effect(() => {
      this.applyTheme(this._theme());
    });
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
    localStorage.setItem('app-theme', theme);
  }

  toggleTheme(): void {
    this.setTheme(this.isDark() ? 'light' : 'dark');
  }

  private applyTheme(theme: Theme): void {
    const body = document.body;
    body.classList.remove('theme-light', 'theme-dark');
    body.classList.add(`theme-${theme}`);
  }

  private getSavedTheme(): Theme {
    const saved = localStorage.getItem('app-theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
}