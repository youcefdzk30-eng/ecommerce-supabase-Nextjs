/** @type {import('next').NextConfig} */

const securityHeaders = [
{
  key: "Content-Security-Policy",
  value:
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https: wss:; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "object-src 'none'; " +
    "form-action 'self'; " +
    "upgrade-insecure-requests",
},
{
  key: "X-Frame-Options",
  value: "DENY",
},
{
  key: "X-Content-Type-Options",
  value: "nosniff",
},
{
  key: "Referrer-Policy",
  value: "strict-origin-when-cross-origin",
},
{
  key: "Permissions-Policy",
  value: "camera=(), microphone=(), geolocation=()",
},
{
  key: "Strict-Transport-Security",
  value: "max-age=31536000; includeSubDomains; preload",
},
{
  key: "X-XSS-Protection",
  value: "1; mode=block",
},
];

const nextConfig = {
  // Ensure Turbopack uses the project folder as the workspace root to avoid
  // picking a parent folder that contains another lockfile.
  turbopack: {
    // Use the current project working directory so Turbopack doesn't resolve
    // a root outside this worktree (which causes distDirRoot errors).
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        hostname: "**",
      },
      {
        hostname: "fakestoreapi.com",
      },
    ],
    dangerouslyAllowSVG: true,
    unoptimized: process.env.NODE_ENV === "development",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
