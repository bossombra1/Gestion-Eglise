<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'neutral' | 'success' | 'warning' | 'danger' }>(), { tone: 'neutral' })
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
    :class="{
      'bg-[#EDE9E4] text-[#4A443E]': tone === 'neutral',
      'bg-[#E4F2E9] text-[#14713C]': tone === 'success',
      'bg-[#FFF0D6] text-[#8A5200]': tone === 'warning',
      'bg-[#FCE5E3] text-[#B3261E]': tone === 'danger',
    }"
  ><slot /></span>
</template>
