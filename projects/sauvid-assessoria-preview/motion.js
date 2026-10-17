(() => {
  const button = document.querySelector('[data-motion-toggle]');
  if (!button) return;
  button.addEventListener('click', () => {
    const paused = document.documentElement.dataset.motion !== 'paused';
    document.documentElement.dataset.motion = paused ? 'paused' : 'running';
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? '▶ Retomar movimento' : 'Ⅱ Pausar movimento';
  });
})();
