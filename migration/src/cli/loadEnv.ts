/** tsx doesn't auto-load .env.local like Next.js does — load it explicitly. */
export function loadEnv() {
  try {
    process.loadEnvFile(new URL('../../../.env.local', import.meta.url))
  } catch {
    // .env.local may not exist in every environment; env vars can also come from the shell.
  }
}
