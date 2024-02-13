<template>
  <div class="relative border">
    <video :src="source" :poster="poster" controls class="aspect-auto"></video>
  </div>
</template>
<script lang="ts" setup>

defineProps<{
  source: string
  poster: string
}>()


</script>