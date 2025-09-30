import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },

  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.mercadopago.com",
      "frame-src 'self' https://www.mercadopago.com https://www.mercadopago.com.br https://sdk.mercadopago.com",
      "connect-src 'self' https://api.mercadopago.com https://sdk.mercadopago.com",
      "img-src 'self' data: https://http2.mlstatic.com https://www.mercadopago.com https://www.mercadopago.com.br",
      "style-src 'self' 'unsafe-inline'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;