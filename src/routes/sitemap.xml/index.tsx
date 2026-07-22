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
const priorities: Record<string, number> = {
  plans: 0.9,
  resources: 0.6,
  'resources/rgb/': 0.8,
  'resources/rgb/presets': 0.7,
  'resources/animpreview': 0.5,
  docs: 0.5,
};

interface RouteNode {
  _I?: boolean;
  _M?: RouteNode[];
  _W?: RouteNode & { _P?: string };
  _A?: RouteNode & { _P?: string };
  [key: string]: unknown;
}

function extractRoutes(
  node: RouteNode | null | undefined,
  pathParts: string[] = []
): string[] {
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
    result.push(...extractRoutes(child as RouteNode, [...pathParts, key]));
  }

  return result;
}

export const onGet: RequestHandler = (ev) => {
  const siteRoutes = extractRoutes(routes as RouteNode)
    .filter((route) => {
      return !excludeRoutes.some((exclude) => route.includes(exclude));
    })
    .map((route) => {
      let priority = 1;
      for (const [key, value] of Object.entries(priorities)) {
        if (route.startsWith(key)) {
          priority = value;
          break;
        }
      }
      return {
        loc: route,
        priority,
      };
    });

  const sitemap = createSitemap(siteRoutes);
  ev.headers.set('Content-Type', 'text/xml');

  throw ev.send(200, sitemap);
};
