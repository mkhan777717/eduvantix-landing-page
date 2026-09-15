/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  /* ── Security & SEO HTTP Headers ─────────────────────────────────────
     Applied to every page response. These headers improve Lighthouse
     security score and prevent common web vulnerabilities.
  ─────────────────────────────────────────────────────────────────────── */
  /* ── Careers lives on the app, not here ──────────────────────────────
     The careers page needs a signed-in user to apply, and auth lives on
     learn.eduvantix.com — localStorage is per-origin, so a token issued
     there is unreadable on this domain. The app's own /careers page is
     already the declared canonical, so send everything to it rather than
     keeping a second copy that can never complete an application.
  ─────────────────────────────────────────────────────────────────────── */
  async redirects() {
    return [
      {
        source: "/careers",
        destination: "https://learn.eduvantix.com/careers",
        permanent: true,
      },
      {
        source: "/careers/:path*",
        destination: "https://learn.eduvantix.com/careers/:path*",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          /* Prevent MIME-type sniffing */
          { key: "X-Content-Type-Options", value: "nosniff" },

          /* Block clickjacking */
          { key: "X-Frame-Options", value: "SAMEORIGIN" },

          /* Legacy XSS protection for older browsers */
          { key: "X-XSS-Protection", value: "1; mode=block" },

          /* Control referrer information sent to external sites */
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          /* Permissions Policy — restrict powerful APIs
             NOTE: camera/microphone left open so Google Identity Services
             can access them during the OAuth popup flow */
          {
            key: "Permissions-Policy",
            value:
              "geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()",
          },

          /* DNS Prefetch Control */
          { key: "X-DNS-Prefetch-Control", value: "on" },

          /* Allow Google OAuth popup to communicate back.
             'same-origin-allow-popups' is required for Google Sign-In to work. */
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },

        ],
      },
      /* ── Protect dashboard/auth routes from indexing via header ── */
      {
        source: "/(admin|student|mentor|dashboard)/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      /* ── Cache static assets ── */
      {
        source: "/(.*)\\.(ico|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  /* ── Image optimisation ──────────────────────────────────────────── */
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eduvantix.com",
      },
      {
        protocol: "https",
        hostname: "datamindx.in",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
