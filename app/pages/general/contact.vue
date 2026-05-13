<template>
  <div class="mx-auto max-w-3xl px-6 py-16">
    <h1 class="mb-6 text-3xl font-bold">Contact Us</h1>

    <p class="mb-6 text-gray-600">
      If you have any questions, feedback, or need support, feel free to reach out.
    </p>

    <div class="mb-6">
      <h2 class="text-lg font-semibold">Email</h2>
      <p>support@golaunchscall.com</p>
      <p class="text-sm text-gray-500">We typically respond within 24–48 hours.</p>
    </div>

    <div class="mb-10">
      <h2 class="text-lg font-semibold">Location</h2>
      <p>Austin, Texas, United States</p>
    </div>

    <h2 class="mb-4 text-lg font-semibold">Send a Message</h2>

    <form class="space-y-4">
      <input type="text" placeholder="Your Name" class="w-full rounded-lg border px-4 py-2" />
      <input type="email" placeholder="Your Email" class="w-full rounded-lg border px-4 py-2" />
      <textarea
        rows="5"
        placeholder="Your Message"
        class="w-full rounded-lg border px-4 py-2"
      ></textarea>

      <button type="submit" class="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700">
        Send Message
      </button>
    </form>
  </div>
</template>
