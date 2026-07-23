/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ya es el valor por defecto de Next.js, pero lo dejamos explícito:
  // en producción no se generan source maps del navegador, así nadie
  // puede reconstruir el código fuente original desde las herramientas
  // de desarrollador del navegador.
  productionBrowserSourceMaps: false,
};

export default nextConfig;
