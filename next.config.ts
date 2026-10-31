import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["sharp"],
  experimental: {
    serverActions: { bodySizeLimit: "100mb" },
    // El middleware clona el cuerpo y lo corta a 10 MB por defecto, aunque la acción admita más.
    middlewareClientMaxBodySize: "100mb",
  },
  async redirects() {
    return [
      // Secciones que se unieron en Contenido.
      { source: "/videos", destination: "/contenido", statusCode: 301 },
      { source: "/videos/:slug", destination: "/contenido/:slug", statusCode: 301 },
      { source: "/membresia", destination: "/contenido#membresia", statusCode: 301 },
      { source: "/blog", destination: "/contenido#articulos", statusCode: 301 },
      // URLs del sitio Joomla anterior.
      { source: "/index.php", destination: "/", statusCode: 301 },
      { source: "/index.php/noticias", destination: "/", statusCode: 301 },
      { source: "/index.php/:path*", destination: "/", statusCode: 301 },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
