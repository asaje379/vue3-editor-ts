<template>
  <div id="app">
    <VueEditor
      ref="vEditor"
      v-model="content"
      use-custom-image-handler
      use-markdown-shortcuts
      prepend-links-https
      @focus="onEditorFocus"
      @blur="onEditorBlur"
      @imageAdded="handleImageAdded"
      @image-removed="handleImageRemoved"
      @text-change="handleChange" />
    <div
      id="result"
      v-html="content"></div>
  </div>
</template>

<script lang="ts" setup>
  // import axiosInstance from "@/helpers/axios";
  import axios from 'axios';
  import Quill from 'quill';
  import { ref } from 'vue';
  const AlignStyle = Quill.import('attributors/style/align');
  Quill.register(AlignStyle, true);

  const BlockEmbed = Quill.import('blots/block/embed');

  const CLIENT_ID = '993793b1d8d3e2e';
  const content = ref('');

  /**
   * Customize image so we can add an `id` attribute
   */
  class ImageBlot extends BlockEmbed {
    static create(value: { url: any; id: any }) {
      const node = super.create();
      node.setAttribute('src', value.url);
      node.setAttribute('id', value.id);
      return node;
    }

    static value(node: { getAttribute: (arg0: string) => any }) {
      return {
        url: node.getAttribute('src'),
        id: node.getAttribute('id'),
      };
    }
  }

  ImageBlot.blotName = 'image';
  ImageBlot.tagName = 'img';
  Quill.register(ImageBlot);

  const onEditorBlur = (quill: any) => {
    console.log('editor blur!', quill);
  };

  const onEditorFocus = (quill: any) => {
    console.log('editor focus!', quill);
  };

  const handleImageAdded = async (
    file: string | Blob,
    Editor: {
      insertEmbed: (
        arg0: any,
        arg1: string,
        arg2: { id: any; url: any },
        arg3: string,
      ) => void;
    },
    cursorLocation: any,
  ) => {
    const formData = new FormData();
    formData.append('image', file);

    const { data } = await axios({
      url: 'https://api.imgur.com/3/image',
      method: 'POST',
      headers: { Authorization: 'Client-ID ' + CLIENT_ID },
      data: formData,
    });
    console.log('TCL: handleImageAdded -> data', data);

    const { link, id } = data.data;
    Editor.insertEmbed(
      cursorLocation,
      'image',
      {
        id,
        url: link,
      },
      Quill.sources.USER,
    );
  };

  const handleImageRemoved = (image: { id: any }) => {
    console.log('handleImageRemoved -> image', image);
  };

  const handleChange = (e: any) => {
    console.log(e, 'event');
  };
</script>

<style lang="scss">
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    // text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
