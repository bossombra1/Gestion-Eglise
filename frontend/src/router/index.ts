import { createRouter, createWebHistory } from 'vue-router'

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

const movementRoles = ['MOVEMENT_MANAGER']

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView, meta: { public: true } },
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

router.beforeEach((to) => {
  if (!to.meta.requiresAuth) return true

  const token = localStorage.getItem('ecclesia_token')
  const rawUser = localStorage.getItem('ecclesia_user')
  if (!token || !rawUser) return { path: '/connexion', query: { redirect: to.fullPath } }

  try {
    const user = JSON.parse(rawUser) as { role?: string }
    const roles = (to.meta.roles as string[] | undefined) ?? []
    if (roles.length && !roles.includes(user.role ?? '')) return '/'
  } catch {
    localStorage.removeItem('ecclesia_token')
    localStorage.removeItem('ecclesia_user')
    return { path: '/connexion', query: { redirect: to.fullPath } }
  }

  return true
})

export default router
