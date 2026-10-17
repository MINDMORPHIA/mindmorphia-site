/* Shared by the public site and protected portal. Runs before first paint. */
(() => {
  const root = document.documentElement;
  const key = 'sauvid-appearance';
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try { const saved = localStorage.getItem(key); if (saved === 'light' || saved === 'dark') preference = saved; } catch {}
  function apply(theme) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.setAttribute('aria-label', 'Tema escuro');
      button.title = theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro';
      button.textContent = theme === 'dark' ? '☀ Claro' : '☾ Escuro';
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0b1c2a' : '#f7fafc';
  }
  apply(preference || (system.matches ? 'dark' : 'light'));
  system.addEventListener('change', () => { if (!preference) apply(system.matches ? 'dark' : 'light'); });
  window.addEventListener('storage', event => {
    if (event.key !== key) return;
    preference = ['light', 'dark'].includes(event.newValue) ? event.newValue : null;
    apply(preference || (system.matches ? 'dark' : 'light'));
  });
  document.addEventListener('DOMContentLoaded', () => {
    apply(root.dataset.theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(button => button.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, preference); } catch {}
      apply(preference);
    }));
    const header = document.querySelector('body > header');
    const measure = () => root.style.setProperty('--header-offset', `${header.getBoundingClientRect().height + 16}px`);
    if (header) { measure(); new ResizeObserver(measure).observe(header); }
    const menu = document.getElementById('mobileMenu');
    const toggle = document.getElementById('mobileToggle');
    if (menu && toggle) {
      toggle.setAttribute('aria-controls', menu.id);
      const close = () => { menu.classList.remove('show'); toggle.setAttribute('aria-expanded', 'false'); measure(); };
      menu.querySelectorAll('a,button').forEach(link => link.addEventListener('click', close));
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && menu.classList.contains('show')) { close(); toggle.focus(); }
      });
      document.querySelectorAll('a[href="#inicio"]').forEach(link => link.addEventListener('click', close));
      window.matchMedia('(min-width: 1151px)').addEventListener('change', event => { if (event.matches) close(); });
    }
  });
})();
