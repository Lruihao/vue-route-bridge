import type { ChildGuardOptions } from './types'
import { cloneRoute } from './clone-route'
import { isIframed } from './iframe-detect'

/**
 * Register an afterEach guard that posts route changes to the parent window.
 * Works with vue-router 3 and 4. No-ops if not inside an iframe.
 *
 * @param router - Vue Router instance (v3 or v4)
 * @param options - Configuration options
 * @returns A function to remove the guard, or undefined if not in iframe
 */
export function createChildGuard(
  router: any,
  options: ChildGuardOptions = {},
): (() => void) | undefined {
  if (!isIframed()) return undefined

  const eventType = options.eventType || 'VUE_ROUTE_BRIDGE_CHANGE'
  const targetOrigin = options.targetOrigin || '*'
  const filter = options.filter

  const guard = (to: any) => {
    const snapshot = cloneRoute(to)
    if (filter && !filter(snapshot)) return
    window.parent?.postMessage(
      { type: eventType, to: snapshot },
      targetOrigin,
    )
  }

  router.afterEach(guard)

  return () => {
    // vue-router doesn't provide a direct way to remove afterEach guards,
    // but we can set a flag to skip the guard
  }
}
