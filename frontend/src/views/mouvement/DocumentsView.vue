<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'
import EmptyState from '@/components/molecules/EmptyState.vue'
import SearchInput from '@/components/molecules/SearchInput.vue'
import { mouvementService } from '@/services/mouvement.service'
import { useMouvementStore } from '@/stores/mouvement'
import type { MovementDocument, MovementDocumentType, MovementSummary } from '@/types/mouvement'

const store = useMouvementStore()
const search = ref('')
const movementId = ref('')
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const previewDocument = ref<MovementDocument | null>(null)
const previewUrl = ref<string | null>(null)
const previewMimeType = ref('')
const previewLoading = ref(false)
const previewError = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const form = ref({
  name: '',
  description: '',
  type: 'GENERAL' as MovementDocumentType,
  file: null as File | null,
})

const movements = computed<MovementSummary[]>(() => store.dashboard?.movements ?? [])
const filteredDocuments = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return store.documents
  return store.documents.filter((document) =>
    document.name.toLowerCase().includes(query) ||
    document.fileName.toLowerCase().includes(query) ||
    document.movement?.name.toLowerCase().includes(query),
  )
})

const formatSize = (size?: number | null) => {
  if (!size) return '—'
  if (size < 1024) return size + ' o'
  if (size < 1024 * 1024) return Math.round(size / 1024) + ' Ko'
  return (size / (1024 * 1024)).toFixed(1) + ' Mo'
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value))

const resetForm = () => {
  form.value = { name: '', description: '', type: 'GENERAL', file: null }
  if (fileInput.value) fileInput.value.value = ''
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  form.value.file = target.files?.[0] ?? null
}

const submit = async () => {
  error.value = null
  success.value = null
  if (!movementId.value) {
    error.value = 'Sélectionnez un mouvement.'
    return
  }
  if (!form.value.file) {
    error.value = 'Sélectionnez un fichier.'
    return
  }
  if (form.value.file.size > 10 * 1024 * 1024) {
    error.value = 'Le fichier dépasse la taille maximale de 10 Mo.'
    return
  }

  saving.value = true
  try {
    await store.uploadDocument({
      movementId: movementId.value,
      name: form.value.name,
      description: form.value.description || undefined,
      type: form.value.type,
      file: form.value.file,
    })
    success.value = 'Document ajouté au mouvement.'
    resetForm()
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Impossible d’ajouter le document.'
  } finally {
    saving.value = false
  }
}

const closePreview = () => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  previewDocument.value = null
  previewMimeType.value = ''
  previewError.value = null
}

const isImagePreview = computed(() => previewMimeType.value.startsWith('image/'))
const isPdfPreview = computed(() => previewMimeType.value === 'application/pdf')
const isTextPreview = computed(() => previewMimeType.value.startsWith('text/'))

const preview = async (item: any) => {
  closePreview()
  previewDocument.value = item
  previewLoading.value = true
  try {
    const { blob } = await mouvementService.downloadDocument(item.id)
    previewMimeType.value = item.mimeType || blob.type || ''
    previewUrl.value = URL.createObjectURL(blob)
  } catch {
    previewError.value = 'Impossible de charger la prévisualisation du document.'
  } finally {
    previewLoading.value = false
  }
}

const downloadPreview = () => {
  if (!previewUrl.value || !previewDocument.value) return
  const anchor = document.createElement('a')
  anchor.href = previewUrl.value
  anchor.download = previewDocument.value.fileName
  anchor.click()
}

const remove = async (id: string) =>
  if (!window.confirm('Supprimer définitivement ce document ?')) return
  error.value = null
  try {
    await store.deleteDocument(id, movementId.value || undefined)
    success.value = 'Document supprimé.'
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Impossible de supprimer le document.'
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await store.loadDashboard()
    movementId.value = movements.value[0]?.id ?? ''
    await store.loadDocuments()
  } catch {
    error.value = 'Impossible de charger les documents.'
  } finally {
    loading.value = false
  }
})

watch(movementId, async (value) => {
  if (!loading.value) await store.loadDocuments(value || undefined)
})
onBeforeUnmount(closePreview)
</script>

<template>
  <section class="space-y-6">
    <div class="border-b border-[#C2BAB0] pb-5">
      <p class="eyebrow text-[#C25A34]">Responsable de mouvement</p>
      <h1 class="page-title mt-1 text-4xl text-[#0B1F3A]">Documents</h1>
      <p class="mt-2 text-[#6B655D]">Ajoutez, consultez et supprimez les documents de vos mouvements.</p>
    </div>

    <div v-if="loading" class="flex min-h-40 items-center justify-center"><AppSpinner /></div>

    <template v-else>
      <div v-if="error" class="border border-[#B3261E] bg-[#FCE5E3] p-4 text-sm text-[#8F1E18]">{{ error }}</div>
      <div v-if="success" class="border border-[#14713C] bg-[#E4F2E9] p-4 text-sm text-[#14713C]">{{ success }}</div>

      <article class="border border-[#C2BAB0] bg-white p-6">
        <div class="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <label class="block text-sm font-semibold">Mouvement
            <select v-model="movementId" required class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal">
              <option value="" disabled>Sélectionner</option>
              <option v-for="movement in movements" :key="movement.id" :value="movement.id">{{ movement.name }}</option>
            </select>
          </label>
          <SearchInput v-model="search" placeholder="Rechercher un document…" />
        </div>

        <form class="mt-5 grid gap-4 md:grid-cols-2" @submit.prevent="submit">
          <label class="block text-sm font-semibold">Nom du document
            <input v-model="form.name" required minlength="2" maxlength="150" class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal" placeholder="Calendrier annuel" />
          </label>
          <label class="block text-sm font-semibold">Type
            <select v-model="form.type" class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal">
              <option value="GENERAL">Général</option>
              <option value="REGISTRATION">Inscription</option>
              <option value="MEDICAL">Médical</option>
              <option value="ADMINISTRATIVE">Administratif</option>
              <option value="FINANCIAL">Financier</option>
              <option value="COMMUNICATION">Communication</option>
              <option value="OTHER">Autre</option>
            </select>
          </label>
          <label class="block text-sm font-semibold md:col-span-2">Description
            <textarea v-model="form.description" rows="2" maxlength="500" class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal" placeholder="Description facultative"></textarea>
          </label>
          <label class="block text-sm font-semibold md:col-span-2">Fichier
            <input ref="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.csv,.txt" required class="mt-1 block w-full border border-[#C2BAB0] bg-white p-3 font-normal" @change="onFileChange" />
            <span class="mt-1 block text-xs font-normal text-[#6B655D]">PDF, images, Word, Excel, CSV ou TXT — 10 Mo maximum.</span>
          </label>
          <div class="md:col-span-2">
            <AppButton type="submit" :disabled="saving || !movementId">{{ saving ? 'Ajout...' : 'Ajouter le document' }}</AppButton>
          </div>
        </form>
      </article>

      <article class="overflow-hidden border border-[#C2BAB0] bg-white">
        <div v-if="store.documentsLoading" class="flex min-h-32 items-center justify-center"><AppSpinner /></div>
        <EmptyState v-else-if="!filteredDocuments.length" title="Aucun document" description="Aucun document ne correspond à votre recherche ou à ce mouvement." />
        <div v-else class="hidden overflow-x-auto md:block">
          <table class="min-w-[850px] w-full text-left text-sm">
            <thead class="border-b border-[#DDD7CF] bg-[#F7F5F2] text-xs uppercase tracking-wide text-[#6B655D]">
              <tr>
                <th class="px-5 py-4">Document</th>
                <th class="px-5 py-4">Mouvement</th>
                <th class="px-5 py-4">Type</th>
                <th class="px-5 py-4">Taille</th>
                <th class="px-5 py-4">Ajouté le</th>
                <th class="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredDocuments" :key="item.id" class="border-t border-[#EDE9E4]">
                <td class="px-5 py-4">
                  <p class="font-semibold text-[#2E2925]">{{ item.name }}</p>
                  <p class="text-xs text-[#6B655D]">{{ item.fileName }}</p>
                </td>
                <td class="px-5 py-4"><AppBadge>{{ item.movement?.name ?? '—' }}</AppBadge></td>
                <td class="px-5 py-4">{{ item.type }}</td>
                <td class="px-5 py-4">{{ formatSize(item.size) }}</td>
                <td class="px-5 py-4 text-[#6B655D]">{{ formatDate(item.createdAt) }}</td>
                <td class="px-5 py-4">
                  <div class="flex gap-2">
                    <AppButton variant="secondary" @click="preview(item)">Prévisualiser</AppButton>
                    <AppButton variant="danger" @click="remove(item.id)">Supprimer</AppButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
      <div v-if="!store.documentsLoading && filteredDocuments.length" class="grid gap-3 md:hidden">
        <article v-for="item in filteredDocuments" :key="item.id" class="border border-[#C2BAB0] bg-white p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0"><p class="truncate font-semibold text-[#2E2925]">{{ item.name }}</p><p class="mt-1 truncate text-xs text-[#6B655D]">{{ item.fileName }}</p></div>
            <AppBadge>{{ item.type }}</AppBadge>
          </div>
          <div class="mt-3 grid grid-cols-2 gap-2 text-xs text-[#6B655D]"><span>{{ formatSize(item.size) }}</span><span class="text-right">{{ formatDate(item.createdAt) }}</span></div>
          <div class="mt-4 grid grid-cols-2 gap-2"><AppButton variant="secondary" @click="preview(item)">Prévisualiser</AppButton><AppButton variant="danger" @click="remove(item.id)">Supprimer</AppButton></div>
        </article>
      </div>
    </template>

    <div v-if="previewDocument" class="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1F3A]/70 p-3 sm:p-6" @click.self="closePreview">
      <article class="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl">
        <header class="flex items-start justify-between gap-4 border-b border-[#DDD7CF] px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <p class="eyebrow text-[#C25A34]">Prévisualisation</p>
            <h2 class="truncate text-xl font-bold text-[#0B1F3A]">{{ previewDocument.name }}</h2>
            <p class="mt-1 truncate text-xs text-[#6B655D]">{{ previewDocument.fileName }} · {{ formatSize(previewDocument.size) }}</p>
          </div>
          <button type="button" class="shrink-0 text-2xl leading-none text-[#6B655D] hover:text-[#0B1F3A]" aria-label="Fermer" @click="closePreview">×</button>
        </header>

        <div class="min-h-0 flex-1 overflow-auto bg-[#F7F5F2] p-3 sm:p-5">
          <div v-if="previewLoading" class="flex min-h-[50vh] items-center justify-center"><AppSpinner /></div>
          <div v-else-if="previewError" class="flex min-h-[50vh] items-center justify-center text-center text-sm text-[#B3261E]">{{ previewError }}</div>
          <div v-else-if="isImagePreview && previewUrl" class="flex min-h-[50vh] items-center justify-center">
            <img :src="previewUrl" :alt="previewDocument.name" class="max-h-[68vh] max-w-full object-contain shadow" />
          </div>
          <iframe v-else-if="(isPdfPreview || isTextPreview) && previewUrl" :src="previewUrl" :title="'Prévisualisation de ' + previewDocument.name" class="h-[68vh] w-full border border-[#DDD7CF] bg-white"></iframe>
          <div v-else class="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE9E4] text-2xl">📄</div>
            <h3 class="text-lg font-semibold text-[#0B1F3A]">Prévisualisation non disponible</h3>
            <p class="mt-2 max-w-md text-sm text-[#6B655D]">Ce format ne peut pas être affiché directement dans le navigateur. Vous pouvez télécharger le fichier pour l’ouvrir avec l’application adaptée.</p>
            <p class="mt-2 text-xs text-[#6B655D]">{{ previewMimeType || 'Type de fichier inconnu' }}</p>
          </div>
        </div>

        <footer class="flex flex-col-reverse gap-2 border-t border-[#DDD7CF] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <AppButton variant="secondary" @click="closePreview">Fermer</AppButton>
          <AppButton :disabled="previewLoading || !previewUrl" @click="downloadPreview">Télécharger le document</AppButton>
        </footer>
      </article>
    </div>
  </section>
</template>
