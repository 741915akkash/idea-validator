<script setup>
  import { computed, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  definePageMeta({
    layout: 'auth'
  })

  const route = useRoute()
  const router = useRouter()
  const user = useUser()

  const codeSent = ref(false)
  const email = ref('')
  const code = ref('')
  const loadingAction = ref('')
  const error = ref('')
  const info = ref('')

  const signupSource = computed(() => String(route.query.signup_source || ''))
  const scoreQuizId = computed(() => String(route.query.quiz_id || ''))
  const redirectTo = computed(() => String(route.query.redirect || '/quiz/overview'))

  async function requestOtp() {
    error.value = ''
    info.value = ''
    loadingAction.value = 'send'

    try {
      await $fetch('/api/auth/request-otp', {
        method: 'POST',
        body: { email: email.value }
      })

      codeSent.value = true
      info.value = 'If that email is valid, we sent a 6-digit code.'
    } catch (e) {
      error.value = e?.data?.statusMessage || e?.message || 'Failed to send code'
    } finally {
      loadingAction.value = ''
    }
  }

  async function verifyOtp() {
    error.value = ''
    info.value = ''
    loadingAction.value = 'verify'

    try {
      const payload = {
        email: email.value,
        code: code.value
      }

      if (signupSource.value === 'score_wall' && scoreQuizId.value) {
        payload.signup_source = 'score_wall'
        payload.quiz_id = scoreQuizId.value
      }

      const res = await $fetch('/api/auth/verify-otp', {
        method: 'POST',
        body: payload
      })

      user.value = res.user

      if (res?.transfer?.transferred && res?.transfer?.quiz_id) {
        await router.push(`/quiz/score?quiz_id=${res.transfer.quiz_id}`)
        return
      }

      await router.push(redirectTo.value || '/quiz/overview')
    } catch (e) {
      error.value = e?.data?.statusMessage || e?.message || 'Verification failed'
    } finally {
      loadingAction.value = ''
    }
  }
</script>

<template>
  <main class="mx-auto max-w-md px-4 py-16">
    <h1 class="text-2xl font-semibold text-slate-900">Continue to Idea Validator</h1>
    <p class="mt-2 text-sm text-slate-600">Enter your email to get a one-time code.</p>

    <form class="mt-6 space-y-4" @submit.prevent="verifyOtp">
      <div>
        <label for="email" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          placeholder="you@example.com"
          class="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
        />
      </div>

      <div>
        <label for="code" class="mb-1 block text-sm font-medium text-slate-700">Verification code</label>
        <input
          id="code"
          v-model="code"
          type="text"
          required
          inputmode="numeric"
          pattern="[0-9]{6}"
          maxlength="6"
          autocomplete="one-time-code"
          placeholder="123456"
          :disabled="!codeSent"
          :class="
            codeSent
              ? 'w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-emerald-500 focus:ring-2'
              : 'w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500'
          "
        />
        <p v-if="!codeSent" class="mt-1 text-xs text-slate-500">Send a code first to enable verification.</p>
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-if="info" class="text-sm text-slate-600">{{ info }}</p>

      <div class="flex items-center justify-between gap-3">
        <button
          type="button"
          class="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
          :disabled="loadingAction !== ''"
          @click="requestOtp"
        >
          {{ loadingAction === 'send' ? 'Sending...' : codeSent ? 'Resend code' : 'Send code' }}
        </button>

        <button
          type="submit"
          :disabled="loadingAction !== '' || !codeSent"
          class="rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {{ loadingAction === 'verify' ? 'Verifying...' : 'Verify' }}
        </button>
      </div>
    </form>
  </main>
</template>
