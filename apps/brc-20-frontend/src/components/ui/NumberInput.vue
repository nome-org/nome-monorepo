<script setup lang="ts">
import { ref } from 'vue';

const {
    className,
    modelValue,
    placeholder
} = defineProps({
    modelValue: Number,
    className: String,
    placeholder: String
})

const emit = defineEmits(['update:modelValue'])
const formattedNumber = ref(String(modelValue))

const handleChange = (e: Event) => {
    let value = Number((e.target as HTMLInputElement).value.replace(/,/g, ''))
    // format number with commas
    // ensure value is a number
    if (!isNaN(Number(value))) {
        emit('update:modelValue', value)
    }
    formattedNumber.value = String(value).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}
</script>

<template>
    <input type="text" :placeholder="placeholder" :class="className" :value="formattedNumber" @input="handleChange" />
</template>