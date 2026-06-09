<script setup>
  import { computed, ref, watch } from 'vue'

  const props = defineProps({
    mode: {
      type: String,
      default: 'create'
    },

    initialData: {
      type: Object,
      default: () => null
    },

    saving: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['save', 'cancel'])

  const template = ref({
    title: '',
    description: '',
    tags: ''
  })

  const questions = ref([])

  const isCreateMode = computed(() => props.mode === 'create')
  const isEditMode = computed(() => props.mode === 'edit')
  const isViewMode = computed(() => props.mode === 'view')

  const isReadonly = computed(() => isViewMode.value)

  function createQuestion() {
    return {
      id: crypto.randomUUID(),
      text: '',
      type: 'open_text',
      options: [],
      min: 1,
      max: 5
    }
  }

  watch(
    () => props.initialData,
    (data) => {
      if (!data) {
        template.value = {
          title: '',
          description: '',
          tags: ''
        }

        questions.value = [createQuestion()]
        return
      }

      template.value = {
        title: data.title || '',
        description: data.description || '',
        tags: data.tags || ''
      }

      questions.value = data.questions?.length ? data.questions : [createQuestion()]
    },
    { immediate: true }
  )

  function addQuestion() {
    questions.value.push(createQuestion())
  }

  function removeQuestion(index) {
    questions.value.splice(index, 1)
  }

  function addOption(question) {
    question.options.push('')
  }

  function removeOption(question, index) {
    question.options.splice(index, 1)
  }

  function buildPayload() {
    return {
      title: template.value.title,
      description: template.value.description,
      tags: template.value.tags,

      questions: questions.value
        .filter((q) => q.text.trim())
        .map((q) => ({
          id: q.id,
          text: q.text,
          type: q.type,

          options:
            q.type === 'single_select' || q.type === 'multi_select'
              ? q.options.filter(Boolean)
              : [],

          min: q.type === 'rating' ? q.min : null,
          max: q.type === 'rating' ? q.max : null
        }))
    }
  }

  function onSave() {
    emit('save', buildPayload())
  }
</script>

<template>
  <div class="min-h-screen p-6">
    <div class="mx-auto max-w-5xl">
      <!-- Header -->
      <div class="mb-10 rounded-2xl border border-app-border bg-app-panel px-6 py-5 text-app-text">
        <div class="flex flex-col gap-5">
          <!-- Title -->
          <div>
            <h1 class="text-3xl font-semibold tracking-tight text-app-text">
              {{
                isCreateMode ? 'Create Template' : isEditMode ? 'Edit Template' : 'Template Details'
              }}
            </h1>

            <div class="mt-2 h-1 w-16 rounded-full bg-emerald-500/10"></div>

            <p class="mt-4 text-sm text-app-muted">Build reusable interview question sets</p>
          </div>
        </div>
      </div>

      <!-- Back Row -->
      <div class="mb-6 flex justify-end border-app-border">
        <NuxtLink
          to="/quiz/interview-templates"
          class="inline-flex items-center justify-center rounded-lg bg-app-hover px-4 py-2 text-sm font-medium text-app-text transition hover:bg-app-hover"
        >
          Back to Templates
        </NuxtLink>
      </div>

      <div class="space-y-10 pb-32">
        <!-- Template -->
        <div class="rounded-3xl border border-app-border bg-app-panel p-8 text-app-text">
          <div class="mb-8 flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-app-text">Template Details</h2>

              <p class="mt-1 text-sm text-app-muted">Basic information about this template</p>
            </div>
          </div>

          <div class="space-y-6">
            <!-- Name -->
            <div>
              <label class="mb-2 block text-sm font-medium text-app-text"> Template Name </label>

              <input
                v-model="template.title"
                :disabled="isReadonly"
                type="text"
                class="w-full rounded-2xl border border-app-border bg-app-panel px-4 py-2.5 text-sm text-app-text outline-none transition placeholder:text-app-muted focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-app-hover disabled:text-app-muted"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="mb-2 block text-sm font-medium text-app-text"> Description </label>

              <textarea
                v-model="template.description"
                :disabled="isReadonly"
                rows="4"
                class="w-full rounded-2xl border bg-app-panel border-app-border px-4 py-3 text-sm text-app-text outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-app-hover disabled:text-app-muted"
              />
            </div>

            <!-- Tags -->
            <div>
              <label class="mb-2 block text-sm font-medium text-app-text"> Tags </label>

              <input
                v-model="template.tags"
                :disabled="isReadonly"
                type="text"
                class="w-full rounded-2xl border border-app-border bg-app-panel px-4 py-2.5 text-sm text-app-text outline-none transition placeholder:text-app-muted focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-app-hover disabled:text-app-muted"
              />

              <p class="mt-2 text-xs text-app-muted">Comma separated tags</p>
            </div>
          </div>
        </div>

        <!-- Questions -->
        <div class="rounded-3xl border border-app-border bg-app-panel p-8 text-app-text">
          <!-- Header -->
          <div class="mb-8 flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-app-text">Questions</h2>

              <p class="mt-1 text-sm text-app-muted">Reusable interview prompts</p>
            </div>

            <button
              v-if="!isReadonly"
              @click="addQuestion"
              class="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              + Add Question
            </button>
          </div>

          <!-- Questions -->
          <div class="space-y-8">
            <div
              v-for="(question, index) in questions"
              :key="question.id"
              class="rounded-3xl border border-app-border bg-app-card p-6"
            >
              <!-- Top -->
              <div class="mb-6 flex items-start justify-between gap-4">
                <!-- Left -->
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-500"
                  >
                    {{ index + 1 }}
                  </div>

                  <div>
                    <h3 class="text-base font-semibold text-app-text">Question</h3>

                    <p class="mt-0.5 text-xs text-app-muted">
                      {{ question.type }}
                    </p>
                  </div>
                </div>

                <!-- Right -->
                <button
                  v-if="!isReadonly"
                  @click="removeQuestion(index)"
                  class="text-sm font-medium text-rose-500 transition hover:text-rose-400"
                >
                  Remove
                </button>
              </div>

              <div class="space-y-5">
                <!-- Question -->
                <div>
                  <label class="mb-2 block text-sm font-medium text-app-text">
                    Question Text
                  </label>

                  <textarea
                    v-model="question.text"
                    :disabled="isReadonly"
                    rows="2"
                    class="w-full rounded-2xl border bg-app-panel border-app-border px-4 py-3 text-sm text-app-text outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-app-hover disabled:text-app-muted"
                  />
                </div>

                <!-- Type -->
                <div>
                  <label class="mb-2 block text-sm font-medium text-app-text">
                    Question Type
                  </label>

                  <select
                    v-model="question.type"
                    :disabled="isReadonly"
                    class="w-full rounded-2xl border border-app-border bg-app-panel px-4 py-2.5 text-sm text-app-text outline-none transition placeholder:text-app-muted focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-app-hover disabled:text-app-muted"
                  >
                    <option value="open_text">Open Text</option>
                    <option value="single_select">Single Select</option>
                    <option value="multi_select">Multi Select</option>
                    <option value="yes_no">Yes / No</option>
                    <option value="rating">Rating</option>
                    <option value="number">Number</option>
                  </select>
                </div>

                <!-- Options -->
                <div v-if="question.type === 'single_select' || question.type === 'multi_select'">
                  <div class="mb-3 flex items-center justify-between">
                    <label class="text-sm font-medium text-app-text"> Options </label>

                    <button
                      v-if="!isReadonly"
                      @click="addOption(question)"
                      class="text-sm font-medium text-emerald-600 transition hover:text-emerald-500"
                    >
                      + Add Option
                    </button>
                  </div>

                  <div class="space-y-3">
                    <div
                      v-for="(option, optionIndex) in question.options"
                      :key="optionIndex"
                      class="flex items-center gap-3"
                    >
                      <input
                        v-model="question.options[optionIndex]"
                        :disabled="isReadonly"
                        type="text"
                        class="flex-1 rounded-2xl bg-app-panel border border-app-border px-4 py-2.5 text-sm text-app-text outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-app-hover disabled:text-app-muted"
                      />

                      <button
                        v-if="!isReadonly"
                        @click="removeOption(question, optionIndex)"
                        class="rounded-xl border border-app-border px-3 py-2.5 text-sm text-rose-500 transition hover:bg-rose-500/10"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Rating -->
                <div v-if="question.type === 'rating'">
                  <label class="mb-3 block text-sm font-medium text-app-text"> Rating Range </label>

                  <div class="flex items-center gap-3">
                    <input
                      v-model.number="question.min"
                      :disabled="isReadonly"
                      type="number"
                      class="w-28 rounded-2xl bg-app-panel border border-app-border px-4 py-2.5 text-sm text-app-text outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-app-hover disabled:text-app-muted"
                    />

                    <span class="text-app-muted">to</span>

                    <input
                      v-model.number="question.max"
                      :disabled="isReadonly"
                      type="number"
                      class="w-28 rounded-2xl bg-app-panel border border-app-border px-4 py-2.5 text-sm text-app-text outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-app-hover disabled:text-app-muted"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty -->
          <div
            v-if="questions.length === 0"
            class="rounded-3xl border border-dashed border-app-border bg-app-card p-14 text-center"
          >
            <p class="text-sm text-app-muted">No questions added yet</p>

            <button
              v-if="!isReadonly"
              @click="addQuestion"
              class="mt-4 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              + Add First Question
            </button>
          </div>
        </div>
      </div>

      <!-- Sticky Footer -->
      <div
        class="fixed bottom-0 left-[260px] right-0 border-t border-app-border bg-app-panel px-6 py-4 text-app-text backdrop-blur"
      >
        <div class="mx-auto flex max-w-5xl justify-end gap-3">
          <button
            @click="emit('cancel')"
            class="rounded-2xl border border-app-border px-5 py-2.5 text-sm font-medium text-app-text transition hover:bg-app-hover"
          >
            {{ isViewMode ? 'Close' : 'Cancel' }}
          </button>

          <button
            v-if="!isViewMode"
            @click="onSave"
            :disabled="saving"
            class="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ saving ? 'Saving...' : isCreateMode ? 'Create Template' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
