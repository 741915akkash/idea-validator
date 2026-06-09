<script setup>
  import { Check, ArrowLeft } from 'lucide-vue-next'
  import { ref } from 'vue'

  definePageMeta({
    layout: 'general'
  })

  const stage = ref('idea')
  const goal = ref('users')
  const email = ref('')
  const submitted = ref(false)

  function submitForm() {
    // Mock submission
    submitted.value = true
  }
</script>

<template>
  <main
    class="flex min-h-screen flex-col items-center justify-center bg-app-card px-6 py-16 lg:py-24"
  >
    <div class="w-full max-w-3xl">
      <NuxtLink
        to="/"
        class="mb-12 inline-flex items-center gap-x-2 text-sm font-semibold text-app-muted transition-colors hover:text-app-text"
      >
        <ArrowLeft class="h-4 w-4" />
        Back to Pricing
      </NuxtLink>

      <div
        v-if="!submitted"
        class="rounded-3xl p-8 text-app-text shadow-xl ring-1 ring-slate-200 sm:p-16"
      >
        <h1 class="mb-4 text-3xl font-bold tracking-tight text-app-text">
          Get a Tailored Recommendation
        </h1>
        <p class="mb-16 text-lg text-app-muted">
          Tell us where you are, and we'll skip the back-and-forth by sending you a custom roadmap.
        </p>

        <form @submit.prevent="submitForm" class="space-y-12">
          <div class="text-2xl font-medium leading-relaxed text-app-text sm:text-3xl">
            I'm at the
            <select
              v-model="stage"
              class="inline-block cursor-pointer appearance-none border-b-2 border-emerald-500 bg-transparent px-1 font-bold text-emerald-600 focus:border-emerald-600 focus:outline-none"
            >
              <option value="idea">Idea</option>
              <option value="mvp">MVP</option>
              <option value="scaling">Scaling</option>
            </select>
            stage and my primary goal is to
            <select
              v-model="goal"
              class="inline-block cursor-pointer appearance-none border-b-2 border-emerald-500 bg-transparent px-1 font-bold text-emerald-600 focus:border-emerald-600 focus:outline-none"
            >
              <option value="users">find users</option>
              <option value="pmf">find PMF</option>
              <option value="scale">scale fast</option></select
            >.
            <br class="hidden sm:block" />
            Reach me at
            <input
              v-model="email"
              type="email"
              required
              placeholder="your@email.com"
              class="inline-block w-full border-b-2 border-emerald-500 bg-transparent px-1 font-bold text-emerald-600 placeholder:text-app-muted focus:border-emerald-600 focus:outline-none sm:w-auto"
            />
            to start.
          </div>

          <div class="flex flex-col items-center gap-6 pt-8 sm:flex-row">
            <button
              type="submit"
              class="inline-flex w-full items-center justify-center gap-x-2 rounded-full bg-slate-900 px-10 py-5 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-slate-800 active:scale-95 sm:w-auto"
            >
              Send Recommendation Request
              <span aria-hidden="true">→</span>
            </button>
            <p class="text-sm font-medium italic text-app-muted">
              Response within 4 business hours
            </p>
          </div>
        </form>
      </div>

      <div
        v-else
        class="rounded-3xl p-8 text-center text-app-text shadow-xl ring-1 ring-slate-200 sm:p-16"
      >
        <div
          class="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"
        >
          <Check class="h-8 w-8 text-emerald-600" />
        </div>
        <h2 class="mb-4 text-3xl font-bold tracking-tight text-app-text">Request Sent!</h2>
        <p class="mb-12 text-lg text-app-muted">
          We've received your details. One of our founders will analyze your startup stage and goal
          and send a custom roadmap to
          <span class="font-bold text-app-text">{{ email }}</span> shortly.
        </p>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-x-2 text-sm font-bold text-emerald-600 transition-colors hover:text-emerald-500"
        >
          Return to Pricing
        </NuxtLink>
      </div>
    </div>
  </main>
</template>
