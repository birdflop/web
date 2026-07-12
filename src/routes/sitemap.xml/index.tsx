import { type RequestHandler } from '@qwik.dev/router';
import { routes } from '@qwik-router-config';
import { createSitemap } from './create-sitemap';

const excludeRoutes = [
  'sitemap.xml', // Exclude the sitemap route itself
  'resources/papertimings',
  'resources/sparkprofile',
  '[id]', // Exclude dynamic routes
  '404', // Exclude 404 page
  'api',
  'acornmc',
];
const priorities = {
  plans: 0.9,
  resources: 0.6,
  'resources/rgb/': 0.8,
  'resources/rgb/presets': 0.7,
  'resources/animpreview': 0.5,
  docs: 0.5,
};

function extractRoutes(node: any, pathParts: string[] = []): string[] {
  const result: string[] = [];
  if (!node || typeof node !== 'object') return result;

  if (node._I) {
    const path = pathParts.join('/');
    result.push(path ? path + '/' : '/');
  }

  if (node._M && Array.isArray(node._M)) {
    for (const group of node._M) {
      result.push(...extractRoutes(group, pathParts));
    }
  }

  if (node._W && typeof node._W === 'object') {
    const paramName = node._W._P;
    const pathPart = paramName ? `[${paramName}]` : '[param]';
    result.push(...extractRoutes(node._W, [...pathParts, pathPart]));
  }
  if (node._A && typeof node._A === 'object') {
    const paramName = node._A._P;
    const pathPart = paramName ? `[...${paramName}]` : '[...rest]';
    result.push(...extractRoutes(node._A, [...pathParts, pathPart]));
  }

  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('_')) {
      continue;
    }
    result.push(...extractRoutes(child, [...pathParts, key]));
  }

  return result;
}

export const onGet: RequestHandler = (ev) => {
  const siteRoutes = extractRoutes(routes)
    .filter((route) => route !== '/') // Exclude the '/' route
    .filter(
      (route) => !excludeRoutes.some((exclude) => route.includes(exclude))
    )
    .map((loc) => {
      let priority = 0.5; // Default priority

      // Check if the route has a priority override
      Object.keys(priorities).forEach((priorityRoute) => {
        if (loc.startsWith(priorityRoute)) {
          priority = priorities[priorityRoute as keyof typeof priorities];
        }
      });

      return {
        loc: loc.startsWith('/') ? loc : '/' + loc,
        priority,
      };
    })
    .sort((a, b) => b.priority - a.priority); // Sort by priority for better readability

  const sitemap = createSitemap([
    { loc: '/', priority: 1 }, // Manually include the root route
    ...siteRoutes,
  ]);

  const response = new Response(sitemap, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });

  ev.send(response);
};
