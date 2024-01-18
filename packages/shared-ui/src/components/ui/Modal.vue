<script setup lang="ts">
defineProps({
  isOpen: Boolean,
});
const emit = defineEmits<{
  onVisibilityChange: [event: boolean]
}>();

const close = (e: MouseEvent) => {
  if (e.target !== e.currentTarget) return;
  emit("onVisibilityChange", false);
};
</script>
<template>
  <div v-if="isOpen" @click="close"
    class="fixed top-0 left-0 bg-black bg-opacity-80 w-screen h-screen flex items-center justify-center z-50 overflow-auto">
    <slot></slot>
  </div>
</template>
