import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    vue2: 'src/components/vue2.ts',
    vue3: 'src/components/vue3.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  deps: {
    neverBundle: ['vue', 'vue-router', '@vue/composition-api'],
  },
})
