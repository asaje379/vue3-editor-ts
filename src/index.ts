import Quill from 'quill';
import VueEditor from './components/VueEditor.vue';
import './assets/md-toolbar.scss';
import './assets/vue3-editor.scss';

const version = '0.1.0-alpha.2';

class Install {
  static installed = false;
}

// Declare install function executed by Vue.use()
export function install(app: { component: (arg0: string, arg1: any) => void }) {
  if (Install.installed) return;
  Install.installed = true;

  app.component('VueEditor', VueEditor);
}

const VPlugin: any = {
  install,
  version,
  Quill,
  VueEditor,
};

// Auto-install when vue is found (eg. in browser via <script> tag)
// let GlobalVue = null;
// if (typeof window !== "undefined") {
//   GlobalVue = window.Vue;
// } else if (typeof global !== "undefined") {
//   GlobalVue = global.Vue;
// }
// if (GlobalVue) {
//   GlobalVue.use(VPlugin);
// }

export default VPlugin;
export { VueEditor, Quill };

/*************************************************/
