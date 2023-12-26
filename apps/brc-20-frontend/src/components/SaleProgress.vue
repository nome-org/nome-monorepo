<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import ProgressBar from './ui/ProgressBar.vue';
import { client } from '../api/client';
import { computed } from 'vue';
import { formatNumber } from '../util/formatNumber';

const { data: progressData } = useQuery({
    queryKey: ['mint progress'],
    queryFn: async () => {
        return client.provide('get', '/progress', {})
    }
})

const progressFormatted = computed(() => {
    if (progressData.value?.status === 'success' && progressData.value?.data?.progress) {
        return formatNumber(progressData.value.data.progress)
    }
    return '0'
})

const percentage = computed(() => {
    if (progressData.value?.status === 'success' && progressData.value?.data?.progress) {
        return progressData.value.data.progress / 50_000_000 * 100
    }
    return 0
})
</script>

<template>
    <div class="p-4 bg-[#252525] w-full rounded-lg">
        <div class="pb-4 border-b border-[#6b6b6b] border-solid text-left">
            <div class="flex justify-between">
                <div>
                    <p>Total Supply – 100M</p>
                    <p>Public mint – 50M</p>
                    <p>Minimum mint – 1K</p>
                </div>
                <div>
                    <p>Price – 0.00000013 BTC</p>
                    <p>WL price – 0.0000001 BTC</p>
                    <p>Maximum mint – 250K</p>
                </div>
            </div>
        </div>
        <div class="pt-4">
            <div class="flex justify-between mb-4">
                <div class="flex gap-x-2 ">
                    <img class="w-4" src="../assets/images/lightning-bolt-icon.png" alt="lightning bolt icon"
                        role="presentation">
                    Progress
                </div>
                <div>
                    {{ progressFormatted }} / 50,000,000
                </div>
            </div>
            <ProgressBar :percent="percentage" />

        </div>
    </div>
</template>