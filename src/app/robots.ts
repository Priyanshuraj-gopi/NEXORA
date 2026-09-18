import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/privacy', '/terms', '/cookies', '/refund'],
      disallow: ['/api/', '/result/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

