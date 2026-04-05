import type { RequestHandler } from '@builder.io/qwik-city';
import { routes } from '@qwik-city-plan';
import { createSitemap } from './create-sitemap';

const excludeRoutes = [
  'sitemap.xml',  // Exclude the sitemap route itself
  'resources/papertimings',
  'resources/sparkprofile',
  '[id]', // Exclude dynamic routes
  '404', // Exclude 404 page
  'api',
  'acornmc',
];
const priorities = {
  'plans': 0.9,
  'resources': 0.6,
  'resources/rgb/': 0.8,
  'resources/rgb/presets': 0.7,
  'resources/animpreview': 0.5,
  'docs': 0.5,
};

export const onGet: RequestHandler = (ev) => {
  const siteRoutes = routes
    .map(([route]) => route as string)
    .filter(route => route !== '/')  // Exclude the '/' route
    .filter(route => !excludeRoutes.some(exclude => route.includes(exclude)))
    .map(loc => {
      let priority = 0.5; // Default priority

      // Check if the route has a priority override
      Object.keys(priorities).forEach(priorityRoute => {
        console.log(loc);
        if (loc.startsWith(priorityRoute)) {
          priority = priorities[priorityRoute as keyof typeof priorities];
        }
      });

      return {
        loc,
        priority,
      };
    })
    .sort((a, b) => b.priority - a.priority); // Sort by priority for better readability

  const sitemap = createSitemap([
    { loc: '/', priority: 1 },  // Manually include the root route
    ...siteRoutes,
  ]);

  const response = new Response(sitemap, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });

  ev.send(response);
};