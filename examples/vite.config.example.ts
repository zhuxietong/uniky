import { defineConfig } from 'vite';
// @ts-ignore
import uni from '@dcloudio/vite-plugin-uni';
// @ts-ignore
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
