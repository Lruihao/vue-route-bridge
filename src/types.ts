/** Serializable snapshot of a route, safe for postMessage structured clone */
export interface RouteSnapshot {
  fullPath: string
  path: string
  name: string | null | undefined
  hash: string
  query: Record<string, string | (string | null)[]>
  params: Record<string, string | string[]>
  meta: Record<string, unknown>
}

/** Options for the child-side guard */
export interface ChildGuardOptions {
  /** Unique event type string. Default: 'VUE_ROUTE_BRIDGE_CHANGE' */
  eventType?: string
  /** Origin passed to postMessage. Default: '*' */
  targetOrigin?: string
  /** Transform the route snapshot before posting. Return a new snapshot or modify in place. */
  transform?: (snapshot: RouteSnapshot) => RouteSnapshot | void
  /** Return false to skip posting this route change */
  filter?: (to: RouteSnapshot) => boolean
}

/** Options for the parent-side listener */
export interface ParentListenerOptions {
  /** Must match the child's eventType */
  eventType: string
  /** URL prefix to prepend to child's fullPath. e.g. '/testclaw' */
  prefix?: string
  /** Route name(s) that trigger onLogin. Default: ['login'] */
  loginRouteNames?: string[]
  /** Query keys to strip when syncing to parent router. Default: ['token', 'from'] */
  stripQuery?: string[]
  /** Origin to validate on incoming messages. Default: undefined (no check) */
  targetOrigin?: string
}

/** Handle returned by createParentListener */
export interface ParentListenerHandle {
  /** Start listening for messages */
  start(): void
  /** Stop listening and clean up */
  stop(): void
  /** Register a handler for each received route event */
  onMessage(handler: (snapshot: RouteSnapshot, event: MessageEvent) => void): () => void
}

/** Options for createRouterSync (extends ParentListenerOptions) */
export interface RouterSyncOptions extends ParentListenerOptions {
  /** Called when child navigates to a login route */
  onLogin?: (to: RouteSnapshot) => void
  /** Transform the received route snapshot before syncing to the parent router. Return a new snapshot or modify in place. */
  transform?: (snapshot: RouteSnapshot) => RouteSnapshot | void
}
