<template>
  <main class="min-h-screen overflow-hidden bg-[#F7F5F2]">
    <header class="relative z-10 border-b border-[#DDD7CF]/80 bg-[#F7F5F2]/95 backdrop-blur">
      <div class="app-container flex h-20 items-center justify-between">
        <RouterLink to="/" class="flex items-center gap-3" aria-label="EcclesiaConnect, accueil">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B1F3A] text-lg font-bold text-white shadow-sm">
            EC
          </div>
          <div>
            <p class="font-semibold tracking-tight text-[#0B1F3A]">EcclesiaConnect</p>
            <p class="text-xs text-[#6B655D]">Gestion paroissiale</p>
          </div>
        </RouterLink>

        <nav class="hidden items-center gap-7 text-sm font-medium text-[#6B655D] md:flex">
          <a href="#fonctionnalites" class="transition hover:text-[#0B1F3A]">Fonctionnalités</a>
          <a href="#espaces" class="transition hover:text-[#0B1F3A]">Espaces</a>
          <RouterLink
            to="/confidentialite"
            class="transition hover:text-[#0B1F3A]"
          >
            Confidentialité
          </RouterLink>
        </nav>

        <RouterLink
          to="/connexion"
          class="rounded-xl bg-[#C25A34] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#A84A28]"
        >
          Se connecter
        </RouterLink>
      </div>
    </header>

    <section class="relative">
      <div class="pointer-events-none absolute -right-32 -top-24 h-80 w-80 rounded-full bg-[#D99A2B]/10 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-[#24548F]/10 blur-3xl"></div>

      <div class="app-container grid min-h-[600px] items-center gap-14 py-16 lg:grid-cols-[1.1fr_.9fr] lg:py-24">
        <div class="relative z-10">
          <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C2BAB0] bg-white/70 px-3.5 py-2 text-xs font-bold uppercase tracking-[.12em] text-[#24548F]">
            <span class="h-2 w-2 rounded-full bg-[#14713C]"></span>
            Plateforme de gestion paroissiale
          </div>

          <h1 class="page-title max-w-4xl text-5xl leading-[1.05] text-[#0B1F3A] sm:text-6xl lg:text-7xl">
            Une gestion plus simple,
            <span class="text-[#C25A34]"> une communauté mieux organisée.</span>
          </h1>

          <p class="mt-7 max-w-2xl text-base leading-8 text-[#6B655D] sm:text-lg">
            EcclesiaConnect centralise les informations de la paroisse, les familles,
            les fidèles, les mouvements, les inscriptions, les cotisations et les communications
            dans un même espace sécurisé.
          </p>

          <div class="mt-9 flex flex-col gap-3 sm:flex-row">
            <RouterLink
              to="/connexion"
              class="inline-flex items-center justify-center rounded-xl bg-[#0B1F3A] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0B1F3A]/10 transition hover:bg-[#14345E]"
            >
              Accéder à mon espace
              <span class="ml-2" aria-hidden="true">→</span>
            </RouterLink>
            <a
              href="#fonctionnalites"
              class="inline-flex items-center justify-center rounded-xl border border-[#C2BAB0] bg-white/70 px-6 py-3.5 text-sm font-bold text-[#2E2925] transition hover:border-[#24548F] hover:bg-white"
            >
              Découvrir la plateforme
            </a>
          </div>

          <div class="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#6B655D]">
            <span class="flex items-center gap-2">
              <span class="text-[#14713C]">✓</span> Accès par rôle
            </span>
            <span class="flex items-center gap-2">
              <span class="text-[#14713C]">✓</span> Données cloisonnées
            </span>
            <span class="flex items-center gap-2">
              <span class="text-[#14713C]">✓</span> Pensé pour le mobile
            </span>
          </div>
        </div>

        <div class="relative mx-auto w-full max-w-xl lg:justify-self-end">
          <div class="absolute -inset-4 rounded-[2rem] bg-[#0B1F3A]/5 blur-2xl"></div>

          <div class="relative rounded-[2rem] border border-[#DDD7CF] bg-white p-5 shadow-2xl shadow-[#0B1F3A]/10 sm:p-7">
            <div class="flex items-center justify-between border-b border-[#EDE9E4] pb-5">
              <div>
                <p class="text-xs font-bold uppercase tracking-[.12em] text-[#C25A34]">Espace paroissial</p>
                <h2 class="page-title mt-1 text-2xl text-[#0B1F3A]">Tout au même endroit</h2>
              </div>
              <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F5F2] text-[#24548F]">
                <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                  <path d="M3 10.5 12 3l9 7.5" />
                  <path d="M5.5 9.5V21h13V9.5M9 21v-6h6v6" />
                </svg>
              </div>
            </div>

            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <div class="rounded-2xl bg-[#F7F5F2] p-4">
                <p class="text-xs font-semibold text-[#6B655D]">Familles & fidèles</p>
                <p class="mt-2 text-sm font-bold text-[#0B1F3A]">Profils centralisés</p>
                <p class="mt-1 text-xs leading-5 text-[#6B655D]">Retrouvez rapidement les informations utiles.</p>
              </div>
              <div class="rounded-2xl bg-[#F7F5F2] p-4">
                <p class="text-xs font-semibold text-[#6B655D]">Mouvements</p>
                <p class="mt-2 text-sm font-bold text-[#0B1F3A]">Suivi des activités</p>
                <p class="mt-1 text-xs leading-5 text-[#6B655D]">Inscriptions, enfants, parents et documents.</p>
              </div>
              <div class="rounded-2xl border border-[#EDE9E4] p-4">
                <p class="text-xs font-semibold text-[#6B655D]">Cotisations</p>
                <p class="mt-2 text-sm font-bold text-[#0B1F3A]">Suivi financier</p>
                <p class="mt-1 text-xs leading-5 text-[#6B655D]">Paiements et historiques organisés.</p>
              </div>
              <div class="rounded-2xl border border-[#EDE9E4] p-4">
                <p class="text-xs font-semibold text-[#6B655D]">Communication</p>
                <p class="mt-2 text-sm font-bold text-[#0B1F3A]">Information ciblée</p>
                <p class="mt-1 text-xs leading-5 text-[#6B655D]">Diffusez les messages au bon public.</p>
              </div>
            </div>

            <div class="mt-5 flex items-center gap-3 rounded-2xl bg-[#0B1F3A] p-4 text-white">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#D99A2B]">
                ✓
              </div>
              <div>
                <p class="text-sm font-bold">Un accès adapté à chaque responsabilité</p>
                <p class="mt-0.5 text-xs leading-5 text-white/65">Les espaces et données sont limités au périmètre autorisé.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="fonctionnalites" class="border-y border-[#DDD7CF] bg-white/55 py-16 sm:py-20">
      <div class="app-container">
        <div class="max-w-2xl">
          <p class="eyebrow text-[#C25A34]">Une base commune</p>
          <h2 class="page-title mt-3 text-3xl text-[#0B1F3A] sm:text-4xl">
            Les outils essentiels, réunis dans une seule plateforme.
          </h2>
          <p class="mt-4 leading-7 text-[#6B655D]">
            Chaque espace est conçu selon les responsabilités de son utilisateur,
            avec une organisation claire et des données accessibles uniquement dans le bon périmètre.
          </p>
        </div>

        <div class="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <article
            v-for="feature in features"
            :key="feature.title"
            class="rounded-2xl border border-[#DDD7CF] bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#0B1F3A]/5"
          >
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F5F2] text-xl" aria-hidden="true">
              {{ feature.icon }}
            </div>
            <h3 class="mt-5 font-bold text-[#0B1F3A]">{{ feature.title }}</h3>
            <p class="mt-2 text-sm leading-6 text-[#6B655D]">{{ feature.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="espaces" class="py-16 sm:py-20">
      <div class="app-container">
        <div class="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-center">
          <div>
            <p class="eyebrow text-[#C25A34]">Des espaces adaptés</p>
            <h2 class="page-title mt-3 text-3xl text-[#0B1F3A] sm:text-4xl">
              Une expérience différente selon votre rôle.
            </h2>
            <p class="mt-4 leading-7 text-[#6B655D]">
              Administration, parent, fidèle ou responsable de mouvement :
              chacun retrouve les fonctionnalités qui correspondent à sa mission.
            </p>
            <RouterLink
              to="/connexion"
              class="mt-7 inline-flex rounded-xl bg-[#C25A34] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#A84A28]"
            >
              Ouvrir une session
            </RouterLink>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <article
              v-for="space in spaces"
              :key="space.title"
              class="rounded-2xl border border-[#DDD7CF] bg-white p-6"
            >
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-xs font-bold uppercase tracking-[.1em] text-[#6B655D]">{{ space.label }}</p>
                  <h3 class="mt-2 font-bold text-[#0B1F3A]">{{ space.title }}</h3>
                </div>
                <span class="text-xl" aria-hidden="true">{{ space.icon }}</span>
              </div>
              <p class="mt-3 text-sm leading-6 text-[#6B655D]">{{ space.description }}</p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-[#0B1F3A] py-14">
      <div class="app-container flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="eyebrow text-[#D99A2B]">EcclesiaConnect</p>
          <h2 class="page-title mt-2 max-w-2xl text-3xl text-white sm:text-4xl">
            Prêt à rejoindre votre espace de gestion ?
          </h2>
          <p class="mt-3 max-w-xl leading-7 text-white/65">
            Connectez-vous avec les identifiants qui vous ont été attribués.
          </p>
        </div>
        <RouterLink
          to="/connexion"
          class="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#0B1F3A] transition hover:bg-[#F7F5F2]"
        >
          Se connecter
          <span class="ml-2" aria-hidden="true">→</span>
        </RouterLink>
      </div>
    </section>

    <footer class="border-t border-[#DDD7CF] bg-white">
      <div class="app-container flex flex-col gap-4 py-7 text-sm text-[#6B655D] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="font-bold text-[#0B1F3A]">EcclesiaConnect</p>
          <p class="mt-1">Plateforme de gestion paroissiale.</p>
        </div>
        <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span>© {{ currentYear }} EcclesiaConnect</span>
          <RouterLink to="/confidentialite" class="font-semibold text-[#24548F] hover:underline">
            Politique de confidentialité
          </RouterLink>
        </div>
      </div>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())

const features = [
  {
    icon: '👥',
    title: 'Familles & fidèles',
    description: 'Centralisez les profils, relations familiales et informations utiles à la vie paroissiale.',
  },
  {
    icon: '⛪',
    title: 'Mouvements',
    description: 'Gérez les activités, enfants, parents, inscriptions et membres de vos mouvements.',
  },
  {
    icon: '💳',
    title: 'Cotisations',
    description: 'Suivez les cotisations et paiements avec un historique clair et exploitable.',
  },
  {
    icon: '📣',
    title: 'Communications',
    description: 'Organisez les communications et diffusez les informations au bon périmètre.',
  },
]

const spaces = [
  {
    icon: '⚙️',
    label: 'Organisation',
    title: 'Administration',
    description: 'Pilotage de la paroisse, utilisateurs, familles, mouvements et informations générales.',
  },
  {
    icon: '🤝',
    label: 'Accompagnement',
    title: 'Parent / Fidèle',
    description: 'Accès aux informations personnelles, aux activités et aux communications qui vous concernent.',
  },
  {
    icon: '🧭',
    label: 'Responsabilité',
    title: 'Responsable de mouvement',
    description: 'Suivi des enfants, parents, inscriptions, cotisations, documents et communications du mouvement.',
  },
  {
    icon: '🔐',
    label: 'Sécurité',
    title: 'Accès contrôlés',
    description: 'Chaque espace respecte le rôle de l’utilisateur et le périmètre de données qui lui est attribué.',
  },
]
</script>
