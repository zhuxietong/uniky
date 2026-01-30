import pagesDefinedPlugin from './pages.defined';
import globalDefinedPlugin from './global.defined';
export function unikyPlugin(options = {}) {
    const { enablePages = true, enableGlobal = true } = options;
    const plugins = [];
    if (enablePages) {
        plugins.push(pagesDefinedPlugin());
    }
    if (enableGlobal) {
        plugins.push(globalDefinedPlugin());
    }
    return plugins;
}
export { pagesDefinedPlugin, globalDefinedPlugin };
export default unikyPlugin;
//# sourceMappingURL=index.js.map