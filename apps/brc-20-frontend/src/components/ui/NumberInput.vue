<script setup lang="ts">
import { ref } from 'vue';
import { formatNumber } from '../../util/formatNumber';

const {
    className,
    modelValue,
    placeholder,
    min,
    max
} = defineProps({
    modelValue: Number,
    className: String,
    placeholder: String,
    min: Number,
    max: Number
})

const emit = defineEmits(['update:modelValue'])
const formattedNumber = ref(String(modelValue))
const isInValidRange = (value: number) => {
    let minimum = min || 0
    let maximum = max || Infinity
    return value >= minimum && value <= maximum
}
const handleChange = (e: Event) => {
    let value = Number((e.target as HTMLInputElement).value.replace(/,/g, ''))
    // format number with commas
    // ensure value is a number
    if (
        !isNaN(value)
        && isInValidRange(value)
    ) {
        emit('update:modelValue', value)
        formattedNumber.value = formatNumber(value)
    }
}
</script>

<template>
    <input type="text" :placeholder="placeholder" :class="className" :value="formattedNumber" @input="handleChange" />
</template>