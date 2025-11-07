
function themeChange() {
  try {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');

    if (theme === 'light') {
      document.write('<body class="light-mode">');
    } else {
      document.write('<body>');
    }
    document.write('<meta name="color-scheme" content="light dark">');
  } catch (e) {
    document.write('<body>');
  }
}

themeChange();





