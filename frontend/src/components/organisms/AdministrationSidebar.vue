<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  BarChart3,
  Bell,
  BookOpen,
  Heart,
  LayoutDashboard,
  MessageSquare,
  Megaphone,
  Settings,
  X,
} from 'lucide-vue-next'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const items = [
  { to: '/administration/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/administration/intentions', label: 'Intentions', icon: Megaphone },
  { to: '/administration/registres', label: 'Registres', icon: BookOpen },
  { to: '/administration/bans', label: 'Bans de mariage', icon: Heart },
  { to: '/administration/rapports-mouvements', label: 'Rapports des mouvements', icon: BarChart3 },
  { to: '/administration/communications', label: 'Communication', icon: MessageSquare },
  { to: '/administration/parametres', label: 'Paramètres', icon: Settings },
]
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-40 bg-[#0B1F3A]/45 lg:hidden" aria-hidden="true" @click="emit('close')" />

  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-[min(86vw,330px)] flex-col bg-[#0B1F3A] text-white shadow-2xl transition-transform duration-200 lg:static lg:z-auto lg:h-screen lg:w-72 lg:translate-x-0 lg:shadow-none"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
    aria-label="Menu Administration"
  >
    <div class="flex shrink-0 items-center justify-between gap-4 border-b border-white/15 px-4 py-4 sm:px-5 lg:block lg:px-5 lg:py-5">
      <div class="min-w-0">
        <p class="truncate font-serif text-xl font-semibold sm:text-2xl">EcclesiaConnect</p>
        <p class="mt-1 truncate text-[10px] uppercase tracking-[.12em] text-[#C3D0E1] sm:text-xs sm:tracking-[.16em]">Administration</p>
      </div>
      <button class="touch-target flex shrink-0 items-center justify-center rounded text-[#D7E0EC] hover:bg-white/10 lg:hidden" aria-label="Fermer le menu" @click="emit('close')">
        <X class="size-5" />
      </button>
      <span class="mt-3 hidden rounded-full border border-white/15 px-2 py-1 text-[10px] text-[#AFC0D6] lg:inline-block">Supervision paroissiale</span>
    </div>

    <nav class="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Navigation Administration">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex min-h-11 shrink-0 items-center gap-3 rounded px-3 text-sm font-medium text-[#D7E0EC] transition hover:bg-white/10 hover:text-white"
        active-class="bg-[#C25A34] text-white"
        @click="emit('close')"
      >
        <component :is="item.icon" class="size-4 shrink-0" />
        <span class="whitespace-nowrap">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="hidden shrink-0 border-t border-white/15 p-4 text-xs leading-5 text-[#AFC0D6] lg:block">
      Vue consolidée de la paroisse · les mouvements gardent leur gestion opérationnelle
    </div>
  </aside>
</template>
