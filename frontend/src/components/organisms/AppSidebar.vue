<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { BarChart3, BookOpen, CalendarCheck, FolderOpen, HeartHandshake, LayoutDashboard, MessageSquare, Users } from 'lucide-vue-next'

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
  <aside class="flex w-full shrink-0 flex-col bg-[#0B1F3A] text-white lg:w-64 lg:border-r lg:border-[#C2BAB0]">
    <div class="border-b border-white/15 px-5 py-4 lg:px-5 lg:py-5">
      <p class="font-serif text-2xl font-semibold">EcclesiaConnect</p>
      <p class="mt-1 text-xs uppercase tracking-[.16em] text-[#C3D0E1]">Responsable de mouvement</p>
    </div>
    <nav class="flex gap-1 overflow-x-auto p-2 lg:flex-1 lg:flex-col lg:space-y-1 lg:overflow-visible lg:p-3" aria-label="Navigation mouvement">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex min-h-10 shrink-0 items-center gap-2 px-3 text-sm text-[#D7E0EC] transition hover:bg-white/10 hover:text-white lg:gap-3"
        active-class="bg-[#C25A34] text-white"
      >
        <component :is="item.icon" class="size-4 shrink-0" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
    <div class="hidden border-t border-white/15 p-4 text-xs text-[#AFC0D6] lg:block">Espace métier isolé · base commune</div>
  </aside>
</template>
