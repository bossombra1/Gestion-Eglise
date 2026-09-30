<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { BarChart3, BookOpen, Heart, LayoutDashboard, MessageSquare, Megaphone, Settings, X } from 'lucide-vue-next'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const items = [
  { to: '/administration/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/administration/intentions', label: 'Intentions', icon: Megaphone },
  { to: '/administration/registres', label: 'Registres', icon: BookOpen },
  { to: '/administration/bans', label: 'Bans de mariage', icon: Heart },
  { to: '/administration/rapports-mouvements', label: 'Rapports des mouvements', icon: BarChart3 },
  { to: '/administration/communications', label: 'Communication', icon: MessageSquare },
]
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-40 bg-[#0B1F3A]/45 lg:hidden" aria-hidden="true" @click="emit('close')" />
  <aside class="fixed inset-y-0 left-0 z-50 flex w-[min(86vw,330px)] flex-col bg-[#0B1F3A] text-white shadow-2xl transition-transform duration-200 lg:static lg:z-auto lg:h-screen lg:w-[232px] lg:translate-x-0 lg:shadow-none" :class="open ? 'translate-x-0' : '-translate-x-full'" aria-label="Menu Administration">
    <div class="shrink-0 border-b border-white/10 px-4 py-4">
      <div class="flex items-center gap-2.5">
        <div class="grid size-8 shrink-0 place-items-center text-[#E8A98F]">✝</div>
        <div class="min-w-0"><p class="truncate text-[15px] font-bold text-white">EcclesiaConnect</p><p class="truncate text-[12.5px] text-[#8FA6C4]">Saint-Jean de Cocody</p></div>
        <button class="ml-auto touch-target flex shrink-0 items-center justify-center rounded text-[#D7E0EC] hover:bg-white/10 lg:hidden" aria-label="Fermer le menu" @click="emit('close')"><X class="size-5" /></button>
      </div>
    </div>
    <nav class="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2.5" aria-label="Navigation Administration">
      <RouterLink v-for="item in items" :key="item.to" :to="item.to" class="flex min-h-10 shrink-0 items-center gap-2.5 rounded px-2.5 text-[14.5px] text-[#C3D0E1] transition hover:bg-white/10 hover:text-white" active-class="bg-[#24548F] font-bold text-white" @click="emit('close')">
        <component :is="item.icon" class="size-[19px] shrink-0 text-[#8FA6C4]" /><span class="whitespace-nowrap">{{ item.label }}</span>
      </RouterLink>
      <RouterLink to="/administration/parametres" class="mt-2 flex min-h-10 shrink-0 items-center gap-2.5 rounded border-t border-white/10 px-2.5 pt-2 text-[14.5px] text-[#C3D0E1] transition hover:bg-white/10 hover:text-white" active-class="bg-[#24548F] font-bold text-white" @click="emit('close')">
        <Settings class="size-[19px] shrink-0 text-[#8FA6C4]" /><span>Paramètres</span>
      </RouterLink>
    </nav>
    <div class="shrink-0 border-t border-white/10 px-3.5 py-3">
      <div class="flex items-center gap-2.5"><div class="grid size-8 shrink-0 place-items-center rounded-full bg-[#C25A34] text-[12.5px] font-bold text-white">SB</div><div class="min-w-0"><p class="truncate text-[13.5px] font-semibold text-white">Sœur Brigitte</p><p class="truncate text-[12px] text-[#8FA6C4]">Secrétariat</p></div></div>
    </div>
  </aside>
</template>