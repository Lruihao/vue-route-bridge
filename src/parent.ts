import type { ParentListenerOptions, ParentListenerHandle, RouteSnapshot, RouterSyncOptions } from './types'

interface RouteBridgeMessage {
  type: string
  to: RouteSnapshot
}

function isRouteBridgeMessage(data: unknown, eventType: string): data is RouteBridgeMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as any).type === eventType &&
    typeof (data as any).to === 'object' &&
    (data as any).to !== null
  )
}

/**
 * Create a listener that receives route changes from a child iframe.
 * Returns a handle with start/stop/onMessage methods.
 *
 * @param options - Configuration options
 */
export function createParentListener(
  options: ParentListenerOptions,
): ParentListenerHandle {
  const eventType = options.eventType
  const targetOrigin = options.targetOrigin

  let active = false
  let messageHandler: ((event: MessageEvent) => void) | null = null
  const callbacks: Set<(snapshot: RouteSnapshot, event: MessageEvent) => void> = new Set()

  function handleMessage(event: MessageEvent) {
    if (targetOrigin && event.origin !== targetOrigin) return
    if (!isRouteBridgeMessage(event.data, eventType)) return

    const { to } = event.data
    for (const cb of callbacks) {
      cb(to, event)
    }
  }

  return {
    start() {
      if (active) return
      active = true
      messageHandler = (event: MessageEvent) => handleMessage(event)
      window.addEventListener('message', messageHandler)
    },

    stop() {
      if (!active || !messageHandler) return
      active = false
      window.removeEventListener('message', messageHandler)
      messageHandler = null
    },

    onMessage(handler: (snapshot: RouteSnapshot, event: MessageEvent) => void) {
      callbacks.add(handler)
      return () => callbacks.delete(handler)
    },
  }
}

/**
 * Higher-level helper: creates a parent listener that automatically syncs
 * the parent router to mirror the child's route.
 *
 * @param parentRouter - The parent's vue-router instance (v3 or v4)
 * @param options - Configuration options
 * @returns A handle with start/stop methods
 */
export function createRouterSync(
  parentRouter: any,
  options: RouterSyncOptions,
): ParentListenerHandle {
  const handle = createParentListener(options)
  const prefix = options.prefix || ''
  const loginRouteNames = options.loginRouteNames || ['login']
  const stripQuery = options.stripQuery || ['token', 'from']
  const onLogin = options.onLogin
  const transform = options.transform

  handle.onMessage((to) => {
    let snapshot = to
    if (transform) {
      const result = transform(snapshot)
      if (result) snapshot = result
    }

    if (loginRouteNames.includes(snapshot.name as string)) {
      onLogin?.(snapshot)
      return
    }

    const path = `${prefix}${snapshot.fullPath}`

    if (parentRouter.currentRoute?.fullPath === path) return

    const query = { ...snapshot.query }
    for (const key of stripQuery) {
      delete query[key]
    }

    parentRouter.replace({ path, query })
  })

  return handle
}
