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
        <Button :disabled="isVerified" @click="login" class-name="mt-4">
          VERIFY
        </Button>
      </div>
      <div class="flex flex-col gap-y-8 items-center sm:flex-row sm:w-full max-w-3xl mt-20 sm:h-32">
        <router-link to="/gallery" class="sm:relative right-4 sm:self-end">
          <Button :disabled="!isVerified">
            Expo
          </Button>
        </router-link>
        <div class="gap-x-20 w-full text-xs flex flex-col items-center gap-y-8 sm:flex-row">
          <div class="w-1/2 sm:w-5/12 rounded-br-md sm:border-r sm:border-b border-gray-600 h-5/6">
            <div class="sm:relative bottom-12 right-12">
              The first exhibition BEAR MARKET is a manifestation of a bull run. It is an extraordinary
              digital
              immersive exhibition with sound with a free 1/1 art inscription to mint.
            </div>
          </div>
          <div class="w-1/2 sm:w-5/12 rounded-tl-md sm:border-l sm:border-t border-gray-600 h-5/6">
            <div class="sm:relative top-12 left-12">
              This is a platform for the community to explore the potential of Bitcoin Ordinals. Create GIF
              recursive animations on-chain and inscribe on rare sats all in one place.
            </div>
          </div>
        </div>
        <router-link to="/gif" class="sm:relative left-4 sm:self-start">
          <Button :disabled="!isVerified">
            Tool
          </Button>
        </router-link>
      </div>
    </div>
  </div>
</template>