<template>
  <div class="flex min-h-screen bg-[#F7F5F2]">
    <AppSidebar />
    <div class="min-w-0 flex-1">
      <AppHeader />
      <main class="app-container py-7">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/organisms/AppHeader.vue'
import AppSidebar from '@/components/organisms/AppSidebar.vue'
</script>
