import type { Plugin } from 'vite';
import pagesDefinedPlugin from './pages.defined';
import globalDefinedPlugin from './global.defined';
export interface UnikyPluginOptions {
    enablePages?: boolean;
    enableGlobal?: boolean;
}
export declare function unikyPlugin(options?: UnikyPluginOptions): Plugin[];
export { pagesDefinedPlugin, globalDefinedPlugin };
export default unikyPlugin;
//# sourceMappingURL=index.d.ts.map