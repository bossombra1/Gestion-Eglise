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

const filteredChildren = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return store.children
  return store.children.filter((child) =>
    `${child.firstName} ${child.lastName}`.toLowerCase().includes(query)
    || child.parentLinks?.some((link) =>
      `${link.parent.firstName} ${link.parent.lastName}`.toLowerCase().includes(query),
    ),
  )
})

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('fr-FR') : '—'

const statusLabel = (status?: string) => ({
  PENDING: 'En attente',
  APPROVED: 'Approuvée',
  REJECTED: 'Refusée',
  CANCELLED: 'Annulée',
  COMPLETED: 'Terminée',
}[status ?? ''] ?? status ?? '—')

async function openChild(id: string) {
  await store.loadChild(id)
}

function closeDetail() {
  store.clearSelectedChild()
}

onMounted(async () => {
  await Promise.all([store.loadDashboard(), store.loadChildren()])
})
</script>

<template>
  <section class="space-y-6">
    <div>
      <p class="eyebrow text-[#C25A34]">Gestion du mouvement</p>
      <h1 class="mt-1 font-serif text-3xl font-semibold text-[#2E2925]">Fiches enfants</h1>
      <p class="mt-2 text-sm text-[#6B655D]">Consultez les informations utiles des enfants inscrits dans vos mouvements.</p>
    </div>

    <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
      <SearchInput v-model="search" placeholder="Rechercher un enfant ou un parent…" />
      <div class="flex items-center border border-[#DDD7CF] bg-[#F7F5F2] px-4 text-sm text-[#6B655D]">
        {{ filteredChildren.length }} fiche{{ filteredChildren.length > 1 ? 's' : '' }}
      </div>
    </div>

    <div v-if="store.loading" class="flex min-h-40 items-center justify-center"><AppSpinner /></div>

    <div v-else-if="filteredChildren.length" class="overflow-hidden border border-[#C2BAB0] bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[820px] text-left text-sm">
          <thead class="border-b border-[#DDD7CF] bg-[#F7F5F2] text-xs uppercase tracking-wide text-[#6B655D]">
            <tr>
              <th class="px-4 py-3">Enfant</th>
              <th class="px-4 py-3">Mouvement</th>
              <th class="px-4 py-3">Naissance</th>
              <th class="px-4 py-3">Parents</th>
              <th class="px-4 py-3">Inscription</th>
              <th class="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="child in filteredChildren"
              :key="`${child.id}-${child.movement?.id ?? 'all'}`"
              class="border-b border-[#EDE9E4] last:border-0"
            >
              <td class="px-4 py-3">
                <p class="font-semibold text-[#2E2925]">{{ child.firstName }} {{ child.lastName }}</p>
                <p class="mt-0.5 text-xs text-[#6B655D]">{{ child.gender || 'Genre non renseigné' }}</p>
              </td>
              <td class="px-4 py-3"><AppBadge>{{ child.movement?.name ?? '—' }}</AppBadge></td>
              <td class="px-4 py-3 text-[#6B655D]">{{ formatDate(child.birthDate) }}</td>
              <td class="px-4 py-3">{{ child.parentLinks?.length ?? 0 }}</td>
              <td class="px-4 py-3">
                <span class="text-xs font-semibold text-[#24548F]">{{ statusLabel(child.registrationStatus) }}</span>
              </td>
              <td class="px-4 py-3 text-right">
                <AppButton size="sm" variant="secondary" @click="openChild(child.id)">Voir la fiche</AppButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <EmptyState v-else title="Aucune fiche enfant" description="Aucun enfant ne correspond à la recherche actuelle." />

    <div v-if="store.selectedChild" class="fixed inset-0 z-50 flex items-end justify-center bg-[#0B1F3A]/40 p-0 md:items-center md:p-6" @click.self="closeDetail">
      <aside class="max-h-[92vh] w-full max-w-4xl overflow-y-auto border border-[#C2BAB0] bg-[#F7F5F2] shadow-xl">
        <div class="sticky top-0 z-10 flex items-start justify-between border-b border-[#DDD7CF] bg-white px-5 py-4">
          <div>
            <p class="eyebrow text-[#C25A34]">Fiche enfant</p>
            <h2 class="mt-1 font-serif text-2xl font-semibold text-[#2E2925]">
              {{ store.selectedChild.firstName }} {{ store.selectedChild.lastName }}
            </h2>
          </div>
          <AppButton variant="ghost" size="sm" @click="closeDetail">Fermer</AppButton>
        </div>

        <div v-if="store.childDetailLoading" class="flex min-h-60 items-center justify-center"><AppSpinner /></div>

        <div v-else class="grid gap-4 p-5 lg:grid-cols-2">
          <section class="border border-[#DDD7CF] bg-white p-5">
            <h3 class="font-semibold text-[#2E2925]">Informations personnelles</h3>
            <dl class="mt-4 grid gap-3 text-sm">
              <div><dt class="text-[#6B655D]">Date de naissance</dt><dd class="font-medium">{{ formatDate(store.selectedChild.birthDate) }}</dd></div>
              <div><dt class="text-[#6B655D]">Genre</dt><dd class="font-medium">{{ store.selectedChild.gender || 'Non renseigné' }}</dd></div>
              <div><dt class="text-[#6B655D]">Contact d'urgence</dt><dd class="font-medium">{{ store.selectedChild.emergencyContactName || 'Non renseigné' }}</dd></div>
              <div><dt class="text-[#6B655D]">Téléphone d'urgence</dt><dd class="font-medium">{{ store.selectedChild.emergencyContactPhone || 'Non renseigné' }}</dd></div>
            </dl>
          </section>

          <section class="border border-[#DDD7CF] bg-white p-5">
            <h3 class="font-semibold text-[#2E2925]">Famille</h3>
            <div v-if="store.selectedChild.family" class="mt-4 space-y-2 text-sm">
              <p class="font-semibold">{{ store.selectedChild.family.name }}</p>
              <p class="text-[#6B655D]">{{ store.selectedChild.family.address || 'Adresse non renseignée' }}</p>
              <p class="text-[#6B655D]">{{ store.selectedChild.family.phone || store.selectedChild.family.email || 'Contact non renseigné' }}</p>
            </div>
            <p v-else class="mt-4 text-sm text-[#6B655D]">Aucune famille rattachée.</p>
          </section>

          <section class="border border-[#DDD7CF] bg-white p-5 lg:col-span-2">
            <h3 class="font-semibold text-[#2E2925]">Parents / responsables</h3>
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
                <thead class="border-b border-[#DDD7CF] text-xs uppercase tracking-wide text-[#6B655D]">
                  <tr><th class="px-2 py-3">Mouvement</th><th class="px-2 py-3">Statut</th><th class="px-2 py-3">Date</th><th class="px-2 py-3">Note</th></tr>
                </thead>
                <tbody>
                  <tr v-for="registration in store.selectedChild.registrations" :key="registration.id" class="border-b border-[#EDE9E4] last:border-0">
                    <td class="px-2 py-3 font-medium">{{ registration.movement.name }}</td>
                    <td class="px-2 py-3">{{ statusLabel(registration.status) }}</td>
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
            <p class="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#6B655D]">
              {{ store.selectedChild.medicalInformation || 'Aucune information médicale renseignée.' }}
            </p>
          </section>
        </div>
      </aside>
    </div>
  </section>
</template>
