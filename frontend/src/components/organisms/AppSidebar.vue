<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { BarChart3, BookOpen, CalendarCheck, FolderOpen, HeartHandshake, LayoutDashboard, MessageSquare, Users, X } from 'lucide-vue-next'

defineProps<{ open: boolean }>()

const emit = defineEmits<{ close: [] }>()

const items = [
  { to: '/mouvement/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/mouvement/mon-mouvement', label: 'Mon mouvement', icon: HeartHandshake },
  { to: '/mouvement/enfants', label: 'Enfants inscrits', icon: Users },
  { to: '/mouvement/parents', label: 'Parents', icon: Users },
  { to: '/mouvement/fiches-enfants', label: 'Fiches enfants', icon: BookOpen },
  { to: '/mouvement/inscriptions', label: 'Inscriptions', icon: CalendarCheck },
  { to: '/mouvement/cotisations', label: 'Cotisations', icon: BarChart3 },
  { to: '/mouvement/documents', label: 'Documents', icon: FolderOpen },
  { to: '/mouvement/communications', label: 'Communications', icon: MessageSquare },
]
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-40 bg-[#0B1F3A]/45 lg:hidden" aria-hidden="true" @click="emit('close')" />

  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-[min(84vw,320px)] flex-col bg-[#0B1F3A] text-white shadow-2xl transition-transform duration-200 lg:static lg:z-auto lg:h-screen lg:w-64 lg:translate-x-0 lg:shadow-none"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
    aria-label="Menu principal"
  >
    <div class="flex shrink-0 items-center justify-between gap-4 border-b border-white/15 px-4 py-4 sm:px-5 lg:block lg:px-5 lg:py-5">
      <div class="min-w-0">
        <p class="truncate font-serif text-xl font-semibold sm:text-2xl">EcclesiaConnect</p>
        <p class="mt-1 truncate text-[10px] uppercase tracking-[.12em] text-[#C3D0E1] sm:text-xs sm:tracking-[.16em]">Responsable de mouvement</p>
      </div>
      <button
        class="touch-target flex shrink-0 items-center justify-center rounded text-[#D7E0EC] hover:bg-white/10 lg:hidden"
        aria-label="Fermer le menu"
        @click="emit('close')"
      >
        <X class="size-5" />
      </button>
      <span class="mt-3 hidden rounded-full border border-white/15 px-2 py-1 text-[10px] text-[#AFC0D6] lg:inline-block">Espace métier</span>
    </div>

    <nav class="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Navigation mouvement">
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

    <div class="hidden shrink-0 border-t border-white/15 p-4 text-xs text-[#AFC0D6] lg:block">
      Espace métier isolé · base commune
    </div>
  </aside>
</template>