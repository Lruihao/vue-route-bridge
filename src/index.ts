// Core APIs (zero Vue dependency)
export { createChildGuard } from './child'
export { createParentListener, createRouterSync } from './parent'
export { cloneRoute } from './clone-route'
export { isIframed } from './iframe-detect'

// Types
export type {
  RouteSnapshot,
  ChildGuardOptions,
  ParentListenerOptions,
  ParentListenerHandle,
  RouterSyncOptions,
} from './types'

// Default event type constant
export const DEFAULT_EVENT_TYPE = 'VUE_ROUTE_BRIDGE_CHANGE'
