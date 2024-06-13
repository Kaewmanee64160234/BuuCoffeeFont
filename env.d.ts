/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_URL_PORT: string;
    // Add other environment variables here
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }