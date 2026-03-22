<script setup>
  import { Check, ArrowLeft } from 'lucide-vue-next'
  import { ref } from 'vue'

  definePageMeta({
    layout: 'marketing'
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
  <main class="min-h-screen flex flex-col items-center justify-center px-6 py-16 lg:py-24 bg-slate-50">
    <div class="max-w-3xl w-full">
      <NuxtLink to="/" class="inline-flex items-center gap-x-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-12">
        <ArrowLeft class="h-4 w-4" />
        Back to Pricing
      </NuxtLink>

      <div v-if="!submitted" class="bg-white rounded-3xl p-8 sm:p-16 shadow-xl ring-1 ring-slate-200">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900 mb-4">Get a Tailored Recommendation</h1>
        <p class="text-lg text-slate-600 mb-16">Tell us where you are, and we'll skip the back-and-forth by sending you a custom roadmap.</p>

        <form @submit.prevent="submitForm" class="space-y-12">
          <div class="text-2xl sm:text-3xl leading-relaxed text-slate-900 font-medium">
            I'm at the
            <select v-model="stage" class="inline-block border-b-2 border-emerald-500 bg-transparent px-1 focus:outline-none focus:border-emerald-600 cursor-pointer text-emerald-600 font-bold appearance-none">
              <option value="idea">Idea</option>
              <option value="mvp">MVP</option>
              <option value="scaling">Scaling</option>
            </select>
            stage and my primary goal is to
            <select v-model="goal" class="inline-block border-b-2 border-emerald-500 bg-transparent px-1 focus:outline-none focus:border-emerald-600 cursor-pointer text-emerald-600 font-bold appearance-none">
              <option value="users">find users</option>
              <option value="pmf">find PMF</option>
              <option value="scale">scale fast</option>
            </select>.
            <br class="hidden sm:block" />
            Reach me at
            <input v-model="email" type="email" required placeholder="your@email.com" class="inline-block border-b-2 border-emerald-500 bg-transparent px-1 focus:outline-none focus:border-emerald-600 placeholder:text-slate-200 text-emerald-600 font-bold w-full sm:w-auto" />
            to start.
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-6 pt-8">
            <button type="submit" class="w-full sm:w-auto inline-flex items-center justify-center gap-x-2 rounded-full bg-slate-900 px-10 py-5 text-base font-bold text-white shadow-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">
              Send Recommendation Request
              <span aria-hidden="true">→</span>
            </button>
            <p class="text-sm text-slate-400 font-medium italic">Response within 4 business hours</p>
          </div>
        </form>
      </div>

      <div v-else class="bg-white rounded-3xl p-8 sm:p-16 shadow-xl ring-1 ring-slate-200 text-center">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-8">
          <Check class="h-8 w-8 text-emerald-600" />
        </div>
        <h2 class="text-3xl font-bold tracking-tight text-slate-900 mb-4">Request Sent!</h2>
        <p class="text-lg text-slate-600 mb-12">We've received your details. One of our founders will analyze your startup stage and goal and send a custom roadmap to <span class="font-bold text-slate-900">{{ email }}</span> shortly.</p>
        <NuxtLink to="/" class="inline-flex items-center gap-x-2 text-sm font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
          Return to Pricing
        </NuxtLink>
      </div>
    </div>
  </main>
</template>
