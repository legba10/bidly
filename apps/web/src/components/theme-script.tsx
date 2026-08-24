const themeScript = `(() => {
  const storageKey = 'bidly-theme';
  const storedTheme = window.localStorage.getItem(storageKey);
  const theme = storedTheme === 'light' || storedTheme === 'dark'
    ? storedTheme
    : window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();`;

/** Runs in the document head before the first paint to prevent a theme flash. */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
