// src/pwa.ts — service worker registration
// Guarded so it is a no-op under jsdom / test environments.

export function registerServiceWorker(): void {
  if (typeof navigator === 'undefined') return
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch((err) => {
        console.warn('[PWA] Service worker registration failed:', err)
      })
  })
}
