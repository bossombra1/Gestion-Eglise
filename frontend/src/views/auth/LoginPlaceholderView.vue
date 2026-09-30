<template>
  <section class="flex min-h-screen items-center justify-center px-4 py-10">
    <div class="w-full max-w-md border border-[#C2BAB0] bg-white p-5 sm:p-8 shadow-sm">
      <p class="eyebrow text-[#C25A34]">EcclesiaConnect</p>
      <h1 class="page-title mt-2 text-3xl sm:text-4xl text-[#0B1F3A]">Connexion</h1>
      <p class="mt-3 text-sm leading-6 text-[#6B655D]">Accédez à votre espace selon votre rôle.</p>
      <form class="mt-8 space-y-5" @submit.prevent="submit">
        <div><label for="email" class="mb-2 block text-sm font-semibold">Adresse e-mail</label><input id="email" v-model="email" type="email" autocomplete="email" required class="w-full border border-[#C2BAB0] bg-[#F7F5F2] px-4 py-3 outline-none focus:border-[#24548F] focus:ring-2 focus:ring-[#24548F]/20" /></div>
        <div><label for="password" class="mb-2 block text-sm font-semibold">Mot de passe</label><input id="password" v-model="password" type="password" autocomplete="current-password" required minlength="8" class="w-full border border-[#C2BAB0] bg-[#F7F5F2] px-4 py-3 outline-none focus:border-[#24548F] focus:ring-2 focus:ring-[#24548F]/20" /></div>
        <p v-if="auth.error" role="alert" class="border border-[#B3261E]/30 bg-[#B3261E]/5 px-4 py-3 text-sm text-[#B3261E]">{{ auth.error }}</p>
        <button type="submit" :disabled="auth.loading" class="w-full bg-[#0B1F3A] px-4 py-3 font-semibold text-white hover:bg-[#14345E] disabled:opacity-60">{{ auth.loading ? 'Connexion…' : 'Se connecter' }}</button>
      </form>
      <RouterLink to="/confidentialite" class="mt-6 block text-center text-sm font-semibold text-[#24548F] hover:underline">Politique de confidentialité</RouterLink>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const email = ref('')
const password = ref('')
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
async function submit() {
  if (await auth.login(email.value.trim(), password.value)) {
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/mouvement/dashboard'
    await router.replace(redirect)
  }
}
</script>