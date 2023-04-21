/*
 * NOTE:
 *   This file is plugin stub for main.js
 */

import plugin, { Quill } from './index';
const { version } = plugin;

console.log('TCL: plugin', plugin);
console.log('TCL: version', version);
console.log('TCL: Quill', Quill);

export const install = (app: {
  use: (arg0: {
    install: (app: { component: (arg0: string, arg1: any) => void }) => void;
    version: string;
    Quill: Quill;
    VueEditor: any;
  }) => void;
}) => {
  app.use(plugin);
};

/*
 * NOTE:
 *   If you want Vue instance of main.js to import something in your plugin as a Vue option,
 *   you need to export it here.
 */
// export default plugin
