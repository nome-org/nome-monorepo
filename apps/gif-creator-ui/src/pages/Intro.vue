<script setup lang="ts">
import { ref } from 'vue';
import Button from '../components/ui/Button.vue';
import { useAuth } from '../util/useAuth';
import { Modal } from '@repo/shared-ui';
import { WalletType } from '@repo/wallet-utils';
import { toast } from 'vue3-toastify'
import { useQuery } from '@tanstack/vue-query';
import { apiClient } from '../api/client';
import { createToken } from '@repo/auth-utils';

const {
  auth,
  login
} = useAuth()

const isWalletSelectionOpen = ref(false)

const { data: isSessionValid } = useQuery({
  queryKey: ['session', auth.privateKey],
  queryFn: async () => {
    const token = createToken({
      privateKey: auth.privateKey,
      prefix: import.meta.env.VITE_APP_CHALLENGE_TEXT,
    })

    const data = await apiClient.provide('get', '/session', {}, {
      Authorization: `Bearer ${token}`
    })

    if (data.status === 'error') {
      return false
    }

    const isSessionValid = !data.data.isExpired
    return isSessionValid
  },
  enabled: () => !!auth.privateKey
})

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
    <div class="bg-white text-black p-8 rounded shadow flex flex-col w-full max-w-xs items-center opacity-90">
      <h2 class="text-3xl mb-8 font-sans-serif italic">Select a wallet</h2>
      <button
        class="mb-2 px-4 py-2 font-semibold rounded hover:bg-gray-300 flex items-center gap-x-4 w-full transition-all"
        @click="handleLogin(WalletType.xverse)">
        <img src="../assets/images/xverse-icon.png" class="h-8">
        Xverse
      </button>
      <button
        class="mb-2 px-4 py-2 font-semibold rounded hover:bg-gray-300 flex items-center gap-x-4 w-full transition-all"
        @click="handleLogin(WalletType.unisat)">
        <img src="../assets/images/unisat-icon.png" class="h-8">
        Unisat
      </button>
      <button
        class="mb-2 px-4 py-2 font-semibold rounded hover:bg-gray-300 flex items-center gap-x-4 w-full transition-all"
        @click="handleLogin(WalletType.leather)">
        <img src="../assets/images/leather-icon.png" class="h-8">
        Leather
      </button>
    </div>

  </Modal>
  <div class="relative  bg-black ">

    <div class="w-full h-full z-10 relative flex flex-col items-center">
      <div class="relative flex flex-col items-center">
        <h1
          class="uppercase text-white text-4xl text-center flex justify-between w-3/4 max-w-[24rem] sm:w-full mx-auto mt-8">
          <span v-for="item in 'Gallery'.split('')">{{ item }}</span>
        </h1>
        <img src="../assets/images/logo-white.png" alt="NoMe logo" class="w-3/4 max-w-[18rem] sm:w-full mx-auto mt-8" />
      </div>
      <div class="max-w-3xl text-xl sm:text-2xl text-white italic text-center mt-12 sm:mt-24 font-sans-serif px-8">

        <h2 class="leading-[1.7] tracking-wider">
          Welcome to the NōME gallery – a space for
          premium 1/1 art and unique digital experiences
        </h2>
        <h2 class="mt-8 leading-[1.7] tracking-wider">
          $NOME BRC-20 gives access to gallery
          <br>
          exhibitions and art tools.
          Verify or buy tokens to enter
        </h2>
      </div>

      <div class="mt-16 sm:mt-32 pb-32 flex flex-col items-center">
        <div class="flex flex-col sm:flex-row gap-4">

          <button @click="openWalletSelection"
            class="bg-transparent text-white rounded-lg border border-pink transition-all hover:bg-pink pl-6 py-1 pr-4 tracking-[0.3em] disabled:opacity-50 w-32">
            VERIFY
          </button>
          <a href="https://brc20.nome.wtf" target="_blank"
            class="bg-transparent text-white rounded-lg border border-pink transition-all hover:bg-pink pl-6 py-1 pr-4 tracking-[0.3em] disabled:opacity-50 w-32 text-center">
            BUY
          </a>
        </div>
        <router-link v-if="isSessionValid"
          class="w-full mt-8 flex border rounded-lg items-center justify-center border-white py-1 hover:bg-white hover:text-black transition-all tracking-[0.3em]"
          to="/gif">ENTER</router-link>
        <!-- <div class="text-pink mt-4 text-xl">
          $N0ME BRC-20 TO ENTER
        </div> -->
      </div>
      <!-- <a href="https://brc20.nome.wtf" target="_blank"
        class="sm:fixed sm:bottom-12 mt-12 text-gray-500 italic text-xl font-sans-serif">
        Buy tokens if you don't have
        <span class="text-green">$NOME →</span>
      </a> -->
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