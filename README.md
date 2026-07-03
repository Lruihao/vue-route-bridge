# vue-route-bridge

Vue iframe parent-child route synchronization library. Syncs routes between a child app running inside an iframe and its parent host via `postMessage`.

## Features

- Supports Vue 2 + Vue Router 3 and Vue 3 + Vue Router 4
- Zero runtime dependencies (Vue/Vue Router are optional peerDependencies)
- Both functional API and Vue components
- Cross-origin iframe detection
- Configurable event type, URL prefix, and login route interception

## Install

```bash
npm install vue-route-bridge
```

## Usage

### Child App (running inside iframe)

```ts
import { createChildGuard } from 'vue-route-bridge'

createChildGuard(router, {
  eventType: 'MY_APP_ROUTE_CHANGE',
})
```

When the child app has its own route prefix (e.g. `/ai/chat`), use `transform` to modify the snapshot before sending:

```ts
createChildGuard(router, {
  eventType: 'MY_APP_ROUTE_CHANGE',
  transform(to) {
    to.fullPath = to.fullPath.replace(/^\/ai/, '') || '/'
    to.path = to.path.replace(/^\/ai/, '') || '/'
  },
})
```

### Parent App (host)

#### Option 1: Functional API

```ts
import { createRouterSync } from 'vue-route-bridge'

// Call in component mounted hook
const handle = createRouterSync(this.$router, {
  eventType: 'MY_APP_ROUTE_CHANGE',
  prefix: '/my-app',
  onLogin: () => this.$logout(),
  stripQuery: ['token', 'from'],
})

handle.start()

// Stop on component destroy
handle.stop()
```

#### Option 2: Vue Component

**Vue 3:**

```vue
<template>
  <RouteBridge
    :src="iframeUrl"
    event-type="MY_APP_ROUTE_CHANGE"
    prefix="/my-app"
    @route-change="onRouteChange"
  />
</template>

<script setup>
import { RouteBridge } from 'vue-route-bridge/vue3'
</script>
```

**Vue 2:**

```vue
<template>
  <RouteBridge
    :src="iframeUrl"
    event-type="MY_APP_ROUTE_CHANGE"
    prefix="/my-app"
    @route-change="onRouteChange"
  />
</template>

<script>
import { RouteBridge } from 'vue-route-bridge/vue2'

export default {
  components: { RouteBridge },
}
</script>
```

## API

### `createChildGuard(router, options?)`

Register a Vue Router afterEach guard that posts route changes to the parent window via postMessage.

**Parameters:**

- `router`: Vue Router instance (v3 or v4)
- `options.eventType`: Event type string, default `'VUE_ROUTE_BRIDGE_CHANGE'`
- `options.targetOrigin`: targetOrigin for postMessage, default `'*'`
- `options.transform`: Transform hook to modify the route snapshot before posting (modify in place or return a new object)
- `options.filter`: Filter function, return false to skip syncing for this route change

### `createParentListener(options)`

Create a parent window message listener.

**Parameters:**

- `options.eventType`: Event type (must match the child app)
- `options.targetOrigin`: Origin to validate incoming messages

**Returns:** `{ start(), stop(), onMessage(handler) }`

### `createRouterSync(parentRouter, options)`

Higher-level helper: automatically syncs child app routes to the parent router.

**Additional parameters:**

- `options.prefix`: URL prefix, e.g. `'/testclaw'`
- `options.onLogin`: Login route interception callback
- `options.loginRouteNames`: Route names that trigger login interception, default `['login']`
- `options.stripQuery`: Query params to strip, default `['token', 'from']`
- `options.transform`: Transform hook to modify the received route snapshot before syncing (modify in place or return a new object)

### `<RouteBridge>` Component

Renders an iframe and automatically manages route synchronization.

**Props:**

- `src` (required): iframe URL
- `eventType` (required): Event type
- `prefix`: URL prefix
- `onLogin`: Login interception callback
- `loginRouteNames`: Array of login route names
- `stripQuery`: Array of query params to strip
- `targetOrigin`: Origin for message validation
- `iframeClass`: iframe CSS class
- `iframeTitle`: iframe title attribute

**Events:**

- `route-change`: Emitted when a child app route change is received

## License

MIT
