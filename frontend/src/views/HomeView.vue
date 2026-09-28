<template>
  <main class="min-h-screen bg-[#F7F5F2]">
    <section class="app-container flex min-h-screen items-center py-16">
      <div class="max-w-3xl">
        <p class="eyebrow text-[#C25A34]">EcclesiaConnect</p>
        <h1 class="page-title mt-3 text-6xl text-[#0B1F3A]">Une base commune pour toute la plateforme.</h1>
        <p class="mt-5 max-w-2xl text-lg leading-8 text-[#6B655D]">Les espaces Administration, Fidèle/Parent et Responsable de mouvement restent séparés. Cette base fournit uniquement les fondations partagées.</p>
      </div>
    </section>

    <footer class="border-t border-[#DDD7CF] bg-white/60">
      <div class="app-container flex flex-col gap-3 py-6 text-sm text-[#6B655D] sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 EcclesiaConnect</span>
        <RouterLink to="/confidentialite" class="font-semibold text-[#24548F] hover:underline">
          Politique de confidentialité
        </RouterLink>
      </div>
    </footer>
  </main>
</template>
