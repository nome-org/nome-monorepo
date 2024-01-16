<script setup lang="ts">
import { computed } from 'vue';
import Button from '../components/ui/Button.vue';
import { useAuth } from '../util/useAuth';
const {
  auth,
  login
} = useAuth()

const isVerified = computed(() => auth.isLoggedIn)

</script>
<template>
  <div class="relative h-screen w-screen bg-black ">

    <div class="w-full h-full z-10 relative flex flex-col items-center">
      <div class="relative flex flex-col items-center">
        <h1
          class="uppercase text-white text-4xl text-center flex justify-between w-3/4 max-w-[24rem] sm:w-full mx-auto mt-8">
          <span v-for="item in 'Gallery'.split('')">{{ item }}</span>
        </h1>
        <img src="../assets/images/logo-white.png" alt="NoMe logo" class="w-3/4 max-w-[18rem] sm:w-full mx-auto mt-8" />
      </div>
      <div class="mt-16 flex flex-col items-center">
        <div class="text-pink">
          BUY $N0ME BRC-20 TO
        </div>
        <Button :disabled="isVerified" @click="login" class-name="mt-4" type="button" class="{{ btnClass }}">
          VERIFY
        </Button>
      </div>
      <div class="flex flex-col sm:flex-row w-full max-w-3xl mt-20 sm:h-32">
        <router-link to="/gallery" class="relative bottom-2 right-4 self-end">
          <Button :disabled="!isVerified" type="button" class-name="relative bottom-2 right-4 self-end">
            Expo
          </Button>
        </router-link>
        <div class="flex gap-x-20 w-full text-xs">
          <div class="w-5/12 rounded-br-md border-r border-b border-gray-600 h-5/6">
            <div class="relative bottom-12 right-12">
              The first exhibition BEAR MARKET is a manifestation of a bull run. It is an extraordinary
              digital
              immersive exhibition with sound with a free 1/1 art inscription to mint.
            </div>
          </div>
          <div class="w-5/12 rounded-tl-md border-l border-t border-gray-600 h-5/6">
            <div class="relative top-12 left-12">

              This is a platform for the community to explore the potential of Bitcoin Ordinals. Create GIF
              recursive animations on-chain and inscribe on rare sats all in one place.
            </div>

          </div>
        </div>
        <router-link to="/gif">
          <Button :disabled="!isVerified" type="button" class-name="relative bottom-4 left-4 self-start">
            Tool
          </Button>
        </router-link>
      </div>
    </div>
  </div>
</template>