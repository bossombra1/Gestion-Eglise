<template>
  <div class="flex min-h-screen flex-col bg-[#F7F5F2] lg:h-screen lg:flex-row lg:overflow-hidden">
    <AppSidebar />
    <div class="flex min-w-0 min-h-0 flex-1 flex-col">
      <AppHeader />
      <main class="min-h-0 flex-1 overflow-y-auto">
        <div class="app-container py-5 sm:py-7">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/organisms/AppHeader.vue'
import AppSidebar from '@/components/organisms/AppSidebar.vue'
</script>
