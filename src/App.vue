<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  reactive,
  watch,
  inject,
  nextTick,
} from "vue";

let ctx = null;
const canvasRef = ref(null);
const scale = 3;
const canvasWidth = ref(595 * scale);
const canvasHeight = ref(842 * scale);
const isSettingsModalOpen = ref(false);
const isPortrait = ref(true);
const fileUpload = ref(null);
const fileUploadImage = ref(null);
const isImageLoaded = ref(false);
const pageMargin = ref(30);

watch(
  () => fileUpload.value,
  () => {
    isImageLoaded.value = false;
    var reader = new FileReader();

    reader.addEventListener(
      "load",
      function () {
        fileUploadImage.value = new Image();
        fileUploadImage.value.src = reader.result;
        fileUploadImage.value.onload = function () {
          isImageLoaded.value = true;
        };
      },
      false
    );

    if (fileUpload.value) {
      reader.readAsDataURL(fileUpload.value);
    }
  }
);

watch(
  () => isPortrait.value,
  async () => {
    if (isPortrait.value) {
      canvasWidth.value = 595 * scale;
      canvasHeight.value = 842 * scale;
    } else {
      canvasHeight.value = 595 * scale;
      canvasWidth.value = 842 * scale;
    }

    await nextTick();

    renderPage();
  }
);

watch(
  () => isImageLoaded.value,
  () => {
    if (isImageLoaded.value) {
      renderPage();
    }
  }
);

watch(
  () => pageMargin.value,
  () => {
    if (isImageLoaded.value) {
      renderPage();
    }
  }
);

function renderPage() {
  if (isImageLoaded.value) {
    const margin = parseInt(pageMargin.value.toString()) || 0;

    ctx.reset();

    const destHeight = canvasHeight.value - margin * 2;
    const destWidth = canvasWidth.value - margin * 2;

    const imgAspect =
      fileUploadImage.value.height / fileUploadImage.value.width;
    const destAspect = destHeight / destWidth;

    let targetWidth = destWidth;
    let targetHeight = destHeight;
    let imgX = 0;
    let imgY = 0;
    if (imgAspect > destAspect) {
      targetWidth = destHeight / imgAspect;
      targetHeight = destHeight;
    } else {
      targetWidth = destWidth;
      targetHeight = destWidth * imgAspect;
    }

    imgX = margin + (destWidth - targetWidth) / 2;
    imgY = margin + (destHeight - targetHeight) / 2;

    ctx.drawImage(
      fileUploadImage.value,
      0,
      0,
      fileUploadImage.value.width,
      fileUploadImage.value.height,
      imgX,
      imgY,
      targetWidth,
      targetHeight
    );
  }
}

onMounted(async () => {
  ctx = canvasRef.value.getContext("2d");
  if (ctx != null) {
    ctx.reset();
  }
});
</script>

<template>
  <v-app>
    <v-app-bar :height="50">
      <v-btn variant="tonal" class="ml-3" @click="isSettingsModalOpen = true">
        <template v-slot:prepend>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20"
            width="20"
            viewBox="0 0 512 512"
          >
            <path
              d="M0 416c0 17.7 14.3 32 32 32l54.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 448c17.7 0 32-14.3 32-32s-14.3-32-32-32l-246.7 0c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48L32 384c-17.7 0-32 14.3-32 32zm128 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM320 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32-80c-32.8 0-61 19.7-73.3 48L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l246.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48l54.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-54.7 0c-12.3-28.3-40.5-48-73.3-48zM192 128a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm73.3-64C253 35.7 224.8 16 192 16s-61 19.7-73.3 48L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l86.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 128c17.7 0 32-14.3 32-32s-14.3-32-32-32L265.3 64z"
            />
          </svg>
        </template>
        Settings</v-btn
      >
      <v-btn variant="tonal" class="ml-3">
        <template v-slot:prepend>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20"
            width="25"
            viewBox="0 0 640 512"
          >
            <path
              d="M128 0C92.7 0 64 28.7 64 64l0 96 64 0 0-96 226.7 0L384 93.3l0 66.7 64 0 0-66.7c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0L128 0zM384 352l0 32 0 64-256 0 0-64 0-16 0-16 256 0zm64 32l32 0c17.7 0 32-14.3 32-32l0-96c0-35.3-28.7-64-64-64L64 192c-35.3 0-64 28.7-64 64l0 96c0 17.7 14.3 32 32 32l32 0 0 64c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-64zM432 248a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"
            />
          </svg>
        </template>
        Print</v-btn
      >
    </v-app-bar>

    <v-container max-width="800" class="print-preview-container">
      <canvas
        class="print-canvas elevation-4 mt-5 rounded-lg"
        :width="canvasWidth"
        :height="canvasHeight"
        ref="canvasRef"
      ></canvas>
    </v-container>

    <v-dialog
      :fullscreen="$vuetify.display.xs"
      max-width="600"
      v-model="isSettingsModalOpen"
    >
      <template v-slot:default>
        <v-card>
          <v-toolbar title="Settings"></v-toolbar>

          <v-card-text class="">
            <v-row dense>
              <v-file-input
                v-model="fileUpload"
                label="Upload image"
                variant="outlined"
              ></v-file-input>
            </v-row>
            <v-row dense>
              <v-radio-group v-model="isPortrait">
                <v-radio
                  label="Portrait"
                  :value="true"
                  color="primary"
                ></v-radio>
                <v-radio
                  label="Landscape"
                  :value="false"
                  color="primary"
                ></v-radio>
              </v-radio-group>
            </v-row>
            <v-row dense>
              <v-text-field
                v-model="pageMargin"
                label="Page margin"
                variant="outlined"
                required
              />
            </v-row>
          </v-card-text>

          <v-card-actions class="justify-end">
            <v-btn text="Close" @click="isSettingsModalOpen = false"></v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </v-app>
</template>

<style scoped>
.print-canvas {
  width: 100%;
  background-color: white;
}
</style>
