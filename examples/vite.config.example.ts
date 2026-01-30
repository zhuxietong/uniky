import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { unikyPlugin } from 'uniky/plugin';

export default defineConfig({
  plugins: [
    uni(),
    ...unikyPlugin({
      enablePages: true,
      enableGlobal: true
    })
  ]
});