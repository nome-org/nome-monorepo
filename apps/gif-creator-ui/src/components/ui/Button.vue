<template>
    <button @click="$emit('click', $event)" :disabled="disabled"
        class="uppercase bg-white text-black tracking-[0.3em] py-1 px-4 rounded-md transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none"
        :class="className">
        <slot></slot>
    </button>
</template>

<script setup lang="ts">
defineProps<{
    disabled?: boolean
    className?: string
}>()

defineEmits<{
    click: [event: MouseEvent]
}>()
</script>