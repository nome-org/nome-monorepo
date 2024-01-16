<script setup lang="ts">
import { ref } from 'vue';

const volume = ref(40);
const isMuted = ref(true);

function toggleVideoSound() {
  isMuted.value = !isMuted.value;
}

function handleVolumeChange(e: Event) {
  volume.value = Number((e.target as HTMLInputElement).value);
}

</script>


<template>
  <div class="relative h-screen w-screen">
    <video src="/one-love.mp4" playsinline loop id="video" autoplay preload="auto" :muted="isMuted" :volume="volume / 100"
      class="min-w-full min-h-full object-cover fixed z-0"></video>

    <div
      class="fixed bg-black items-center bottom-0 w-full flex justify-between p-3 text-white text-xl px-3 sm:px-12 flex-wrap">
      <div class="flex items-center gap-3">
        <span @click="toggleVideoSound" class="cursor-pointer">
          <v-icon scale="1.4" :name="isMuted ? 'fa-volume-mute' : 'fa-volume-up'" />
        </span>
        <input type="range" :value="volume" @change="handleVolumeChange" min="1" max="100" class="" />
      </div>

      <div class="flex items-center">
        <span class="cursor-pointer">
          <v-icon class="text-[#b5b5b5]" scale="3" name="bi-chevron-compact-down" />
        </span>
        <span class="cursor-pointer">
          <v-icon class="text-[#b5b5b5]" scale="3" name="bi-chevron-compact-up" />
        </span>
      </div>
      <div class="capitalize">ORDINALS <span class="text-sm">ONE LOVE</span></div>
    </div>
  </div>
</template>


<style scoped>
/********** Range Input Styles **********/
/*Range Reset*/
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  width: 15rem;
}

/* Removes default focus */
input[type="range"]:focus {
  outline: none;
}

/***** Chrome, Safari, Opera and Edge Chromium styles *****/
/* slider track */
input[type="range"]::-webkit-slider-runnable-track {
  background-color: #b5b5b5;
  /* border-radius: 8px; */
  height: 0.8px;
}

/* slider thumb */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  /* Override default look */
  appearance: none;
  margin-top: -12px;
  /* Centers thumb on the track */

  /*custom styles*/
  background-color: #fff;
  height: 1.6rem;
  border-radius: 8px;
  width: 0.6rem;
}

input[type="range"]:focus::-webkit-slider-thumb {
  border: none;
  outline: none;
}

/******** Firefox styles ********/
/* slider track */
input[type="range"]::-moz-range-track {
  background-color: #b5b5b5;
  border-radius: 8px;
  height: 0.8px;
}

/* slider thumb */
input[type="range"]::-moz-range-thumb {
  border: none;
  /*Removes extra border that FF applies*/
  border-radius: 8px !important;
  /*Removes default border-radius that FF applies*/

  /*custom styles*/
  background-color: #fff;
  height: 1.6rem;
  width: 0.6rem;
}

input[type="range"]:focus::-moz-range-thumb {
  border: none;
  outline: none;
}
</style>