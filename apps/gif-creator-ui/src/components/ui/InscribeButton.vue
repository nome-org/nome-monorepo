<script setup lang="ts">
import { OrderingState } from '../../constants/inscriptions';

const textByStatus = {
    [OrderingState.None]: 'INSCRIBE',
    [OrderingState.RequestingWalletAddress]: 'Requesting Addresses...',
    [OrderingState.WaitingForCreation]: 'Creating order...',
    [OrderingState.WaitingForPayment]: 'Waiting for payment...',
}

const { orderingState } = defineProps<{ orderingState: OrderingState }>();
defineEmits<{
    inscribe: [event: Event]
}>()
</script>

<template>
    <button @click="$emit('inscribe', $event)" :disabled="orderingState !== OrderingState.None"
        class="mx-0 min-w-[13.3rem] py-2 px-4 text-lg text-center transition-transform duration-200 hover:scale-110 bg-white text-black cursor-pointer z-10 rounded-xl disabled:opacity-50 disabled:cursor-wait disabled:hover:scale-100">
        {{ textByStatus[orderingState] }}
    </button>
</template>