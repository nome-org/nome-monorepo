<script setup lang="ts">
import { Modal } from '@repo/shared-ui';
import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { createAppToken, useAuth } from '../util/useAuth';
import { apiClient } from '../api/client';
import { useIntersectionObserver } from '@vueuse/core'
import { VNodeRef, ref } from 'vue';

const LIMIT = 20


const emit = defineEmits<{
  closeModal: []
}>()

const skip = ref(0)

const { auth } = useAuth()


const triggerImage = ref<VNodeRef | null>(null)


const { stop } = useIntersectionObserver(
  triggerImage,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      skip.value = skip.value + LIMIT
    }
  },
)
const { data: frames } = useQuery<string[]>({
  queryKey: [
    'frames',
    auth.privateKey,
    skip
  ],
  queryFn: async () => {
    const token = createAppToken(auth.privateKey)
    const res = await apiClient.provide("get", '/frames', {
      take: LIMIT,
      skip: skip.value
    }, {
      Authorization: `Bearer ${token}`
    })
    if (res.status === 'error') {
      return []
    }
    const {
      results,
    } = res.data
    if (results.length < LIMIT) {
      stop()
    }
    return results
  },
  placeholderData: keepPreviousData,
  enabled: () => !!auth.privateKey,
})

const contentEndpoint = `https://testnet.ordinals.com/content/`

</script>
<template>
  <Modal :is-open="true" @on-visibility-change="$emit('closeModal')">
    <div class="bg-gray-700 text-white px-8 pb-4 pt-4 relative w-full h-full sm:h-4/5  max-w-3xl">
      <v-icon name="io-close-outline" class="absolute top-0 right-0 m-2 w-8 h-8 cursor-pointer"
        @click="$emit('closeModal')" />
      <header class="italic">
        <h2 class="text-xl">
          Choose inscriptions from the library
        </h2>
        <p class="mt-4">
          It is an open-source library for Ordinals community. Bitcoin artists contributed their works for
          everyone to enjoy creating GIF animations on-chain. You can use these images as frames.
        </p>
      </header>
      <section class="mt-8 flex gap-8 flex-wrap overflow-auto">
        <img v-for="(frame, index) of frames" :src="contentEndpoint + frame" alt="" class="flex-1"
          :ref="index === (frames?.length || 0) - 3 ? triggerImage : null">
      </section>
    </div>
  </Modal>
</template>