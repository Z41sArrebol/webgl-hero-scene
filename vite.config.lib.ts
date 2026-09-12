import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * 库构建：把组件打包成可被外部项目消费的 ESM / CJS。
 * 用法：npm run build:lib（声明文件随后由 tsc 追加写入同一目录）
 */
export default defineConfig({
  plugins: [react()],
  // 库产物不该带上 demo 的 public 资源（字体由使用方通过 fontSrc 指定，默认走 CDN）
  publicDir: false,
  build: {
    outDir: 'dist-lib',
    emptyOutDir: true,
    lib: {
      entry: 'src/lib/index.ts',
      name: 'WebglHeroScene',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      // React 由使用方提供，不打进产物
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        exports: 'named',
        globals: { react: 'React', 'react-dom': 'ReactDOM' },
      },
    },
  },
})
