import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nexoraaiphotobooth.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/contact', '/privacy', '/terms', '/cookies', '/refund'],
      disallow: ['/api/', '/result/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

