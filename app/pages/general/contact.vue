<script setup>
  definePageMeta({
    layout: 'general'
  })
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-16">
    <h1 class="mb-6 text-3xl font-bold text-app-text">Contact Us</h1>

    <p class="mb-6 text-app-muted">
      If you have any questions, feedback, or need support, feel free to reach out.
    </p>

    <div class="mb-6">
      <h2 class="text-lg font-semibold text-app-text">Email</h2>
      <p class="text-app-text">support@golaunchscall.com</p>
      <p class="text-sm text-app-muted">We typically respond within 24–48 hours.</p>
    </div>

    <h2 class="mb-4 text-lg font-semibold">Send a Message</h2>

    <form class="space-y-4">
      <input
        type="text"
        placeholder="Your Name"
        class="w-full rounded-lg border border-app-border bg-app-panel px-4 py-2 text-app-text placeholder:text-app-muted focus:border-emerald-500 focus:outline-none"
      />
      <input
        type="email"
        placeholder="Your Email"
        class="w-full rounded-lg border border-app-border bg-app-panel px-4 py-2 text-app-text placeholder:text-app-muted focus:border-emerald-500 focus:outline-none"
      />
      <textarea
        rows="5"
        placeholder="Your Message"
        class="w-full rounded-lg border border-app-border bg-app-panel px-4 py-2 text-app-text placeholder:text-app-muted focus:border-emerald-500 focus:outline-none"
      ></textarea>

      <button
        type="submit"
        class="rounded-lg bg-emerald-600 px-6 py-2 text-white transition hover:bg-emerald-700"
      >
        Send Message
      </button>
    </form>
  </div>
</template>
