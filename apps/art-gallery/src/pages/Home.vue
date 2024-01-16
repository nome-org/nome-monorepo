<script setup lang="ts"></script>

<template>
  <div class="relative h-screen w-screen">
    <video src="/gallery-gradient.mp4" muted playsinline loop autoplay preload="auto"
      class="min-w-full min-h-full object-cover fixed z-0"></video>

    <div class="w-full h-full z-10 relative flex flex-col items-center justify-center">
      <div class="relative flex flex-col items-center w-full">
        <h1
          class="uppercase text-white text-4xl text-center flex justify-between w-3/4 max-w-[24rem] sm:w-full mx-auto mb-6">
          <span v-for="item in 'Gallery'.split('')">{{ item }}</span>
        </h1>
        <router-link type="button" to="/intro"
          class="uppercase bg-white text-black tracking-[0.3em] py-1 px-4 rounded-md transition-all hover:scale-110">
          enter
        </router-link>
        <!-- <img src="../assets/images/logo-white.png" alt=""
          class="w-3/4 max-w-[24rem] sm:w-full mx-auto mt-8 hover:opacity-0 transition-all ease-in" /> -->
      </div>
      <div class="fixed bottom-0 w-full flex justify-between pb-10 text-white sm:text-xl px-4 sm:px-12 flex-wrap">
        <div class="capitalize">JAN 2024</div>
        <div class="">Ordinals Gallery</div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
