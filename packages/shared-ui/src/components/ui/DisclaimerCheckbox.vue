<script setup lang="ts">
import GreenCheckBox from './GreenCheckBox.vue';
defineProps({
    modelValue: Boolean,
    text: String
})
defineEmits<{
    'update:modelValue': [value: boolean]
}>()

</script>
<template>
    <label class="flex gap-x-6 items-center">
        <GreenCheckBox @update:model-value="$emit('update:modelValue', $event)" :model-value="modelValue" />
        {{ text }}
    </label>
</template>