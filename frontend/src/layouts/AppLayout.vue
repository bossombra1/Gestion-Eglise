<template>
  <div class="flex min-h-screen flex-col bg-[#F7F5F2] lg:flex-row">
    <AppSidebar />
    <div class="min-w-0 flex-1">
      <AppHeader />
      <main class="app-container py-5 sm:py-7">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/organisms/AppHeader.vue'
import AppSidebar from '@/components/organisms/AppSidebar.vue'
</script>
