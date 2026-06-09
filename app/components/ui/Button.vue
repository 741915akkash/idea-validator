<script setup>
  const props = defineProps({
    to: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: 'primary' // primary | secondary
    }
  })

  const base = 'inline-block rounded px-6 py-3 text-base font-medium transition'

  const styles = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
    secondary: 'border border-emerald-600 text-emerald-500 hover:bg-emerald-500/10'
  }

  const classes = `${base} ${styles[props.variant]}`
</script>

<template>
  <NuxtLink v-if="to" :to="to" :class="classes">
    <slot />
  </NuxtLink>

  <button v-else :class="classes">
    <slot />
  </button>
</template>
