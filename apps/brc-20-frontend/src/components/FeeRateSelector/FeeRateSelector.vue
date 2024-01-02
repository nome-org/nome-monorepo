<script setup lang="ts">

import { useQuery } from '@tanstack/vue-query';
import { ref, watch } from 'vue';
import { FeeLabels } from '../../constants';
import NumberInput from '../ui/NumberInput.vue';
import FeeRate from './FeeRate.vue';

defineProps({
    modelValue: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['update:modelValue']);


const selectedFee = ref(FeeLabels.CUSTOM);
const customFee = ref('');

const fees = ref({
    [FeeLabels.NORMAL]: 1,
    [FeeLabels.ECONOMY]: 1,
    [FeeLabels.CUSTOM]: 1
})
const { isFetched } = useQuery<{
    fastestFee: number,
    halfHourFee: number,
    hourFee: number,
    economyFee: number,
    minimumFee: number
}>({
    queryKey: ['fees'],
    queryFn: async () => {
        const data = await fetch(`${import.meta.env.VITE_APP_MEMPOOL_URL}/api/v1/fees/recommended`)
            .then(res => res.json())
        customFee.value = String(data.fastestFee)
        emit('update:modelValue', data.hourFee)
        selectedFee.value = FeeLabels.NORMAL
        fees.value = {
            [FeeLabels.ECONOMY]: data.economyFee,
            [FeeLabels.NORMAL]: data.hourFee,
            [FeeLabels.CUSTOM]: data.fastestFee
        }
        return data
    },
    enabled(): boolean {
        return !customFee.value
    },
})

const feeLabelsArr = [FeeLabels.ECONOMY, FeeLabels.NORMAL]
watch(selectedFee, (newFee) => {
    if (newFee !== FeeLabels.CUSTOM) {
        emit('update:modelValue', fees.value[newFee])
    }
})

watch(customFee, (fee) => {
    if (selectedFee.value === FeeLabels.CUSTOM) {
        emit('update:modelValue', fee)
    }
})

</script>
<template>
    <div class="grid grid-cols-3 gap-5 mt-8">
        <FeeRate :key="fee" v-for="fee in feeLabelsArr" v-model="selectedFee" :fee-rate="fees[fee]" :fee-rate-label="fee"
            v-if="isFetched" />
        <FeeRate v-model="selectedFee" :fee-rate="Number(customFee)" :fee-rate-label="FeeLabels.CUSTOM" />
    </div>
    <div class="mt-8 flex flex-col" v-if="selectedFee === FeeLabels.CUSTOM">
        <label class="mb-2">You can add a custom fee below</label>
        <div class="w-full bg-white text-black p-2 flex items-center gap-5 rounded-md">
            <NumberInput v-model="customFee" className="outline-none w-full" />
            <span>sats/vByte</span>
        </div>
    </div>
</template>