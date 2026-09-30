<script setup lang="ts">
import { computed } from 'vue'
import { Bell, LogOut, Menu } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineEmits<{ menu: [] }>()
const auth = useAuthStore()
const router = useRouter()
const fullName = computed(() => auth.user ? `${auth.user.firstName} ${auth.user.lastName}`.trim() : 'Utilisateur')
const today = computed(() => new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()))

function logout() {
  auth.logout()
  router.push('/connexion')
}
</script>

<template>
  <header class="flex min-h-[64px] items-center gap-3 border-b border-[#DDD7CF] bg-white px-4 sm:px-5">
    <button class="touch-target flex shrink-0 items-center justify-center rounded text-[#0B1F3A] hover:bg-[#F2EFEA] lg:hidden" aria-label="Ouvrir le menu" @click="$emit('menu')">
      <Menu class="size-6" />
    </button>

    <div class="min-w-0">
      <p class="text-[20px] font-bold leading-tight text-[#2E2925]">{{ today }}</p>
      <p class="text-[13.5px] text-[#6B655D]">Accueil de la paroisse · Synchronisation active</p>
    </div>

    <div class="ml-auto flex items-center gap-2.5">
      <button class="touch-target flex items-center justify-center rounded p-2 text-[#4A443E] hover:bg-[#F2EFEA]" aria-label="Notifications">
        <Bell class="size-5" />
      </button>

      <div class="hidden text-right sm:block">
        <p class="max-w-44 truncate text-sm font-semibold text-[#2E2925]">{{ fullName }}</p>
        <p class="text-xs text-[#6B655D]">{{ auth.user?.role === 'SUPER_ADMIN' ? 'Super administrateur' : 'Secrétariat' }}</p>
      </div>

      <button
        type="button"
        class="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#DDD7CF] bg-white px-3 text-sm font-semibold text-[#4A443E] transition hover:border-[#B9B0A6] hover:bg-[#F7F5F2]"
        aria-label="Se déconnecter"
        title="Se déconnecter"
        @click="logout"
      >
        <LogOut class="size-4" />
        <span class="hidden sm:inline">Déconnexion</span>
      </button>
    </div>
  </header>
</template>
