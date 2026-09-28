import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import AppLayout from '@/layouts/AppLayout.vue'
import EmptyLayout from '@/layouts/EmptyLayout.vue'
import HomeView from '@/views/HomeView.vue'
import MouvementDashboardView from '@/views/mouvement/DashboardView.vue'
import MouvementView from '@/views/mouvement/MouvementView.vue'
import EnfantsView from '@/views/mouvement/EnfantsView.vue'
import ParentsView from '@/views/mouvement/ParentsView.vue'
import FichesEnfantsView from '@/views/mouvement/FichesEnfantsView.vue'
import InscriptionsView from '@/views/mouvement/InscriptionsView.vue'
import CotisationsView from '@/views/mouvement/CotisationsView.vue'
import DocumentsView from '@/views/mouvement/DocumentsView.vue'
import CommunicationsView from '@/views/mouvement/CommunicationsView.vue'
import PrivacyPolicyView from '@/views/PrivacyPolicyView.vue'

const movementRoles = ['MOVEMENT_MANAGER']
let sessionChecked = false

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView, meta: { public: true } },
    { path: '/confidentialite', component: PrivacyPolicyView, meta: { public: true } },
    {
      path: '/mouvement',
      component: AppLayout,
      meta: { requiresAuth: true, roles: movementRoles },
      children: [
        { path: '', redirect: '/mouvement/dashboard' },
        { path: 'dashboard', component: MouvementDashboardView },
        { path: 'mon-mouvement', component: MouvementView },
        { path: 'enfants', component: EnfantsView },
        { path: 'parents', component: ParentsView },
        { path: 'fiches-enfants', component: FichesEnfantsView },
        { path: 'inscriptions', component: InscriptionsView },
        { path: 'cotisations', component: CotisationsView },
        { path: 'documents', component: DocumentsView },
        { path: 'communications', component: CommunicationsView },
      ],
    },
    {
      path: '/connexion',
      component: EmptyLayout,
      meta: { public: true },
      children: [{ path: '', component: () => import('@/views/auth/LoginPlaceholderView.vue') }],
    },
  ],
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  const auth = useAuthStore()
  const token = localStorage.getItem('ecclesia_token')
  const rawUser = localStorage.getItem('ecclesia_user')

  if (!token || !rawUser) {
    auth.logout()
    return { path: '/connexion', query: { redirect: to.fullPath } }
  }

  if (!sessionChecked) {
    sessionChecked = true
    const restored = await auth.restoreSession()
    if (!restored) {
      sessionChecked = false
      return { path: '/connexion', query: { redirect: to.fullPath } }
    }
  }

  const roles = (to.meta.roles as string[] | undefined) ?? []
  if (roles.length && !roles.includes(auth.user?.role ?? '')) {
    return '/'
  }

  return true
})

export default router
