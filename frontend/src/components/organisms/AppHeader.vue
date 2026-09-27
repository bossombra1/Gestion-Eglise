<script setup lang="ts">
import { computed } from 'vue'
import { Bell, LogOut } from 'lucide-vue-next'
import AppButton from '@/components/atoms/AppButton.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const fullName = computed(() => auth.user ? `${auth.user.firstName} ${auth.user.lastName}`.trim() : 'Utilisateur')
</script>

<template>
  <header class="flex min-h-16 items-center justify-between border-b border-[#C2BAB0] bg-white px-6">
    <div>
      <p class="eyebrow text-[#C25A34]">Espace responsable</p>
      <p class="text-sm text-[#6B655D]">Gestion de votre mouvement</p>
    </div>
    <div class="flex items-center gap-4">
      <button class="rounded p-2 text-[#4A443E] hover:bg-[#F2EFEA]" aria-label="Notifications"><Bell class="size-5" /></button>
      <div class="hidden text-right sm:block">
        <p class="text-sm font-semibold">{{ fullName }}</p>
        <p class="text-xs text-[#6B655D]">Responsable de mouvement</p>
      </div>
      <AppButton variant="ghost" @click="auth.logout(); $router.push('/')">
        <LogOut class="size-4" /> Déconnexion
      </AppButton>
    </div>
  </header>
</template>
