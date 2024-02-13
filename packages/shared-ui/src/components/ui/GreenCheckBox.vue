<script setup lang="ts">
defineProps({
    modelValue: Boolean,
})
defineEmits<{
    'update:modelValue': [value: boolean]
}>()
</script>
<template>
    <img v-if="!modelValue" class="w-6 h-6" src="../../assets/images/green-check-box-unchecked.png" alt=""
        role="presentation">
    <img v-else class="w-6 h-6" src="../../assets/images/green-check-box-checked.png" alt="" role="presentation">
    <input @change="$emit('update:modelValue', !modelValue)" :checked="modelValue" class="w-6" hidden type="checkbox">
</template>