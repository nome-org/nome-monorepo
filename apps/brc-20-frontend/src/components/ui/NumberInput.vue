<script setup lang="ts">
import { ref } from 'vue';
import { formatNumber } from '../../util/formatNumber';

const {
    className,
    placeholder,
} = defineProps({
    modelValue: Number,
    className: String,
    placeholder: String,
    min: Number,
    max: Number
})

const emit = defineEmits(['update:modelValue'])
const formattedNumber = ref("")
const handleChange = (e: Event) => {
    let value = Number((e.target as HTMLInputElement).value.replace(/,/g, ''))
    // format number with commas
    // ensure value is a number
    if (
        !isNaN(value)
    ) {
        emit('update:modelValue', value)
        formattedNumber.value = formatNumber(value)
    }
}
</script>

<template>
    <input type="text" :placeholder="placeholder" :class="className" :value="formattedNumber" @input="handleChange" />
</template>