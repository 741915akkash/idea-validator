<template>
  <header class="pt-32 pb-20 px-6">
    <div class="max-w-3xl mx-auto text-center">
      <h1 class="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-slate-900">
        Stop Building Wrong Idea. <br />
        <span class="text-emerald-600">Start Validating.</span>
      </h1>
      <p class="text-xl text-slate-600 mb-10 leading-relaxed">
        Turn your startup idea into a clear validation roadmap — and always know what to test next.
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button class="w-full sm:w-auto bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
          Start Validating <ArrowRight class="w-5 h-5" />
        </button>
      </div>
      <p class="mt-8 text-sm text-slate-500 font-medium">
        Idea Validator is your structured thinking partner from idea to traction.
      </p>
    </div>
  </header>
</template>

<script setup>
import { ArrowRight } from 'lucide-vue-next'
</script>
