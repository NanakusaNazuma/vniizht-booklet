/** Публичный адрес сайта (без слэша в конце). Задаётся при публикации. */
export function getSiteBase(): string {
  const env = import.meta.env.VITE_PUBLIC_URL;
  if (env) return env.replace(/\/$/, '');

  if (typeof window === 'undefined') return '';

  const saved = localStorage.getItem('vniizht_public_base');
  if (saved) return saved.replace(/\/$/, '');

  return window.location.origin;
}

/** Ссылка для QR — корень сайта (надёжнее /booklet на мобильном интернете). */
export function getBookletUrl(base?: string): string {
  const b = (base ?? getSiteBase()).replace(/\/$/, '');
  return `${b}/`;
}

export function isLocalHost(url: string) {
  return /localhost|127\.0\.0\.1/.test(url);
}

export function saveSiteBase(url: string) {
  if (!isLocalHost(url)) {
    localStorage.setItem('vniizht_public_base', url.replace(/\/$/, ''));
  }
}
