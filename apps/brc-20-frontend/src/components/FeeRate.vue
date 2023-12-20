<script setup lang="ts">

const { isSelected, label, value } = defineProps({
    isSelected: Boolean,
    label: String,
    value: Number,
    time: String,
})

const emit = defineEmits(['selectedFee'])

</script>
<template>
    <div class="bg-[#1D1D1D] flex flex-col items-center justify-center rounded-md p-4 cursor-pointer"
        :class="isSelected ? 'border-2 border-white bg-[#2C2C2C]' : ''" @click="$emit('selectedFee')">
        <b>{{ label }}</b>
        <span class="text-[#5a5a5a] text-center text-sm">{{ value }} sats/vByte</span>
        <p class="mt-4 text-[#5a5a5a] text-center text-sm">{{ time }}</p>
    </div>
</template>