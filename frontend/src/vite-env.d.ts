/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_DEMO?: string;
  // Добавьте другие переменные окружения здесь
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}





