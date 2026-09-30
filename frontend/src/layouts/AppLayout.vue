<template>
  <div class="flex min-h-screen min-w-0 flex-col bg-[#F7F5F2] lg:h-screen lg:flex-row lg:overflow-hidden">
    <AppSidebar :open="menuOpen" @close="menuOpen = false" />
    <div class="flex min-h-0 min-w-0 flex-1 flex-col">
      <AppHeader @menu="menuOpen = true" />
      <main class="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div class="app-container py-4 sm:py-6 lg:py-7">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import AppHeader from '@/components/organisms/AppHeader.vue'
import AppSidebar from '@/components/organisms/AppSidebar.vue'

const menuOpen = ref(false)

function closeMenu() {
  menuOpen.value = false
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMenu()
}

watch(menuOpen, (open) => {
  document.body.classList.toggle('overflow-hidden', open)
})

window.addEventListener('keydown', handleEscape)

onBeforeUnmount(() => {
  document.body.classList.remove('overflow-hidden')
  window.removeEventListener('keydown', handleEscape)
})
</script>
