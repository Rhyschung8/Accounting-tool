// src/pwa.ts — service worker registration
// Guarded so it is a no-op under jsdom / test environments.

export function registerServiceWorker(): void {
  if (typeof navigator === 'undefined') return
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL // './' in this config
    navigator.serviceWorker
      .register(base + 'sw.js', { scope: base })
      .catch((err) => {
        console.warn('[PWA] Service worker registration failed:', err)
      })
  })
}
