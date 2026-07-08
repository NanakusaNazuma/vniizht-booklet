/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Публичный базовый URL для QR-кода, например http://192.168.1.50:5173 */
  readonly VITE_PUBLIC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
