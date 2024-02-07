<template>
  <div class="relative">
    <video :src="source" controls></video>
  </div>
</template>
<script lang="ts" setup>

defineProps<{
  source: string,
}>()


</script>