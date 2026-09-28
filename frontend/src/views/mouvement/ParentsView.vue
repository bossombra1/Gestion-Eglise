<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import SearchInput from '@/components/molecules/SearchInput.vue'
import EmptyState from '@/components/molecules/EmptyState.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import { useMouvementStore } from '@/stores/mouvement'
import type { MovementParentWithChildren } from '@/types/mouvement'

const store = useMouvementStore()
const search = ref('')
const movementId = ref('')
const selectedParent = ref<MovementParentWithChildren | null>(null)
const movements = computed(() => store.dashboard?.movements ?? (store.movement ? [store.movement] : []))

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return store.parents
  return store.parents.filter((parent) => {
    const parentText = ${parent.firstName} ${parent.lastName} ${parent.phone ?? ''} ${parent.email ?? ''}.toLowerCase()
    const childText = parent.children.map((child) => ${child.firstName} ${child.lastName}).join(' ').toLowerCase()
    return parentText.includes(q) || childText.includes(q)
  })
})

const totalChildren = computed(() => new Set(store.parents.flatMap((parent) => parent.children.map((child) => child.id))).size)
const parentsWithEmail = computed(() => store.parents.filter((parent) => parent.email).length)
const parentsWithPhone = computed(() => store.parents.filter((parent) => parent.phone).length)

async function load() {
  try { await store.loadParents(movementId.value ? { movementId: movementId.value } : undefined) } catch {}
}
function openParent(parent: MovementParentWithChildren) { selectedParent.value = parent }
function closeParent() { selectedParent.value = null }
function relationshipLabel(value?: string | null) {
  if (!value) return 'Lien non précisé'
  const labels: Record<string, string> = { FATHER: 'Père', MOTHER: 'Mère', GUARDIAN: 'Tuteur', OTHER: 'Autre' }
  return labels[value.toUpperCase()] ?? value
}
function formatMovementNames(child: MovementParentWithChildren['children'][number]) {
  return child.movements.map((movement) => movement.name).join(', ') || '—'
}
onMounted(async () => { await Promise.all([store.loadDashboard(), load()]) })
watch(movementId, load)
</script>

<template>
<section class="space-y-6">
<header class="border-b border-[#C2BAB0] pb-5">
<p class="eyebrow text-[#C25A34]">Gestion du mouvement</p>
<h1 class="page-title mt-1 text-4xl text-[#0B1F3A]">Parents</h1>
<p class="mt-2 text-[#6B655D]">Retrouvez les parents associés aux enfants de vos mouvements, avec leur périmètre d’activité.</p>
</header>

<div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
<SearchInput v-model="search" placeholder="Parent, enfant, téléphone ou e-mail…" />
<select v-model="movementId" class="min-h-10 border border-[#C2BAB0] bg-white px-3 text-sm">
<option value="">Tous mes mouvements</option>
<option v-for="m in movements" :key="m.id" :value="m.id">${m.name}</option>
</select>
</div>

<div class="grid gap-3 sm:grid-cols-3">
<article class="border border-[#C2BAB0] bg-white p-4"><p class="text-xs font-semibold uppercase tracking-wide text-[#6B655D]">Parents</p><p class="mt-1 text-2xl font-bold text-[#0B1F3A]">${store.parents.length}</p><p class="mt-1 text-xs text-[#6B655D]">Parents actifs dans le périmètre</p></article>
<article class="border border-[#C2BAB0] bg-white p-4"><p class="text-xs font-semibold uppercase tracking-wide text-[#6B655D]">Enfants rattachés</p><p class="mt-1 text-2xl font-bold text-[#0B1F3A]">${totalChildren}</p><p class="mt-1 text-xs text-[#6B655D]">Enfants distincts associés</p></article>
<article class="border border-[#C2BAB0] bg-white p-4"><p class="text-xs font-semibold uppercase tracking-wide text-[#6B655D]">Contacts</p><p class="mt-1 text-2xl font-bold text-[#0B1F3A]">${parentsWithPhone}/${parentsWithEmail}</p><p class="mt-1 text-xs text-[#6B655D]">Téléphone / e-mail renseignés</p></article>
</div>

<div v-if="store.loading" class="flex min-h-40 items-center justify-center"><AppSpinner /></div>

<div v-else-if="filtered.length" class="overflow-hidden border border-[#C2BAB0] bg-white">
<div class="hidden overflow-x-auto md:block">
<table class="w-full text-left text-sm">
<thead class="bg-[#F7F5F2] text-xs uppercase tracking-wide text-[#6B655D]"><tr>
<th class="px-5 py-4">Parent</th><th class="px-5 py-4">Contact</th><th class="px-5 py-4">Enfants</th><th class="px-5 py-4">Mouvements</th><th class="px-5 py-4">Statut</th><th class="px-5 py-4 text-right">Action</th>
</tr></thead>
<tbody>
<tr v-for="parent in filtered" :key="parent.id" class="border-t border-[#EDE9E4] transition hover:bg-[#F7F5F2]">
<td class="px-5 py-4 font-semibold text-[#14345E]">${parent.firstName} ${parent.lastName}</td>
<td class="px-5 py-4"><p>${parent.phone || '—'}</p><p class="text-xs text-[#6B655D]">${parent.email || '—'}</p></td>
<td class="px-5 py-4 font-medium">${parent.children.length}</td>
<td class="px-5 py-4"><div class="flex flex-wrap gap-1"><span v-for="child in parent.children.slice(0, 2)" :key="child.id" class="rounded-full bg-[#EDE9E4] px-2 py-1 text-xs text-[#2E2925]">${formatMovementNames(child)}</span><span v-if="parent.children.length > 2" class="text-xs text-[#6B655D]">+${parent.children.length - 2}</span></div></td>
<td class="px-5 py-4"><AppBadge tone="success">Actif</AppBadge></td>
<td class="px-5 py-4 text-right"><button type="button" class="border border-[#24548F] px-3 py-2 text-xs font-semibold text-[#24548F] hover:bg-[#F7F5F2]" @click="openParent(parent)">Voir la fiche</button></td>
</tr>
</tbody></table></div>

<div class="divide-y divide-[#EDE9E4] md:hidden">
<article v-for="parent in filtered" :key="parent.id" class="p-5">
<div class="flex items-start justify-between gap-3"><div><p class="font-semibold text-[#14345E]">${parent.firstName} ${parent.lastName}</p><p class="mt-1 text-sm text-[#6B655D]">${parent.phone || 'Téléphone non renseigné'}</p><p class="text-sm text-[#6B655D]">${parent.email || 'E-mail non renseigné'}</p></div><AppBadge tone="success">Actif</AppBadge></div>
<div class="mt-4 flex items-center justify-between"><p class="text-sm"><span class="font-semibold">${parent.children.length}</span> enfant(s)</p><button type="button" class="text-sm font-semibold text-[#24548F]" @click="openParent(parent)">Voir la fiche →</button></div>
</article></div></div>

<EmptyState v-else title="Aucun parent trouvé" description="Aucun parent ne correspond à la recherche ou au mouvement sélectionné." />

<div v-if="selectedParent" class="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1F3A]/45 p-4" @click.self="closeParent">
<article class="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-[#F7F5F2] shadow-2xl">
<header class="sticky top-0 flex items-start justify-between gap-4 border-b border-[#C2BAB0] bg-white px-6 py-5">
<div><p class="eyebrow text-[#C25A34]">Fiche parent</p><h2 class="mt-1 text-2xl font-bold text-[#0B1F3A]">${selectedParent.firstName} ${selectedParent.lastName}</h2></div>
<button type="button" class="text-2xl text-[#6B655D]" aria-label="Fermer" @click="closeParent">×</button>
</header>
<div class="space-y-5 p-6">
<section class="grid gap-3 sm:grid-cols-2">
<div class="border border-[#DDD7CF] bg-white p-4"><p class="text-xs uppercase tracking-wide text-[#6B655D]">Téléphone</p><p class="mt-1 font-medium">${selectedParent.phone || 'Non renseigné'}</p></div>
<div class="border border-[#DDD7CF] bg-white p-4"><p class="text-xs uppercase tracking-wide text-[#6B655D]">E-mail</p><p class="mt-1 break-all font-medium">${selectedParent.email || 'Non renseigné'}</p></div>
</section>
<section class="border border-[#DDD7CF] bg-white">
<div class="border-b border-[#EDE9E4] px-5 py-4"><h3 class="font-semibold text-[#14345E]">Enfants associés</h3></div>
<div v-if="selectedParent.children.length" class="divide-y divide-[#EDE9E4]">
<article v-for="child in selectedParent.children" :key="child.id" class="p-5">
<div class="flex flex-wrap items-start justify-between gap-3"><div><p class="font-semibold">${child.firstName} ${child.lastName}</p><p class="mt-1 text-sm text-[#6B655D]">${relationshipLabel(child.relationship)}</p></div><AppBadge :tone="child.isPrimary ? 'success' : 'neutral'">${child.isPrimary ? 'Responsable principal' : 'Contact associé'}</AppBadge></div>
<div class="mt-3 flex flex-wrap gap-2"><span v-for="movement in child.movements" :key="movement.id" class="rounded-full border border-[#C2BAB0] px-2.5 py-1 text-xs text-[#2E2925]">${movement.name}</span></div>
</article>
</div>
<p v-else class="p-5 text-sm text-[#6B655D]">Aucun enfant associé dans votre périmètre.</p>
</section>
<div class="flex justify-end"><button type="button" class="border border-[#24548F] px-4 py-2 text-sm font-semibold text-[#24548F]" @click="closeParent">Fermer</button></div>
</div></article></div>
</section>
</template>