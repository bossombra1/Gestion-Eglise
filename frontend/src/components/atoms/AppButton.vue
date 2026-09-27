<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  type?: 'button' | 'submit'
  disabled?: boolean
}>(), { variant: 'primary', type: 'button', disabled: false })
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex min-h-10 items-center justify-center gap-2 rounded px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
    :class="{
      'bg-[#14345E] text-white hover:bg-[#0B1F3A]': variant === 'primary',
      'border border-[#C2BAB0] bg-white text-[#2E2925] hover:bg-[#F2EFEA]': variant === 'secondary',
      'bg-transparent text-[#24548F] hover:bg-[#EDE9E4]': variant === 'ghost',
      'bg-[#B3261E] text-white hover:bg-[#8f1e18]': variant === 'danger',
    }"
  >
    <slot />
  </button>
</template>
