<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

let ctx: CanvasRenderingContext2D | null = null;
const canvasRef = ref(null);
const scale = ref(3);
const canvasWidth = ref(595 * scale.value);
const canvasHeight = ref(842 * scale.value);
const isSettingsModalOpen = ref(false);
const isPortrait = ref(true);
const fileUpload = ref(null);
const fileUploadImage = ref<HTMLImageElement | null>(null);
const isImageLoaded = ref(false);
const pageMargin = ref(30);
const innerMargin = ref(0);
const loadImageUrl = ref<string | null>(null);
const repeatHorizontally = ref(1);
const repeatVertically = ref(1);
const isImageUrlErrorVisible = ref(false);

watch(
  () => fileUpload.value,
  () => {
    isImageLoaded.value = false;
    var reader = new FileReader();

    reader.addEventListener(
      "load",
      function () {
        fileUploadImage.value = new Image();
        fileUploadImage.value.src = reader.result?.toString() ?? "";
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
  () => loadImageUrl.value,
  () => {
    isImageUrlErrorVisible.value = false;
  }
);

watch(
  () => isPortrait.value,
  () => {
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

watch(
  () => innerMargin.value,
  () => {
    if (isImageLoaded.value) {
      renderPage();
    }
  }
);

watch(
  () => repeatHorizontally.value,
  () => {
    if (isImageLoaded.value) {
      renderPage();
    }
  }
);

watch(
  () => repeatVertically.value,
  () => {
    if (isImageLoaded.value) {
      renderPage();
    }
  }
);

function fillBackground(ctx: CanvasRenderingContext2D) {
  if (canvasRef.value) {
    ctx.fillStyle = "white";
    ctx.fillRect(
      0,
      0,
      (canvasRef.value as HTMLCanvasElement).width,
      (canvasRef.value as HTMLCanvasElement).height
    );
  }
}

function drawImage(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  destWidth: number,
  destHeight: number
) {
  if (fileUploadImage.value) {
    let imgAspect = fileUploadImage.value.height / fileUploadImage.value.width;
    const destAspect = destHeight / destWidth;

    console.log(x, y, destWidth, destHeight);

    let offsetX = x;
    let offsetY = y;
    let targetWidth = destWidth;
    let targetHeight = destHeight;
    if (imgAspect > destAspect) {
      targetWidth = destHeight / imgAspect;
      targetHeight = destHeight;
    } else {
      targetWidth = destWidth;
      targetHeight = destWidth * imgAspect;
    }

    offsetX = x + (destWidth - targetWidth) / 2;
    offsetY = y + (destHeight - targetHeight) / 2;

    ctx.drawImage(
      fileUploadImage.value,
      0,
      0,
      fileUploadImage.value.width,
      fileUploadImage.value.height,
      offsetX,
      offsetY,
      targetWidth,
      targetHeight
    );
  }
}

function renderPage() {
  if (
    isImageLoaded.value &&
    ctx != null &&
    fileUploadImage.value != null &&
    canvasRef.value != null
  ) {
    const margin = parseInt(pageMargin.value.toString()) || 0;

    ctx.reset();

    fillBackground(ctx);

    ctx.save();

    let destHeight = canvasHeight.value - (margin * scale.value * 2) - (innerMargin.value * scale.value * 0.5);
    let destWidth = canvasWidth.value - (margin * scale.value * 2) - (innerMargin.value * scale.value * 0.5);

    if (!isPortrait.value) {
      [destWidth, destHeight] = [destHeight, destWidth];
      ctx.translate(canvasWidth.value, 0);
      ctx.rotate((90 * Math.PI) / 180);
    }

    let posX = margin * scale.value;
    const innerMarginValue = (innerMargin.value * scale.value) / 2;
    for (let x = 0; x < repeatHorizontally.value; x++) {
      const w = destWidth / repeatHorizontally.value;

      let posY = margin * scale.value;
      for (let y = 0; y < repeatVertically.value; y++) {
        const h = destHeight / repeatVertically.value;

        drawImage(ctx, posX + innerMarginValue, posY + innerMarginValue, w - innerMarginValue, h - innerMarginValue);

        posY += h;
      }
      posX += w;
    }

    ctx.restore();
  }
}

function print() {
  window.print();
}

function download() {
  if (canvasRef.value) {
    const link = document.createElement("a");
    link.download = "filename.png";
    link.href = (canvasRef.value as HTMLCanvasElement).toDataURL();
    link.click();
  }
}

function readUrl() {
  if (!loadImageUrl.value || loadImageUrl.value.length == 0) {
    isImageUrlErrorVisible.value = true;
    return;
  }
  fileUploadImage.value = new Image();
  fileUploadImage.value.src = loadImageUrl.value ?? "";
  fileUploadImage.value.crossOrigin = "anonymous";
  fileUploadImage.value.onload = function () {
    isImageLoaded.value = true;
  };
  fileUploadImage.value.onerror = function () {
    isImageUrlErrorVisible.value = true;
  };
}

onMounted(async () => {
  if (canvasRef.value) {
    ctx = (canvasRef.value as HTMLCanvasElement).getContext("2d");
    if (ctx != null) {
      ctx.reset();
    }
  }
});
</script>

<template>
  <v-app>
    <v-app-bar :height="50">
      <div class="d-flex justify-center w-100">
        <template v-if="isImageLoaded">
          <v-btn variant="tonal" class="ml-3" @click="isSettingsModalOpen = true">
            <template v-slot:prepend>
              <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 512 512">
                <path
                  d="M0 416c0 17.7 14.3 32 32 32l54.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 448c17.7 0 32-14.3 32-32s-14.3-32-32-32l-246.7 0c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48L32 384c-17.7 0-32 14.3-32 32zm128 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM320 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32-80c-32.8 0-61 19.7-73.3 48L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l246.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48l54.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-54.7 0c-12.3-28.3-40.5-48-73.3-48zM192 128a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm73.3-64C253 35.7 224.8 16 192 16s-61 19.7-73.3 48L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l86.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 128c17.7 0 32-14.3 32-32s-14.3-32-32-32L265.3 64z" />
              </svg>
            </template>
            Settings</v-btn>

          <v-btn variant="tonal" class="ml-3" @click="print">
            <template v-slot:prepend>
              <svg xmlns="http://www.w3.org/2000/svg" height="20" width="25" viewBox="0 0 640 512">
                <path
                  d="M128 0C92.7 0 64 28.7 64 64l0 96 64 0 0-96 226.7 0L384 93.3l0 66.7 64 0 0-66.7c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0L128 0zM384 352l0 32 0 64-256 0 0-64 0-16 0-16 256 0zm64 32l32 0c17.7 0 32-14.3 32-32l0-96c0-35.3-28.7-64-64-64L64 192c-35.3 0-64 28.7-64 64l0 96c0 17.7 14.3 32 32 32l32 0 0 64c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-64zM432 248a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" />
              </svg>
            </template>
            Print</v-btn>
          <v-btn variant="tonal" class="ml-3" @click="download">
            <template v-slot:prepend>
              <svg xmlns="http://www.w3.org/2000/svg" height="20" width="25" viewBox="0 0 640 512">
                <path
                  d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" />
              </svg>
            </template>
            Download</v-btn>
        </template>
        <template v-else>
          <span class="font-weight-black">Scale image for printing on A4 paper</span>
        </template>
      </div>
    </v-app-bar>

    <v-container max-width="800" class="print-preview-container position-relative">
      <canvas id="print-page" class="print-canvas elevation-4 mt-5 rounded-lg" :width="canvasWidth"
        :height="canvasHeight" :class="{ portrait: isPortrait, landscape: !isPortrait }" ref="canvasRef">
      </canvas>
      <div v-if="!isImageLoaded"
        class="position-absolute top-0 bottom-0 right-0 left-0 d-flex justify-center align-center">
        <v-btn variant="tonal" class="ml-3" @click="isSettingsModalOpen = true">
          <template v-slot:prepend>
            <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 512 512">
              <path
                d="M0 416c0 17.7 14.3 32 32 32l54.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 448c17.7 0 32-14.3 32-32s-14.3-32-32-32l-246.7 0c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48L32 384c-17.7 0-32 14.3-32 32zm128 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM320 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32-80c-32.8 0-61 19.7-73.3 48L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l246.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48l54.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-54.7 0c-12.3-28.3-40.5-48-73.3-48zM192 128a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm73.3-64C253 35.7 224.8 16 192 16s-61 19.7-73.3 48L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l86.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 128c17.7 0 32-14.3 32-32s-14.3-32-32-32L265.3 64z" />
            </svg>
          </template>
          Create</v-btn>
      </div>
    </v-container>

    <v-dialog :fullscreen="$vuetify.display.xs" max-width="600" v-model="isSettingsModalOpen">
      <template v-slot:default>
        <v-card>
          <v-toolbar title="Scale image for printing on A4 paper"></v-toolbar>

          <v-card-text class="">
            <v-row dense>
              <v-file-input v-model="fileUpload" label="Upload image" variant="outlined"></v-file-input>
            </v-row>
            <v-divider :thickness="2" class="border-opacity-50 mb-6">
              <div class="mb-6">Or</div>
            </v-divider>
            <v-row dense v-if="isImageUrlErrorVisible" class="mb-5">
              <v-alert text="Failed to load image from url. Try other image or upload it from your device."
                type="error"></v-alert>
            </v-row>
            <v-row dense>
              <v-text-field v-model="loadImageUrl" label="Add image from url" variant="outlined" required
                :hide-details="true" class="mb-3" />
            </v-row>
            <v-row dense>
              <v-btn variant="tonal" @click="readUrl"> Read </v-btn>
            </v-row>
            <v-divider :thickness="2" class="border-opacity-50 mb-3 mt-6"></v-divider>
            <v-row dense>
              <v-radio-group v-model="isPortrait">
                <v-radio label="Upright" :value="true" color="primary"></v-radio>
                <v-radio label="Rotated" :value="false" color="primary"></v-radio>
              </v-radio-group>
            </v-row>
            <v-row dense>
              <v-text-field v-model="pageMargin" label="Page margin (points)" variant="outlined" required />
            </v-row>

            <v-row dense>
              <v-slider label="Repeat horizontally" v-model="repeatHorizontally" show-ticks="always"
                thumb-label="always" step="1" :min="1" :max="10"></v-slider>
            </v-row>
            <v-row dense>
              <v-slider label="Repeat vertically" v-model="repeatVertically" show-ticks="always" thumb-label="always"
                step="1" :min="1" :max="10"></v-slider>
            </v-row>
            <v-row dense>
              <v-text-field v-model="innerMargin" label="Inner margin (points)" variant="outlined" required />
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
