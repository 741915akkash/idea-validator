<!-- app/components/interview/UncertaintyInput.vue -->

<script setup>
  import { ref, computed, watch, onMounted } from 'vue'
  import { useInterviewSession } from '@/stores/interviewSession'
  import { useInterviewApi } from '@/composables/useInterviewApi'

  const interview = useInterviewSession()
  const api = useInterviewApi()
  const { credits, fetchCredits } = useCredits()

  const text = ref(interview.uncertainty?.text || '')
  const selectedId = ref(interview.selectedSub?.id || null)
  const generating = ref(false)
  const saving = ref(false)
  const error = ref(null)

  const maxChars = 240

  const isValid = computed(() => {
    return text.value.trim().length >= 10 && text.value.length <= maxChars
  })

  const charCount = computed(() => text.value.length)
  const hasSubUncertainties = computed(() => interview.subUncertainties.length > 0)
  const hasSelected = computed(() =>
    interview.subUncertainties.some((sub) => sub.id === selectedId.value)
  )
  const creditsLeft = computed(() =>
    Number.isFinite(Number(credits.value?.balance)) ? Number(credits.value.balance) : null
  )
  const generateCost = 10
  const continueMaxCost = 20
  const creditsHint = computed(() =>
    creditsLeft.value == null ? 'Credits unavailable' : `${creditsLeft.value} credits left`
  )

  function createDraftSubs(items) {
    return items.map((title, index) => ({
      id: `draft-${Date.now()}-${index}`,
      title
    }))
  }

  function normalizeCurrentSubs() {
    const seen = new Set()
    return interview.subUncertainties
      .map((sub) => sub.title?.trim())
      .filter((title) => !!title)
      .filter((title) => {
        const key = title.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
  }

  watch(text, (newValue) => {
    if (hasSubUncertainties.value && newValue.trim() !== interview.uncertainty?.text) {
      interview.resetDecomposition()
      selectedId.value = null
    }
  })

  onMounted(async () => {
    await fetchCredits()
  })

  function selectSub(id) {
    if (generating.value || saving.value) return
    selectedId.value = id
  }

  function addSubUncertainty() {
    const draftId = `manual-${Date.now()}`
    interview.subUncertainties.push({ id: draftId, title: '' })
    selectedId.value = draftId
  }

  function removeSubUncertainty(id) {
    interview.subUncertainties = interview.subUncertainties.filter((sub) => sub.id !== id)
    if (selectedId.value === id) {
      selectedId.value = interview.subUncertainties[0]?.id || null
    }
  }

  async function generateSubUncertainties() {
    if (!isValid.value || generating.value || saving.value) return

    generating.value = true
    error.value = null

    try {
      const response = await api.generateSubUncertainties({
        text: text.value.trim()
      })

      const draftSubs = createDraftSubs(response.sub_uncertainties || [])

      interview.setUncertainty({
        uncertainty: { id: null, text: text.value.trim() },
        subUncertainties: draftSubs
      })

      selectedId.value = draftSubs[0]?.id || null
    } catch {
      error.value = 'Unable to generate sub-uncertainties. Please try again.'
    } finally {
      generating.value = false
      await fetchCredits(true)
    }
  }

  async function handleContinue() {
    if (!isValid.value || !hasSubUncertainties.value || !hasSelected.value || saving.value) return

    saving.value = true
    error.value = null

    try {
      const subTitles = normalizeCurrentSubs()

      if (!subTitles.length) {
        error.value = 'Add at least one valid sub-uncertainty before continuing.'
        return
      }

      const selectedIndex = interview.subUncertainties.findIndex(
        (sub) => sub.id === selectedId.value
      )

      const createRes = await api.createUncertainty({
        quizId: interview.quizId,
        text: text.value.trim(),
        subUncertainties: subTitles
      })

      const persistedSubs = createRes.sub_uncertainties || []
      const selectedSub = persistedSubs[selectedIndex] ||
        persistedSubs[0] || { id: null, title: subTitles[0] }

      interview.setUncertainty({
        uncertainty: {
          id: createRes.uncertainty_id,
          text: text.value.trim()
        },
        subUncertainties: persistedSubs
      })

      const structureRes = await api.createStructure({
        subUncertaintyId: selectedSub.id,
        goal: selectedSub.title
      })

      interview.setGoalDraft({
        selectedSub,
        goal: { id: structureRes.goal_id, statement: selectedSub.title },
        conditions: structureRes.conditions,
        questions: []
      })
    } catch {
      error.value = 'Unable to continue. Please try again.'
    } finally {
      saving.value = false
      await fetchCredits(true)
    }
  }
</script>

<template>
  <div>
    <div>
      <h2 class="text-xl font-semibold text-app-text">Define the Uncertainty</h2>
      <p class="mt-2 text-sm text-app-muted">
        Edit uncertainty, generate sub-uncertainties any number of times, then continue.
      </p>
    </div>

    <div class="mt-8">
      <label class="mb-2 block text-sm font-medium text-app-muted">
        What is currently unknown?
      </label>

      <textarea
        v-model="text"
        :maxlength="maxChars"
        rows="5"
        class="w-full resize-none rounded-md border border-app-border px-4 py-3 text-sm focus:border-app-border focus:outline-none focus:ring-2 focus:ring-neutral-900"
        placeholder="Example: Will founders pay $50/month for this product?"
      ></textarea>

      <div class="mt-2 flex justify-between text-xs text-app-muted">
        <span>Be specific. Avoid vague wording.</span>
        <span>{{ charCount }} / {{ maxChars }}</span>
      </div>
    </div>

    <div class="mt-8">
      <button
        @click="generateSubUncertainties"
        :disabled="!isValid || generating || saving"
        class="rounded-md bg-emerald-600 px-6 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-app-muted"
      >
        {{ generating ? 'Generating…' : 'Generate sub-uncertainties' }}
      </button>
      <div class="mt-2 text-xs text-app-muted">
        Costs {{ generateCost }} credits • {{ creditsHint }}
      </div>
    </div>

    <div v-if="hasSubUncertainties" class="mt-10">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-app-text">Sub-uncertainties</h3>
        <button @click="addSubUncertainty" class="text-sm text-app-text underline">
          + Add manually
        </button>
      </div>

      <p class="mt-2 text-sm text-app-muted">
        Select one to continue with, and edit any text before saving.
      </p>

      <div class="mt-4 space-y-3">
        <div
          v-for="sub in interview.subUncertainties"
          :key="sub.id"
          class="rounded-md border border-app-border p-3"
        >
          <div class="flex items-start gap-3">
            <input
              type="radio"
              name="selectedSub"
              :checked="selectedId === sub.id"
              @change="selectSub(sub.id)"
              class="mt-1"
            />
            <div class="flex-1">
              <input
                v-model="sub.title"
                type="text"
                class="w-full rounded border border-app-border px-3 py-2 text-sm"
                placeholder="Enter sub-uncertainty"
              />
            </div>
            <button
              @click="removeSubUncertainty(sub.id)"
              class="text-sm text-red-600"
              type="button"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="mt-4 text-sm text-red-600">
      {{ error }}
    </div>

    <div class="mt-10">
      <button
        @click="handleContinue"
        :disabled="!isValid || !hasSubUncertainties || !hasSelected || saving || generating"
        class="rounded-md bg-emerald-600 px-6 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-app-muted"
      >
        {{ saving ? 'Saving…' : 'Continue →' }}
      </button>
      <div class="mt-2 text-xs text-app-muted">
        Uses up to {{ continueMaxCost }} credits • {{ creditsHint }}
      </div>
    </div>
  </div>
</template>
