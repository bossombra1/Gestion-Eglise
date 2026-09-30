<script setup lang="ts">
import { computed } from 'vue'
import { Bell, LogOut } from 'lucide-vue-next'
import AppButton from '@/components/atoms/AppButton.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const fullName = computed(() => auth.user ? `${auth.user.firstName} ${auth.user.lastName}`.trim() : 'Utilisateur')
</script>

<template>
  <header class="flex min-h-16 flex-wrap items-center justify-between gap-2 border-b border-[#C2BAB0] bg-white px-3 py-3 sm:px-5 lg:flex-nowrap lg:px-6">
    <div class="min-w-0">
      <p class="eyebrow truncate text-[#C25A34]">Espace responsable</p>
      <p class="truncate text-xs text-[#6B655D] sm:text-sm">Gestion de votre mouvement</p>
    </div>

    <div class="flex min-w-0 items-center gap-1 sm:gap-2 lg:gap-4">
      <button class="touch-target flex items-center justify-center rounded p-2 text-[#4A443E] hover:bg-[#F2EFEA]" aria-label="Notifications">
        <Bell class="size-5" />
      </button>

      <div class="hidden min-w-0 text-right sm:block">
        <p class="max-w-40 truncate text-sm font-semibold lg:max-w-56">{{ fullName }}</p>
        <p class="truncate text-xs text-[#6B655D]">Responsable de mouvement</p>
      </div>

      <AppButton variant="ghost" class="shrink-0" @click="auth.logout(); $router.push('/')">
        <LogOut class="size-4" />
        <span class="hidden sm:inline">Déconnexion</span>
        <span class="sm:hidden">Sortir</span>
      </AppButton>
    </div>
  </header>
</template>
