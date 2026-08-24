'use client';

const storageKey = 'bidly-theme';

function currentTheme() {
  return document.documentElement.dataset['theme'] === 'dark' ? 'dark' : 'light';
}

export function ThemeToggle() {
  function toggleTheme() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset['theme'] = next;
    document.documentElement.style.colorScheme = next;
    window.localStorage.setItem(storageKey, next);
  }

  return (
    <button
      aria-label="Переключить светлую и тёмную тему"
      className="bidly-theme-toggle"
      onClick={toggleTheme}
      title="Переключить светлую и тёмную тему"
      type="button"
    >
      <span aria-hidden="true" className="bidly-theme-toggle__mode bidly-theme-toggle__mode--light">
        <span className="bidly-theme-toggle__icon">☀</span>
        <span>Светлая</span>
      </span>
      <span aria-hidden="true" className="bidly-theme-toggle__mode bidly-theme-toggle__mode--dark">
        <span className="bidly-theme-toggle__icon">☾</span>
        <span>Тёмная</span>
      </span>
    </button>
  );
}
