/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL de base de l'API Strapi (ex. http://localhost:1337/api). */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
