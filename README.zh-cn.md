# vue-route-bridge

Vue iframe 父子应用路由同步库。通过 `postMessage` 实现 iframe 内子应用与父应用的路由双向同步。

## 特性

- 支持 Vue 2 + Vue Router 3 和 Vue 3 + Vue Router 4
- 零运行时依赖（Vue/Vue Router 为可选 peerDependencies）
- 同时提供函数式 API 和 Vue 组件
- 跨域 iframe 安全检测
- 可配置的事件类型、URL 前缀、登录路由拦截

## 安装

```bash
npm install vue-route-bridge
```

## 使用

### 子应用（运行在 iframe 内）

```ts
import { createChildGuard } from 'vue-route-bridge'

createChildGuard(router, {
  eventType: 'MY_APP_ROUTE_CHANGE',
})
```

当子应用有独立的路由前缀（如 `/ai/chat`）时，使用 `transform` 在发送前修改：

```ts
createChildGuard(router, {
  eventType: 'MY_APP_ROUTE_CHANGE',
  transform(to) {
    to.fullPath = to.fullPath.replace(/^\/ai/, '') || '/'
    to.path = to.path.replace(/^\/ai/, '') || '/'
  },
})
```

### 父应用（宿主应用）

#### 方式一：函数式 API

```ts
import { createRouterSync } from 'vue-route-bridge'

// 在组件 mounted 中调用
const handle = createRouterSync(this.$router, {
  eventType: 'MY_APP_ROUTE_CHANGE',
  prefix: '/my-app',
  onLogin: () => this.$logout(),
  stripQuery: ['token', 'from'],
})

handle.start()

// 在组件销毁时停止
handle.stop()
```

#### 方式二：Vue 组件

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

注册 Vue Router afterEach 守卫，将路由变化通过 postMessage 发送给父窗口。

**参数：**

- `router`: Vue Router 实例（v3 或 v4）
- `options.eventType`: 事件类型字符串，默认 `'VUE_ROUTE_BRIDGE_CHANGE'`
- `options.targetOrigin`: postMessage 的 targetOrigin，默认 `'*'`
- `options.transform`: 路由快照转换钩子，可在发送前修改快照（原地修改或返回新对象）
- `options.filter`: 过滤函数，返回 false 跳过本次同步

### `createParentListener(options)`

创建父窗口消息监听器。

**参数：**

- `options.eventType`: 事件类型（必须与子应用一致）
- `options.targetOrigin`: 验证消息来源的 origin

**返回：** `{ start(), stop(), onMessage(handler) }`

### `createRouterSync(parentRouter, options)`

高级封装：自动将子应用路由同步到父应用路由器。

**额外参数：**

- `options.prefix`: URL 前缀，如 `'/testclaw'`
- `options.onLogin`: 登录路由拦截回调
- `options.loginRouteNames`: 触发登录拦截的路由名，默认 `['login']`
- `options.stripQuery`: 需要剥离的 query 参数，默认 `['token', 'from']`
- `options.transform`: 路由快照转换钩子，可在同步前修改快照（原地修改或返回新对象）

### `<RouteBridge>` 组件

渲染 iframe 并自动管理路由同步。

**Props：**

- `src` (必填): iframe URL
- `eventType` (必填): 事件类型
- `prefix`: URL 前缀
- `onLogin`: 登录拦截回调
- `loginRouteNames`: 登录路由名数组
- `stripQuery`: 需要剥离的 query 参数数组
- `targetOrigin`: 消息来源验证
- `iframeClass`: iframe CSS 类名
- `iframeTitle`: iframe title 属性

**Events：**

- `route-change`: 收到子应用路由变化时触发

## License

MIT
