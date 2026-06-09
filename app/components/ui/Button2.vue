<script setup>
  const props = defineProps({
    to: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: 'primary' // primary | secondary | neutral | danger
    },
    size: {
      type: String,
      default: 'md' // sm | md | lg
    },
    disabled: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['click'])

  // base styles
  const base =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none'

  // sizes (important for settings vs landing page)
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  // variants
  const variants = {
    primary: 'bg-app-hover text-app-text hover:bg-app-card',
    secondary: 'border border-app-border bg-app-panel text-app-text hover:bg-app-hover',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    danger: 'bg-rose-600 text-white hover:bg-rose-700'
  }

  const classes = computed(() => [
    base,
    sizes[props.size],
    variants[props.variant],
    props.disabled ? 'opacity-50 cursor-not-allowed' : ''
  ])
</script>

<template>
  <!-- LINK -->
  <NuxtLink v-if="to" :to="to" :class="classes">
    <slot />
  </NuxtLink>

  <!-- BUTTON -->
  <button v-else :disabled="disabled" :class="classes" @click="$emit('click')">
    <slot />
  </button>
</template>
