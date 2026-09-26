export const siteConfig = {
  name: 'NEXORA',
  tagline: 'Same You. Different Era.',
  description: 'AI Photo Booth: Transform your photos into different eras and styles.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://nexoraaiphotobooth.vercel.app',
  sessionExpiry: 24 * 60 * 60 * 1000, // 24 hours in ms
  maxFileSize: 15 * 1024 * 1024, // 15 MB
  supportedFormats: ['image/jpeg', 'image/png', 'image/webp'] as const,
  qrExpiry: 24 * 60 * 60 * 1000, // 24 hours
  rateLimit: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },
  ai: {
    maxRetries: 3,
    retryDelayMs: 2000,
    timeoutMs: 120000, // 2 minutes
  },
} as const;
