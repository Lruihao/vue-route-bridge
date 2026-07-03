import { createRouterSync } from '../parent'
import type { RouteSnapshot } from '../types'

/**
 * Vue 2 component for parent-side iframe route sync.
 * Uses Options API for maximum compatibility with Vue 2.
 */
export const RouteBridge: any = {
  name: 'RouteBridge',
  props: {
    src: { type: String, required: true },
    eventType: { type: String, required: true },
    prefix: { type: String, default: '' },
    loginRouteNames: { type: Array, default: () => ['login'] },
    stripQuery: { type: Array, default: () => ['token', 'from'] },
    targetOrigin: { type: String, default: undefined },
    iframeClass: { type: String, default: 'route-bridge-iframe' },
    iframeTitle: { type: String, default: '' },
    onLogin: { type: Function, default: undefined },
  },
  data() {
    return {
      handle: null as ReturnType<typeof createRouterSync> | null,
    }
  },
  mounted() {
    const router = (this as any).$router
    if (!router) {
      console.warn('[vue-route-bridge] RouteBridge: no router found. Use createParentListener manually.')
      return
    }
    (this as any).handle = createRouterSync(router, {
      eventType: (this as any).eventType,
      prefix: (this as any).prefix,
      loginRouteNames: (this as any).loginRouteNames,
      stripQuery: (this as any).stripQuery,
      targetOrigin: (this as any).targetOrigin,
      onLogin: (this as any).onLogin,
    })
    ;(this as any).handle.onMessage((to: RouteSnapshot) => {
      (this as any).$emit('route-change', to)
    })
    ;(this as any).handle.start()
  },
  beforeDestroy() {
    (this as any).handle?.stop()
  },
  render(h: any) {
    return h('iframe', {
      attrs: {
        src: (this as any).src,
        class: (this as any).iframeClass,
        title: (this as any).iframeTitle,
      },
      style: { border: 'none', width: '100%', height: '100%' },
    })
  },
}
