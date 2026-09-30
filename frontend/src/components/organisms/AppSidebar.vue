<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { BarChart3, BookOpen, CalendarCheck, FolderOpen, HeartHandshake, LayoutDashboard, MessageSquare, Users } from 'lucide-vue-next'

const items = [
  { to: '/mouvement/dashboard', label: 'Tableau de bord', shortLabel: 'Accueil', icon: LayoutDashboard },
  { to: '/mouvement/mon-mouvement', label: 'Mon mouvement', shortLabel: 'Mouvement', icon: HeartHandshake },
  { to: '/mouvement/enfants', label: 'Enfants inscrits', shortLabel: 'Enfants', icon: Users },
  { to: '/mouvement/parents', label: 'Parents', shortLabel: 'Parents', icon: Users },
  { to: '/mouvement/fiches-enfants', label: 'Fiches enfants', shortLabel: 'Fiches', icon: BookOpen },
  { to: '/mouvement/inscriptions', label: 'Inscriptions', shortLabel: 'Inscriptions', icon: CalendarCheck },
  { to: '/mouvement/cotisations', label: 'Cotisations', shortLabel: 'Cotisations', icon: BarChart3 },
  { to: '/mouvement/documents', label: 'Documents', shortLabel: 'Documents', icon: FolderOpen },
  { to: '/mouvement/communications', label: 'Communications', shortLabel: 'Messages', icon: MessageSquare },
]
</script>

<template>
  <aside class="flex w-full shrink-0 flex-col bg-[#0B1F3A] text-white lg:h-screen lg:w-64 lg:overflow-hidden lg:border-r lg:border-[#C2BAB0]">
    <div class="flex shrink-0 items-center justify-between gap-4 border-b border-white/15 px-4 py-3 sm:px-5 sm:py-4 lg:block lg:px-5 lg:py-5">
      <div class="min-w-0">
        <p class="truncate font-serif text-xl font-semibold sm:text-2xl">EcclesiaConnect</p>
        <p class="mt-1 truncate text-[10px] uppercase tracking-[.12em] text-[#C3D0E1] sm:text-xs sm:tracking-[.16em]">Responsable de mouvement</p>
      </div>
      <span class="hidden rounded-full border border-white/15 px-2 py-1 text-[10px] text-[#AFC0D6] lg:inline-block">Espace métier</span>
    </div>

    <nav
      class="flex gap-1 overflow-x-auto p-2 lg:min-h-0 lg:flex-1 lg:flex-col lg:space-y-1 lg:overflow-x-hidden lg:overflow-y-auto lg:p-3"
      aria-label="Navigation mouvement"
    >
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded px-3 text-xs font-medium text-[#D7E0EC] transition hover:bg-white/10 hover:text-white sm:min-h-12 sm:px-4 sm:text-sm lg:min-h-10 lg:justify-start lg:gap-3 lg:px-3"
        active-class="bg-[#C25A34] text-white"
      >
        <component :is="item.icon" class="size-4 shrink-0" />
        <span class="hidden whitespace-nowrap sm:inline lg:inline">{{ item.label }}</span>
        <span class="whitespace-nowrap sm:hidden lg:hidden">{{ item.shortLabel }}</span>
      </RouterLink>
    </nav>

    <div class="hidden shrink-0 border-t border-white/15 p-4 text-xs text-[#AFC0D6] lg:block">
      Espace métier isolé · base commune
    </div>
  </aside>
</template>
