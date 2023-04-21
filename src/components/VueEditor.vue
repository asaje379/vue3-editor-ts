<script lang="ts" setup>
  import { ExtendedQuill as Quill } from '../helpers/quill';
  import defaultToolbar from '../helpers/default-toolbar.js';
  import mergeDeep from '../helpers/merge-deep.js';
  import MarkdownShortcuts from '../helpers/markdown-shortcuts.js';
  import CustomLink from '../helpers/custom-link.js';
  import { ref, watch, onMounted } from 'vue';

  export type EmitType =
    | 'ready'
    | 'editor-change'
    | 'focus'
    | 'selection-change'
    | 'text-change'
    | 'blur'
    | 'input'
    | 'image-removed'
    | 'image-added'
    | 'update:modelValue';

  const props = defineProps({
    id: {
      type: String,
      default: 'quill-container',
    },
    placeholder: {
      type: String,
      default: '',
    },
    modelValue: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
    },
    editorToolbar: {
      type: [Array, Object],
      default: () => [],
    },
    editorOptions: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    useCustomImageHandler: {
      type: Boolean,
      default: false,
    },
    useMarkdownShortcuts: {
      type: Boolean,
      default: false,
    },
    prependLinksHttps: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits([
    'ready',
    'editor-change',
    'focus',
    'selection-change',
    'text-change',
    'blur',
    'input',
    'image-removed',
    'image-added',
    'update:modelValue',
  ]);

  const quill = ref<any>(null);
  const quillContainer = ref(null);
  const fileInput = ref(null);

  watch(
    () => props.modelValue,
    (val: any) => {
      if (val != quill.value.root.innerHTML && !quill.value.hasFocus()) {
        quill.root.innerHTML = val;
      }
    },
  );

  watch(
    () => props.disabled,
    (status) => {
      quill.value.enable(!status);
    },
  );

  const setModules = () => {
    let modules: any = {
      toolbar: props.editorToolbar.length
        ? props.editorToolbar
        : defaultToolbar,
    };
    if (props.useMarkdownShortcuts) {
      Quill.register('modules/markdownShortcuts', MarkdownShortcuts, true);
      modules['markdownShortcuts'] = {};
    }
    if (props.prependLinksHttps) {
      Quill.register('formats/link', CustomLink, true);
    }
    return modules;
  };

  const prepareEditorConfig = (editorConfig: {
    [x: string]: any;
    debug?: boolean;
    modules?: any;
    theme?: string;
    placeholder?: string;
    readOnly?: boolean;
  }) => {
    if (
      Object.keys(props.editorOptions).length > 0 &&
      props.editorOptions.constructor === Object
    ) {
      if (
        props.editorOptions.modules &&
        typeof props.editorOptions.modules.toolbar !== 'undefined'
      ) {
        // We don't want to merge default toolbar with provided toolbar.
        delete editorConfig.modules.toolbar;
      }

      mergeDeep(editorConfig, props.editorOptions);
    }
  };

  const setupQuillEditor = () => {
    let editorConfig = {
      debug: false,
      modules: setModules(),
      theme: 'snow',
      placeholder: props.placeholder ? props.placeholder : '',
      readOnly: props.disabled ? props.disabled : false,
    };

    prepareEditorConfig(editorConfig);
    if (quillContainer.value) {
      quill.value = new Quill(quillContainer.value, editorConfig);
    }
  };

  const customImageHandler = () => {
    if (fileInput.value) {
      (fileInput.value as HTMLInputElement).click();
    }
  };

  const setupCustomImageHandler = () => {
    let toolbar = quill.value.getModule('toolbar');
    toolbar.addHandler('image', customImageHandler);
  };

  const checkForCustomImageHandler = () => {
    props.useCustomImageHandler === true ? setupCustomImageHandler() : '';
  };

  const handleInitialContent = () => {
    if (props.modelValue) quill.value.root.innerHTML = props.modelValue; // Set initial editor content
  };

  const initializeEditor = () => {
    setupQuillEditor();
    checkForCustomImageHandler();
    handleInitialContent();
    registerEditorEventListeners();
    emit('ready', quill.value);
  };

  const registerPrototypes = () => {
    quill.value = {
      ...quill.value,
      getHTML: () => {
        return quill.value.container.querySelector('.ql-editor').innerHTML;
      },
      getWordCount: () =>
        quill.value.container.querySelector('.ql-editor').innerText.length,
    };
    Quill.getHTML = () => {
      return quill.value.container.querySelector('.ql-editor').innerHTML;
    };
  };

  const listenForEditorEvent = (type: EmitType) => {
    quill.value.on(type, (...args: any) => {
      emit(type, ...args);
    });
  };

  const handleSelectionChange = (range: any, oldRange: any) => {
    if (!range && oldRange) emit('blur', quill.value);
    else if (range && !oldRange) emit('focus', quill.value);
  };

  // const handleImageRemoved = () => {
  //   // const currrentContents = quill.value.getContents();
  //   // const deletedContents = currrentContents.diff(oldContents);
  //   // const operations = deletedContents.ops;
  //   // operations.map(
  //   //   (operation: { insert: { hasOwnProperty?: any; image?: any } }) => {
  //   //     // eslint-disable-next-line no-prototype-builtins
  //   //     if (operation.insert && operation.insert.hasOwnProperty('image')) {
  //   //       const { image } = operation.insert;
  //   //       emit('image-removed', image);
  //   //     }
  //   //   },
  //   // );
  // };

  const handleTextChange = () => {
    const editorContent =
      quill.value.getHTML() === '<p><br></p>' ? '' : quill.value.getHTML();
    emit('update:modelValue', editorContent);

    // if (props.useCustomImageHandler) handleImageRemoved(delta, oldContents);
  };

  const registerEditorEventListeners = () => {
    quill.value.on('text-change', handleTextChange);
    quill.value.on('selection-change', handleSelectionChange);
    listenForEditorEvent('text-change');
    listenForEditorEvent('selection-change');
    listenForEditorEvent('editor-change');
  };

  const emitImageInfo = ($event: any) => {
    const resetUploader = () => {
      const uploader = document.getElementById('file-upload') as any;
      uploader.value = '';
    };
    let file = $event.target.files[0];
    let Editor = quill.value;
    let range = Editor.getSelection();
    let cursorLocation = range.index;
    emit('image-added', file, Editor, cursorLocation, resetUploader);
  };

  onMounted(() => {
    initializeEditor();
    registerPrototypes();
  });
</script>

<template>
  <div class="quillWrapper">
    <slot name="toolbar"></slot>
    <div
      :id="id"
      ref="quillContainer"></div>
    <input
      v-if="useCustomImageHandler"
      id="file-upload"
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="emitImageInfo($event)" />
  </div>
</template>

<style src="quill/dist/quill.snow.css"></style>
<style src="../assets/vue3-editor.scss" lang="scss"></style>
