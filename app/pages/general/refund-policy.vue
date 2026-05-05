<template>
  <div class="mx-auto max-w-3xl px-6 py-16">
    <h1 class="mb-6 text-3xl font-bold">Refund Policy</h1>

    <p class="mb-6 text-sm text-gray-500">Last updated: {{ new Date().toLocaleDateString() }}</p>

    <section class="space-y-6 text-gray-700">
      <div>
        <h2 class="text-lg font-semibold">1. Refund Eligibility</h2>
        <p>
          We offer a 7-day refund policy for all paid plans. If you are not satisfied, you may
          request a full refund within 7 days of your initial purchase.
        </p>
      </div>

      <div>
        <h2 class="text-lg font-semibold">2. How to Request a Refund</h2>
        <p>Contact us at support@golaunchscall.com with:</p>
        <ul class="ml-6 list-disc">
          <li>Your account email</li>
          <li>Date of purchase</li>
          <li>Reason for refund (optional)</li>
        </ul>
      </div>

      <div>
        <h2 class="text-lg font-semibold">3. After 7 Days</h2>
        <p>Refund requests after 7 days are not eligible.</p>
      </div>

      <div>
        <h2 class="text-lg font-semibold">4. Subscription Renewals</h2>
        <p>Renewal charges are non-refundable. Please cancel before the next billing cycle.</p>
      </div>

      <div>
        <h2 class="text-lg font-semibold">5. Abuse & Misuse</h2>
        <p>We reserve the right to deny refunds in cases of abuse or violation of terms.</p>
      </div>
    </section>
  </div>
</template>
