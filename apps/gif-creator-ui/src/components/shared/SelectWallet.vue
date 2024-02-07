<script setup lang="ts">
import { Modal } from '@repo/shared-ui';
import { WalletType } from '@repo/wallet-utils';

const { isOpen } = defineProps<{
  isOpen: boolean
}>();

const emit = defineEmits<{
  closeModal: []
  walletSelected: [walletType: WalletType]
}>();
</script>
<template>
  <Modal :is-open="isOpen" @on-visibility-change="$emit('closeModal')">
    <div class="bg-white text-black p-8 rounded shadow flex flex-col w-full max-w-xs items-center opacity-90">
      <h2 class="text-3xl mb-8 font-sans-serif italic">Select a wallet</h2>
      <button
        class="mb-2 px-4 py-2 font-semibold rounded hover:bg-gray-300 flex items-center gap-x-4 w-full transition-all"
        @click="$emit('walletSelected', WalletType.xverse)">
        <img src="../../assets/images/xverse-icon.png" class="h-8">
        Xverse
      </button>
      <button
        class="mb-2 px-4 py-2 font-semibold rounded hover:bg-gray-300 flex items-center gap-x-4 w-full transition-all"
        @click="$emit('walletSelected', WalletType.unisat)">
        <img src="../../assets/images/unisat-icon.png" class="h-8">
        Unisat
      </button>
      <button
        class="mb-2 px-4 py-2 font-semibold rounded hover:bg-gray-300 flex items-center gap-x-4 w-full transition-all"
        @click="$emit('walletSelected', WalletType.leather)">
        <img src="../../assets/images/leather-icon.png" class="h-8">
        Leather
      </button>
    </div>
  </Modal>
</template>