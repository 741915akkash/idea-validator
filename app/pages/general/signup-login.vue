<script setup>
  import { computed, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import TopAlert from '~/components/ui/TopAlert.vue'

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
  const showRateLimitAlert = ref(false)
  const rateLimitMessage = ref('')

  const signupSource = computed(() => String(route.query.signup_source || ''))
  const scoreQuizId = computed(() => String(route.query.quiz_id || ''))
  const redirectTo = computed(() => String(route.query.redirect || '/quiz/overview'))

  async function requestOtp() {
    error.value = ''
    info.value = ''
    showRateLimitAlert.value = false
    rateLimitMessage.value = ''
    loadingAction.value = 'send'

    try {
      await $fetch('/api/auth/request-otp', {
        method: 'POST',
        body: { email: email.value }
      })

      codeSent.value = true
      info.value = 'If that email is valid, we sent a 6-digit code.'
    } catch (e) {
      const statusCode = Number(e?.statusCode || e?.data?.statusCode || 0)
      const statusMessage = String(e?.statusMessage || e?.data?.statusMessage || '')
      if (statusCode === 429) {
        rateLimitMessage.value = statusMessage || 'Too many requests. Please try again shortly.'
        showRateLimitAlert.value = true
      } else {
        error.value = statusMessage || e?.message || 'Failed to send code'
      }
    } finally {
      loadingAction.value = ''
    }
  }

  async function verifyOtp() {
    error.value = ''
    info.value = ''
    showRateLimitAlert.value = false
    rateLimitMessage.value = ''
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
      const statusCode = Number(e?.statusCode || e?.data?.statusCode || 0)
      const statusMessage = String(e?.statusMessage || e?.data?.statusMessage || '')
      if (statusCode === 429) {
        rateLimitMessage.value = statusMessage || 'Too many attempts. Please try again shortly.'
        showRateLimitAlert.value = true
      } else {
        error.value = statusMessage || e?.message || 'Verification failed'
      }
    } finally {
      loadingAction.value = ''
    }
  }
</script>

<template>
  <main class="mx-auto max-w-md px-4 py-16">
    <TopAlert
      :open="showRateLimitAlert"
      title="Please wait"
      variant="warning"
      :message="rateLimitMessage"
      @close="showRateLimitAlert = false"
    />
    <h1 class="text-2xl font-semibold text-app-text">Continue to GO Launch Scall</h1>
    <p class="mt-2 text-sm text-app-muted">Enter your email to get a one-time code.</p>

    <form class="mt-6 space-y-4" @submit.prevent="verifyOtp">
      <div>
        <label for="email" class="mb-1 block text-sm font-medium text-app-text">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          placeholder="you@example.com"
          class="w-full rounded-md border border-app-border bg-app-panel px-3 py-2 text-app-text outline-none ring-emerald-500 placeholder:text-app-muted focus:ring-2"
        />
      </div>

      <div>
        <label for="code" class="mb-1 block text-sm font-medium text-app-text"
          >Verification code</label
        >
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
              ? 'w-full rounded-md border border-app-border px-3 py-2 outline-none ring-emerald-500 focus:ring-2'
              : 'w-full rounded-md border border-app-border bg-app-hover px-3 py-2 text-app-muted'
          "
        />
        <p v-if="!codeSent" class="mt-1 text-xs text-app-muted">
          Send a code first to enable verification.
        </p>
      </div>

      <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
      <p v-if="info" class="text-sm text-app-muted">{{ info }}</p>

      <div class="flex items-center justify-between gap-3">
        <button
          type="button"
          class="rounded-md border border-app-border bg-app-panel px-3 py-2 text-sm font-medium text-app-text transition hover:bg-app-hover disabled:opacity-60"
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
