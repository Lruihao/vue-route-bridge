import { defineComponent, h, getCurrentInstance, onMounted, onBeforeUnmount } from 'vue'
import { createRouterSync } from '../parent'
import type { RouteSnapshot, RouterSyncOptions } from '../types'

export const RouteBridge = defineComponent({
  name: 'RouteBridge',
  props: {
    src: { type: String, required: true },
    eventType: { type: String, required: true },
    prefix: { type: String, default: '' },
    loginRouteNames: { type: Array as () => string[], default: () => ['login'] },
    stripQuery: { type: Array as () => string[], default: () => ['token', 'from'] },
    targetOrigin: { type: String, default: undefined },
    iframeClass: { type: String, default: 'route-bridge-iframe' },
    iframeTitle: { type: String, default: '' },
    onLogin: { type: Function as unknown as () => ((to: RouteSnapshot) => void) | undefined, default: undefined },
  },
  emits: ['route-change'],
  setup(props, { emit }) {
    const instance = getCurrentInstance()
    const router = instance?.appContext?.app?.config?.globalProperties?.$router

    let handle: ReturnType<typeof createRouterSync> | undefined

    onMounted(() => {
      if (!router) {
        console.warn('[vue-route-bridge] RouteBridge: no router found. Use createParentListener manually.')
        return
      }
      handle = createRouterSync(router, {
        eventType: props.eventType,
        prefix: props.prefix,
        loginRouteNames: props.loginRouteNames,
        stripQuery: props.stripQuery,
        targetOrigin: props.targetOrigin,
        onLogin: props.onLogin,
      })
      handle.onMessage((to) => emit('route-change', to))
      handle.start()
    })

    onBeforeUnmount(() => {
      handle?.stop()
    })

    return () => h('iframe', {
      src: props.src,
      class: props.iframeClass,
      title: props.iframeTitle,
      style: { border: 'none', width: '100%', height: '100%' },
    })
  },
})
