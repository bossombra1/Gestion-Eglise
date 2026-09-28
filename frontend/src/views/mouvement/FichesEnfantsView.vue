<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import SearchInput from '@/components/molecules/SearchInput.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'
import EmptyState from '@/components/molecules/EmptyState.vue'
import { useMouvementStore } from '@/stores/mouvement'

const store = useMouvementStore()
const search = ref('')
const movementId = ref('')

const movements = computed(() => store.dashboard?.movements ?? (store.movement ? [store.movement] : []))

const filteredChildren = computed(() => {
  const query = search.value.trim().toLowerCase()

  return store.children.filter((child) => {
    if (movementId.value && child.movement?.id !== movementId.value) return false
    if (!query) return true

    return (
      `${child.firstName} ${child.lastName}`.toLowerCase().includes(query)
      || child.parentLinks?.some((link) =>
        `${link.parent.firstName} ${link.parent.lastName}`.toLowerCase().includes(query),
      )
    )
  })
})

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('fr-FR') : '—'

const calculateAge = (value?: string | null) => {
  if (!value) return '—'
  const birth = new Date(value)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const month = today.getMonth() - birth.getMonth()
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age--
  return age >= 0 ? `${age} an${age > 1 ? 's' : ''}` : '—'
}

const statusLabel = (status?: string) => ({
  PENDING: 'En attente',
  APPROVED: 'Approuvée',
  REJECTED: 'Refusée',
  CANCELLED: 'Annulée',
  COMPLETED: 'Terminée',
}[status ?? ''] ?? status ?? '—')

const statusTone = (status?: string): 'neutral' | 'success' | 'warning' | 'danger' => {
  if (status === 'APPROVED' || status === 'COMPLETED') return 'success'
  if (status === 'PENDING') return 'warning'
  if (status === 'REJECTED' || status === 'CANCELLED') return 'danger'
  return 'neutral'
}

async function openChild(id: string) {
  try {
    await store.loadChild(id)
  } catch {
    // L'état d'erreur est déjà exposé par le store.
  }
}

function closeDetail() {
  store.clearSelectedChild()
}

async function refresh() {
  try {
    await Promise.all([store.loadDashboard(), store.loadChildren()])
  } catch {
    // L'état d'erreur est déjà exposé par le store.
  }
}

onMounted(refresh)
</script>

<template>
  <section class="space-y-6">
    <header class="border-b border-[#C2BAB0] pb-5">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="eyebrow text-[#C25A34]">Gestion du mouvement</p>
          <h1 class="mt-1 font-serif text-3xl font-semibold text-[#2E2925]">Fiches enfants</h1>
          <p class="mt-2 text-sm text-[#6B655D]">Consultez les informations personnelles, familiales et d'inscription des enfants.</p>
        </div>
        <AppButton variant="secondary" :disabled="store.loading" @click="refresh">Actualiser</AppButton>
      </div>
    </header>

    <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px_auto]">
      <SearchInput v-model="search" placeholder="Rechercher un enfant ou un parent…" />
      <select v-model="movementId" class="min-h-10 w-full border border-[#C2BAB0] bg-white px-3 text-sm text-[#2E2925] outline-none focus:border-[#24548F]">
        <option value="">Tous mes mouvements</option>
        <option v-for="item in movements" :key="item.id" :value="item.id">{{ item.name }}</option>
      </select>
      <div class="flex min-h-10 items-center border border-[#DDD7CF] bg-[#F7F5F2] px-4 text-sm text-[#6B655D]">
        {{ filteredChildren.length }} fiche{{ filteredChildren.length > 1 ? 's' : '' }}
      </div>
    </div>

    <div v-if="store.error" class="border border-[#E3B8B4] bg-[#FFF5F4] px-4 py-3 text-sm text-[#B3261E]">
      {{ store.error }}
    </div>

    <div v-if="store.loading" class="flex min-h-48 items-center justify-center border border-[#DDD7CF] bg-white">
      <AppSpinner />
    </div>

    <div v-else-if="filteredChildren.length" class="overflow-hidden border border-[#C2BAB0] bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[980px] text-left text-sm">
          <thead class="border-b border-[#DDD7CF] bg-[#F7F5F2] text-xs uppercase tracking-wide text-[#6B655D]">
            <tr>
              <th class="px-4 py-3">Enfant</th><th class="px-4 py-3">Âge</th><th class="px-4 py-3">Mouvement</th>
              <th class="px-4 py-3">Parents</th><th class="px-4 py-3">Contact principal</th><th class="px-4 py-3">Inscription</th>
              <th class="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="child in filteredChildren" :key="`${child.id}-${child.movement?.id ?? 'all'}`" class="border-b border-[#EDE9E4] last:border-0 hover:bg-[#FCFBF9]">
              <td class="px-4 py-4">
                <p class="font-semibold text-[#14345E]">{{ child.firstName }} {{ child.lastName }}</p>
                <p class="mt-0.5 text-xs text-[#6B655D]">{{ child.gender || 'Genre non renseigné' }}</p>
              </td>
              <td class="px-4 py-4 text-[#6B655D]"><span class="font-medium text-[#2E2925]">{{ calculateAge(child.birthDate) }}</span><span class="block text-xs">{{ formatDate(child.birthDate) }}</span></td>
              <td class="px-4 py-4"><AppBadge>{{ child.movement?.name ?? '—' }}</AppBadge></td>
              <td class="px-4 py-4">{{ child.parentLinks?.length ?? 0 }}</td>
              <td class="px-4 py-4">
                <div v-if="child.parentLinks?.[0]?.parent" class="space-y-0.5">
                  <p class="font-medium">{{ child.parentLinks[0].parent.firstName }} {{ child.parentLinks[0].parent.lastName }}</p>
                  <p class="text-xs text-[#6B655D]">{{ child.parentLinks[0].parent.phone || child.parentLinks[0].parent.email || 'Contact non renseigné' }}</p>
                </div>
                <span v-else class="text-[#6B655D]">—</span>
              </td>
              <td class="px-4 py-4"><AppBadge :tone="statusTone(child.registrationStatus)">{{ statusLabel(child.registrationStatus) }}</AppBadge></td>
              <td class="px-4 py-4 text-right"><AppButton variant="secondary" @click="openChild(child.id)">Voir la fiche</AppButton></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <EmptyState v-else title="Aucune fiche enfant" description="Aucun enfant ne correspond aux filtres sélectionnés." />

    <div v-if="store.selectedChild" class="fixed inset-0 z-50 flex items-end justify-center bg-[#0B1F3A]/40 p-0 md:items-center md:p-6" @click.self="closeDetail">
      <aside class="max-h-[92vh] w-full max-w-5xl overflow-y-auto border border-[#C2BAB0] bg-[#F7F5F2] shadow-xl">
        <div class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#DDD7CF] bg-white px-5 py-4">
          <div class="min-w-0">
            <p class="eyebrow text-[#C25A34]">Fiche enfant</p>
            <h2 class="mt-1 font-serif text-2xl font-semibold text-[#14345E]">{{ store.selectedChild.firstName }} {{ store.selectedChild.lastName }}</h2>
            <p class="mt-1 text-sm text-[#6B655D]">{{ calculateAge(store.selectedChild.birthDate) }} · {{ store.selectedChild.gender || 'Genre non renseigné' }}</p>
          </div>
          <AppButton variant="ghost" @click="closeDetail">Fermer</AppButton>
        </div>

        <div v-if="store.childDetailLoading" class="flex min-h-60 items-center justify-center"><AppSpinner /></div>

        <div v-else class="grid gap-4 p-5 lg:grid-cols-2">
          <section class="border border-[#DDD7CF] bg-white p-5">
            <h3 class="font-semibold text-[#2E2925]">Informations personnelles</h3>
            <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt class="text-[#6B655D]">Nom complet</dt><dd class="font-medium">{{ store.selectedChild.firstName }} {{ store.selectedChild.lastName }}</dd></div>
              <div><dt class="text-[#6B655D]">Date de naissance</dt><dd class="font-medium">{{ formatDate(store.selectedChild.birthDate) }}</dd></div>
              <div><dt class="text-[#6B655D]">Âge</dt><dd class="font-medium">{{ calculateAge(store.selectedChild.birthDate) }}</dd></div>
              <div><dt class="text-[#6B655D]">Genre</dt><dd class="font-medium">{{ store.selectedChild.gender || 'Non renseigné' }}</dd></div>
              <div class="sm:col-span-2"><dt class="text-[#6B655D]">Contact d'urgence</dt><dd class="font-medium">{{ store.selectedChild.emergencyContactName || 'Non renseigné' }}</dd></div>
              <div class="sm:col-span-2"><dt class="text-[#6B655D]">Téléphone d'urgence</dt><dd class="font-medium">{{ store.selectedChild.emergencyContactPhone || 'Non renseigné' }}</dd></div>
            </dl>
          </section>

          <section class="border border-[#DDD7CF] bg-white p-5">
            <h3 class="font-semibold text-[#2E2925]">Famille</h3>
            <div v-if="store.selectedChild.family" class="mt-4 space-y-2 text-sm">
              <p class="font-semibold text-[#14345E]">{{ store.selectedChild.family.name }}</p>
              <p class="text-[#6B655D]">{{ store.selectedChild.family.address || 'Adresse non renseignée' }}</p>
              <p class="text-[#6B655D]">{{ store.selectedChild.family.phone || store.selectedChild.family.email || 'Contact non renseigné' }}</p>
            </div>
            <p v-else class="mt-4 text-sm text-[#6B655D]">Aucune famille rattachée.</p>
          </section>

          <section class="border border-[#DDD7CF] bg-white p-5 lg:col-span-2">
            <div class="flex items-center justify-between gap-3">
              <h3 class="font-semibold text-[#2E2925]">Parents / responsables</h3>
              <span class="text-xs text-[#6B655D]">{{ store.selectedChild.parentLinks.length }} responsable{{ store.selectedChild.parentLinks.length > 1 ? 's' : '' }}</span>
            </div>
            <div v-if="store.selectedChild.parentLinks.length" class="mt-4 grid gap-3 md:grid-cols-2">
              <article v-for="link in store.selectedChild.parentLinks" :key="link.parent.id" class="border border-[#EDE9E4] p-4">
                <div class="flex items-center justify-between gap-3">
                  <p class="font-semibold">{{ link.parent.firstName }} {{ link.parent.lastName }}</p>
                  <AppBadge v-if="link.isPrimary">Principal</AppBadge>
                </div>
                <p class="mt-1 text-xs text-[#6B655D]">{{ link.relationship || 'Responsable' }}</p>
                <p class="mt-3 text-sm">{{ link.parent.phone || 'Téléphone non renseigné' }}</p>
                <p class="text-sm text-[#6B655D]">{{ link.parent.email || 'E-mail non renseigné' }}</p>
              </article>
            </div>
            <p v-else class="mt-4 text-sm text-[#6B655D]">Aucun responsable rattaché.</p>
          </section>

          <section class="border border-[#DDD7CF] bg-white p-5 lg:col-span-2">
            <h3 class="font-semibold text-[#2E2925]">Inscriptions dans vos mouvements</h3>
            <div v-if="store.selectedChild.registrations.length" class="mt-4 overflow-x-auto">
              <table class="w-full min-w-[620px] text-left text-sm">
                <thead class="border-b border-[#DDD7CF] text-xs uppercase tracking-wide text-[#6B655D]"><tr><th class="px-2 py-3">Mouvement</th><th class="px-2 py-3">Statut</th><th class="px-2 py-3">Date</th><th class="px-2 py-3">Note</th></tr></thead>
                <tbody>
                  <tr v-for="registration in store.selectedChild.registrations" :key="registration.id" class="border-b border-[#EDE9E4] last:border-0">
                    <td class="px-2 py-3 font-medium">{{ registration.movement.name }}</td>
                    <td class="px-2 py-3"><AppBadge :tone="statusTone(registration.status)">{{ statusLabel(registration.status) }}</AppBadge></td>
                    <td class="px-2 py-3 text-[#6B655D]">{{ formatDate(registration.registrationDate) }}</td>
                    <td class="px-2 py-3 text-[#6B655D]">{{ registration.notes || registration.rejectionReason || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="mt-4 text-sm text-[#6B655D]">Aucune inscription.</p>
          </section>

          <section class="border border-[#DDD7CF] bg-white p-5 lg:col-span-2">
            <h3 class="font-semibold text-[#2E2925]">Informations médicales</h3>
            <p class="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#6B655D]">{{ store.selectedChild.medicalInformation || 'Aucune information médicale renseignée.' }}</p>
          </section>
        </div>
      </aside>
    </div>
  </section>
</template>
