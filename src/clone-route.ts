import type { RouteSnapshot } from './types'

/**
 * Extract a serializable snapshot from a route object.
 * Works with both vue-router 3 Route and vue-router 4 RouteLocationNormalized.
 * Picks known-safe fields explicitly to avoid circular refs and non-serializable values.
 */
export function cloneRoute(route: any): RouteSnapshot {
  return {
    fullPath: route.fullPath || '',
    path: route.path || '',
    name: route.name ?? null,
    hash: route.hash || '',
    query: { ...(route.query || {}) },
    params: { ...(route.params || {}) },
    meta: { ...(route.meta || {}) },
  }
}
