import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rent-ex.vercel.app';

  // Static Pages
  const routes = ['', '/about', '/contact', '/fleet', '/faq', '/services', '/impressum', '/privacy', '/terms', '/cookies', '/dsgvo'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Dynamic Car Fleet Detail Pages
  let carRoutes: MetadataRoute.Sitemap = [];
  try {
    const cars = await prisma.car.findMany({
      where: { isActive: true, status: 'Active' },
      select: { id: true, brand: true, model: true, updatedAt: true }
    });

    carRoutes = cars.map((car) => {
      const slug = `${car.brand}-${car.model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return {
        url: `${baseUrl}/fleet/${car.id}-${slug}`,
        lastModified: car.updatedAt || new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      };
    });
  } catch (error) {
    console.error('Error generating sitemap dynamic routes:', error);
  }

  return [...routes, ...carRoutes];
}
