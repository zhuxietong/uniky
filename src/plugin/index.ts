// created by zhuxietong on 2026-01-30 16:37
import type { Plugin } from 'vite';

import pagesDefinedPlugin from './pages.defined';
import globalDefinedPlugin from './global.defined';
import httpDefinedPlugin from './http.defined';



export interface UnikyPluginOptions {
  enablePages?: boolean;
  enableGlobal?: boolean;
  enableHttp?: boolean;
}

export function unikyPlugin(options: UnikyPluginOptions = {}): Plugin[] {
  const { enablePages = true, enableGlobal = true, enableHttp = true } = options;

  const plugins: Plugin[] = [];

  if (enablePages) {
    plugins.push(pagesDefinedPlugin());
  }
  if (enableHttp) {
    plugins.push(httpDefinedPlugin());
  }
  if (enableGlobal) {
    plugins.push(globalDefinedPlugin());
  }


  return plugins;
}

export { pagesDefinedPlugin, globalDefinedPlugin, httpDefinedPlugin };

export default unikyPlugin;
