
<script setup lang="ts">
import Socials from './Socials.vue';
</script>


<template>
  <div class="py-0 px-[25px] text-xl">
    <div class="mt-24 pt-12">
      <!--    <h1 class="intro-title">I AM NOME</h1>-->
      <div class="border-t border-solid border-opacity-20 border-white pt-2 md:mt-0 mt-12 w-full relative">
        <h3 class="text-[1.3rem] leading-6 ">Partners</h3>

      </div>
    </div>
    <div class="w-full flex justify-between pt-12 gap-0 relative">
      <div class=" pb-[48px] flex flex-col sm:flex-row gap-x-6 items-center gap-y-4 opacity-50">
        <img src="../../assets/images/ordinalsbot_logo.png" class="max-h-[1.8rem] sm:max-h-[1.7rem]" alt="">
        <img src="../../assets/images/xverse_logo_white.png" class="max-h-[1.1rem]" alt="">
      </div>
      <div class="flex gap-x-8 flex-1 justify-end pr-12">
        <Socials />
      </div>
    </div>
  </div>
</template>
