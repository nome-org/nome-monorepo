<script setup lang="ts">
import { computed, ref } from 'vue';
import Button from '../components/ui/Button.vue';
import { useAuth } from '../util/useAuth';
import { Modal } from '@repo/shared-ui';
import { WalletType } from '@repo/wallet-utils';
import { toast } from 'vue3-toastify'
const {
  auth,
  login
} = useAuth()

const isVerified = computed(() => auth.isLoggedIn)
const isWalletSelectionOpen = ref(false)

const openWalletSelection = () => {
  isWalletSelectionOpen.value = true
}


const handleLogin = async (walletType: WalletType) => {
  try {

    await login({ walletType })
    isWalletSelectionOpen.value = false
  } catch (error: unknown) {

    toast.error((error as Error).message)
  }
}
</script>
<template>
  <Modal :is-open="isWalletSelectionOpen" @on-visibility-change="isWalletSelectionOpen = $event">

    <div class="bg-white text-black p-8 rounded shadow flex flex-col">
      <h2 class="text-2xl font-bold mb-4">Select wallet</h2>
      <button class="mb-2 px-4 py-2 font-semibold rounded hover:bg-gray-200 flex items-center gap-x-4"
        @click="handleLogin(WalletType.xverse)">
        <img src="../assets/images/xverse-icon.png" class="h-4">
        Xverse
      </button>
      <button class="mb-2 px-4 py-2 font-semibold rounded hover:bg-gray-200 flex items-center gap-x-4"
        @click="handleLogin(WalletType.unisat)">
        <img src="../assets/images/unisat-icon.png" class="h-4">
        Unisat
      </button>
      <button class="mb-2 px-4 py-2 font-semibold rounded hover:bg-gray-200 flex items-center gap-x-4"
        @click="handleLogin(WalletType.leather)">
        <img src="../assets/images/leather-icon.png" class="h-4">
        Leather
      </button>
    </div>

  </Modal>
  <div class="relative h-screen w-screen bg-black ">

    <div class="w-full h-full z-10 relative flex flex-col items-center">
      <div class="relative flex flex-col items-center">
        <h1
          class="uppercase text-white text-4xl text-center flex justify-between w-3/4 max-w-[24rem] sm:w-full mx-auto mt-8">
          <span v-for="item in 'Gallery'.split('')">{{ item }}</span>
        </h1>
        <img src="../assets/images/logo-white.png" alt="NoMe logo" class="w-3/4 max-w-[18rem] sm:w-full mx-auto mt-8" />
      </div>
      <div class="max-w-xl text-lg sm:text-xl text-white italic text-center mt-16">

        <h2>
          Welcome to the NōME gallery – a space for
          premium 1/1 art and unique digital experiences.
        </h2>
        <h2 class="mt-8">
          We open the first GIF animation tool to inscribe stop-motion art on Bitcoin.
        </h2>
      </div>

      <div class="mt-16 flex flex-col items-center">
        <button :disabled="isVerified" @click="openWalletSelection"
          class="bg-transparent text-white rounded-lg border border-pink py-1 px-4 tracking-[0.3em]">
          VERIFY
        </button>
        <div class="text-pink mt-4 text-xl">
          $N0ME BRC-20 TO ENTER
        </div>
      </div>
      <a href="https://brc20.nome.wtf" target="_blank" class="sm:fixed sm:bottom-12 mt-12 text-gray-500 italic">
        Get tokens if you don't have
        <span class="text-green">$NOME →</span>
      </a>
      <!-- <div class="flex flex-col gap-y-8 items-center sm:flex-row sm:w-full max-w-3xl mt-20 sm:h-32">
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
      </div> -->
    </div>
  </div>
</template>