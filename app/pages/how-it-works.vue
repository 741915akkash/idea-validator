<script setup>
  import { ref, computed, reactive, onMounted, onUnmounted, markRaw } from 'vue'
  import { useSwipe } from '@vueuse/core'
  import {
    ArrowRight,
    Play,
    Pause,
    ClipboardList,
    Star,
    AlertTriangle,
    Users,
    Brain,
    RefreshCcw
  } from 'lucide-vue-next'

  definePageMeta({
    layout: 'marketing'
  })

  const steps = [
    {
      id: 1,
      title: 'Define',
      tooltip: 'Turn your idea into testable bets',
      description:
        'Break your idea into what must be true — problem, customer, and willingness to pay.',
      icon: markRaw(ClipboardList)
    },
    {
      id: 2,
      title: 'Score',
      tooltip: 'See how strong your idea is',
      description:
        'Answer a quick quiz and get a validation score based on real signals — not opinions.',
      icon: markRaw(Star)
    },
    {
      id: 3,
      title: 'Expose',
      tooltip: 'Expose what could fail',
      description: 'We surface the exact uncertainties in your idea so you know what to test next.',
      icon: markRaw(AlertTriangle)
    },
    {
      id: 4,
      title: 'Talk',
      tooltip: 'Get real answers',
      description: 'Ask the right questions and collect real feedback — no bias, no guessing.',
      icon: markRaw(Users)
    },
    {
      id: 5,
      title: 'Learn',
      tooltip: 'Turn data into insight',
      description:
        'AI summarizes conversations so you quickly see patterns, objections, and demand.',
      icon: markRaw(Brain)
    },
    {
      id: 6,
      title: 'Refine',
      tooltip: 'Improve with confidence',
      description: 'Update your idea based on real data — or pivot before you waste months.',
      icon: markRaw(RefreshCcw)
    }
  ]

  const activeStep = ref(1)
  const isPlaying = ref(true)
  const stepProgress = ref(0) // 0 to 1
  const transitionName = ref('slide-right')
  const mobileCardRef = ref(null)
  let progressRaf = null
  let startTime = null

  // SWIPE LOGIC
  useSwipe(mobileCardRef, {
    onSwipeEnd(e, direction) {
      if (direction === 'left') nextStep()
      if (direction === 'right') prevStep()
    }
  })

  function updateProgress(timestamp) {
    if (!startTime) startTime = timestamp
    const elapsed = timestamp - startTime
    const duration = 4000 // 4 seconds

    stepProgress.value = Math.min(elapsed / duration, 1)

    if (elapsed >= duration) {
      startTime = timestamp
      nextStep(false)
      progressRaf = requestAnimationFrame(updateProgress)
    } else {
      progressRaf = requestAnimationFrame(updateProgress)
    }
  }

  function startRotation() {
    if (progressRaf) return
    startTime = null
    progressRaf = requestAnimationFrame(updateProgress)
  }

  function stopRotation() {
    if (progressRaf) {
      cancelAnimationFrame(progressRaf)
      progressRaf = null
    }
    stepProgress.value = 0
  }

  function togglePlay() {
    isPlaying.value = !isPlaying.value
    if (isPlaying.value) {
      startRotation()
    } else {
      stopRotation()
    }
  }

  function handleStepClick(id, isManual = true) {
    transitionName.value = id > activeStep.value ? 'slide-right' : 'slide-left'
    activeStep.value = id

    // Reset progress
    startTime = performance.now()
    stepProgress.value = 0

    // Stop auto-play ONLY on manual interaction
    if (isManual && isPlaying.value) {
      isPlaying.value = false
      stopRotation()
    }
  }

  function nextStep(isManual = true) {
    if (activeStep.value < steps.length) {
      handleStepClick(activeStep.value + 1, isManual)
    } else {
      if (isManual) {
        navigateTo('/recommendation')
      } else {
        // Loop back to start on autoplay
        handleStepClick(1, false)
      }
    }
  }

  function prevStep(isManual = true) {
    if (activeStep.value > 1) {
      handleStepClick(activeStep.value - 1, isManual)
    }
  }

  onMounted(() => {
    startRotation()
  })

  onUnmounted(() => {
    stopRotation()
  })

  const currentStep = computed(() => steps.find((s) => s.id === activeStep.value) || steps[0])
  const ringRadius = 46
  const ringCircumference = 2 * Math.PI * ringRadius
  const totalSteps = computed(() => steps.length)
  const overallProgress = computed(() => {
    const base = (activeStep.value - 1) / totalSteps.value
    const segment = stepProgress.value / totalSteps.value
    return Math.min(base + segment, 1)
  })
  const ringDashOffset = computed(() => ringCircumference * (1 - overallProgress.value))

  const tooltip = reactive({
    x: 0,
    y: 0,
    visible: false,
    text: ''
  })

  const cx = 150
  const cy = 150
  const outerR = 130
  const innerR = 95
  const arrowDepth = 18
  const gap = 6

  function polar(cx, cy, r, angle) {
    const rad = ((angle - 90) * Math.PI) / 180
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    }
  }

  function createArrow(i, total) {
    const slice = 360 / total
    const headSize = 12 // degrees for the arrow head

    const startAngle = i * slice + gap
    const endAngle = (i + 1) * slice - gap

    const centerR = (outerR + innerR) / 2
    const bodyThickness = (outerR - innerR) * 0.7
    const headThickness = (outerR - innerR) * 1.1

    const bOuterR = centerR + bodyThickness / 2
    const bInnerR = centerR - bodyThickness / 2
    const hOuterR = centerR + headThickness / 2
    const hInnerR = centerR - headThickness / 2

    const headBaseAngle = endAngle - headSize

    // Points
    const p1 = polar(cx, cy, bOuterR, startAngle) // tail outer
    const p2 = polar(cx, cy, bOuterR, headBaseAngle) // body-head junction outer
    const p3 = polar(cx, cy, hOuterR, headBaseAngle) // head base outer
    const p4 = polar(cx, cy, centerR, endAngle) // tip
    const p5 = polar(cx, cy, hInnerR, headBaseAngle) // head base inner
    const p6 = polar(cx, cy, bInnerR, headBaseAngle) // body-head junction inner
    const p7 = polar(cx, cy, bInnerR, startAngle) // tail inner

    const largeArc = headBaseAngle - startAngle > 180 ? 1 : 0

    return `
      M ${p1.x} ${p1.y}
      A ${bOuterR} ${bOuterR} 0 ${largeArc} 1 ${p2.x} ${p2.y}
      L ${p3.x} ${p3.y}
      L ${p4.x} ${p4.y}
      L ${p5.x} ${p5.y}
      L ${p6.x} ${p6.y}
      A ${bInnerR} ${bInnerR} 0 ${largeArc} 0 ${p7.x} ${p7.y}
      Z
    `
  }

  function showTooltip(e, text) {
    tooltip.x = e.clientX
    tooltip.y = e.clientY
    tooltip.visible = true
    tooltip.text = text
  }

  function moveTooltip(e) {
    tooltip.x = e.clientX
    tooltip.y = e.clientY
  }

  function hideTooltip() {
    tooltip.visible = false
  }
</script>

<template>
  <main
    class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 px-6 py-24"
  >
    <!-- DOT GRID BACKGROUND -->
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.03] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]"
      style="
        background-image: radial-gradient(#000 1px, transparent 1px);
        background-size: 24px 24px;
      "
    ></div>

    <div class="relative z-10 w-full max-w-4xl text-center">
      <h1 class="mb-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
        Validate your idea before you build
      </h1>
      <p class="mb-16 text-lg font-medium text-slate-600 sm:mb-20 sm:text-xl">
        Stop guessing. Get real signals in days, not months.
      </p>

      <!-- DESKTOP DIAGRAM (HIDDEN ON MOBILE) -->
      <div
        class="group/cycle relative mx-auto mb-20 hidden h-[450px] w-[450px] items-center justify-center sm:flex"
      >
        <!-- PREMIUM PLAY/PAUSE CONTROL -->
        <button
          @click="togglePlay"
          class="absolute -right-6 -top-6 z-30 rounded-full border border-slate-200 bg-white/90 p-2.5 text-slate-400 opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-emerald-200 hover:text-emerald-600 focus:opacity-100 group-hover/cycle:opacity-100"
          :title="isPlaying ? 'Pause Rotation' : 'Start Rotation'"
        >
          <Pause v-if="isPlaying" class="h-4 w-4 fill-current" />
          <Play v-else class="ml-0.5 h-4 w-4 fill-current" />
        </button>
        <!-- BACKGROUND GLOW FOR SELECTED ARROW -->
        <div
          class="pointer-events-none absolute inset-0 transition-transform duration-700 ease-in-out"
          :style="{ transform: `rotate(${(activeStep - 1) * (360 / steps.length)}deg)` }"
        >
          <div
            class="absolute left-1/2 top-0 h-full w-full -translate-x-1/2 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.08),transparent)] blur-3xl"
          />
        </div>

        <!-- THE NEW SVG LOOP -->
        <ClientOnly>
          <svg viewBox="0 0 300 300" class="relative z-10 h-full w-full drop-shadow-2xl">
            <defs>
              <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#059669" />
                <stop offset="100%" stop-color="#34d399" />
              </linearGradient>
              <linearGradient id="inactiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fafaf9" />
                <stop offset="100%" stop-color="#f5f5f4" />
              </linearGradient>
            </defs>
            <g
              v-for="(step, i) in steps"
              :key="step.id"
              @click="handleStepClick(step.id)"
              @mouseenter="showTooltip($event, step.tooltip)"
              @mousemove="moveTooltip"
              @mouseleave="hideTooltip"
              class="cursor-pointer transition-all duration-300"
              :opacity="activeStep === step.id ? 1 : 0.7"
            >
              <path
                :d="createArrow(i, steps.length)"
                :fill="activeStep === step.id ? 'url(#activeGradient)' : 'url(#inactiveGradient)'"
              />
              <!-- ICON INSIDE ARROW -->
              <foreignObject
                :x="polar(cx, cy, (outerR + innerR) / 2, (i + 0.5) * (360 / steps.length)).x - 10"
                :y="polar(cx, cy, (outerR + innerR) / 2, (i + 0.5) * (360 / steps.length)).y - 10"
                width="20"
                height="20"
                class="pointer-events-none"
              >
                <component
                  :is="step.icon"
                  :class="activeStep === step.id ? 'text-white' : 'text-slate-400'"
                  class="h-5 w-5 transition-colors duration-300"
                />
              </foreignObject>
            </g>
          </svg>
        </ClientOnly>

        <!-- CENTERED LABEL (OPTIONAL) -->
        <div class="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div class="text-center">
            <span
              class="mb-1 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"
              >Validation</span
            >
            <span class="text-xl font-black text-slate-900">Cycle</span>
          </div>
        </div>

        <!-- TOOLTIP -->
        <div
          v-if="tooltip.visible"
          class="pointer-events-none fixed z-50 rounded-md bg-slate-900 px-3 py-2 text-sm text-white shadow-lg transition"
          :style="{
            top: tooltip.y + 12 + 'px',
            left: tooltip.x + 12 + 'px'
          }"
        >
          {{ tooltip.text }}
        </div>
      </div>

      <!-- DESKTOP INFO CARD (BELOW LOOP) -->
      <div class="mb-16 hidden flex-col items-center sm:flex">
        <div
          :key="activeStep"
          class="animate-in fade-in slide-in-from-bottom-4 flex w-full max-w-xl items-start gap-8 rounded-3xl border border-slate-100 bg-white p-10 text-left shadow-xl duration-500"
        >
          <div
            class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"
          >
            <component :is="currentStep.icon" class="h-8 w-8" />
          </div>
          <div class="flex-1">
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-2xl font-black text-slate-900">{{ currentStep.title }}</h3>
              <span class="text-xs font-bold uppercase tracking-widest text-slate-400">
                Step {{ activeStep }} of {{ steps.length }}
              </span>
            </div>
            <p class="mb-6 text-lg font-medium leading-relaxed text-slate-600">
              {{ currentStep.description }}
            </p>

            <div class="flex items-center justify-between">
              <button
                @click="nextStep"
                class="group inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800"
              >
                {{ activeStep === steps.length ? 'Start validating' : 'Next step' }}
                <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <!-- MINI PROGRESS INDICATOR -->
              <div class="flex gap-1.5">
                <div
                  v-for="i in steps.length"
                  :key="i"
                  class="h-1.5 w-1.5 rounded-full transition-all duration-300"
                  :class="activeStep === i ? 'w-4 bg-emerald-500' : 'bg-slate-200'"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MOBILE ONBOARDING FLOW (HIDDEN ON DESKTOP) -->
      <div class="mx-auto mb-12 w-full max-w-sm sm:hidden">
        <!-- Progress Ring -->
        <div class="mb-8 flex flex-col items-center">
          <div class="relative h-32 w-32">
            <svg class="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" :r="ringRadius" fill="none" stroke="#e2e8f0" stroke-width="10" />
              <circle
                cx="60"
                cy="60"
                :r="ringRadius"
                fill="none"
                stroke="#059669"
                stroke-width="10"
                stroke-linecap="round"
                :stroke-dasharray="ringCircumference"
                :stroke-dashoffset="ringDashOffset"
                class="transition-[stroke-dashoffset] duration-100 ease-linear"
              />
            </svg>

            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-[10px] font-bold uppercase text-slate-500">Step</span>
              <span class="text-2xl font-black text-slate-900">
                {{ activeStep }}<span class="text-sm text-slate-400">/{{ steps.length }}</span>
              </span>
            </div>
          </div>

          <div class="mt-4 flex gap-1.5">
            <div
              v-for="i in steps.length"
              :key="`mobile-step-${i}`"
              class="h-1.5 rounded-full transition-all duration-300"
              :class="activeStep === i ? 'w-5 bg-emerald-600' : 'w-1.5 bg-slate-300'"
            />
          </div>
        </div>

        <!-- Step Card -->
        <div ref="mobileCardRef" class="relative min-h-[420px]">
          <Transition :name="transitionName">
            <div
              :key="activeStep"
              class="absolute inset-0 flex flex-col rounded-3xl border border-slate-100 bg-white p-8 text-left shadow-xl"
            >
              <div
                class="mb-6 inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"
              >
                <component :is="currentStep.icon" class="h-8 w-8" />
              </div>

              <h2 class="mb-3 text-2xl font-black text-slate-900">{{ currentStep.title }}</h2>
              <p class="mb-8 grow font-medium leading-relaxed text-slate-600">
                {{ currentStep.description }}
              </p>

              <div class="flex shrink-0 flex-col gap-3">
                <button
                  @click="nextStep"
                  class="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 font-bold text-white shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
                >
                  {{ activeStep === steps.length ? 'Start validating' : 'Next step' }}
                  <ArrowRight class="h-5 w-5" />
                </button>

                <button
                  v-if="activeStep > 1"
                  @click="prevStep"
                  class="w-full py-2 text-sm font-bold text-slate-400 transition-colors hover:text-slate-600"
                >
                  ← Back
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- CTA (HIDDEN ON MOBILE AS IT'S INTEGRATED INTO FLOW) -->
      <div class="hidden flex-col items-center gap-4 sm:flex">
        <NuxtLink
          to="/recommendation"
          class="inline-flex items-center gap-x-2 rounded-full bg-slate-900 px-10 py-5 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-slate-800 active:scale-95"
        >
          Start validating your idea
          <span aria-hidden="true">→</span>
        </NuxtLink>
        <p class="text-sm font-bold text-slate-400">Takes 2 minutes. No signup required.</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
  /* SPRING-LIKE SLIDE ANIMATIONS */
  .slide-right-enter-active,
  .slide-right-leave-active,
  .slide-left-enter-active,
  .slide-left-leave-active {
    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .slide-right-enter-from {
    opacity: 0;
    transform: translateX(30px) scale(0.95);
  }
  .slide-right-leave-to {
    opacity: 0;
    transform: translateX(-30px) scale(0.95);
  }

  .slide-left-enter-from {
    opacity: 0;
    transform: translateX(-30px) scale(0.95);
  }
  .slide-left-leave-to {
    opacity: 0;
    transform: translateX(30px) scale(0.95);
  }

  /* Ensure cards overlap correctly during transition */
  .slide-right-leave-active,
  .slide-left-leave-active {
    position: absolute;
  }
</style>
