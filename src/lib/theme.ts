export const themeStorageKey = 'oro-theme'

// Runs synchronously in the head, before styles, to avoid a flash of the wrong theme.
export const themeBootstrap = `(() => {
  try {
    const theme = localStorage.getItem('${themeStorageKey}');
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.dataset.theme = theme;
      document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
        meta.content = theme === 'dark' ? '#11100F' : '#FAF8F4';
      });
    }
  } catch {}
})();`
