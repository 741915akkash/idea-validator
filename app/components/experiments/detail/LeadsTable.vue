<script setup>
  import { Users, ExternalLink } from 'lucide-vue-next'

  defineProps({
    leads: {
      type: Array,
      required: true
    }
  })

  const emit = defineEmits(['view-crm'])
</script>

<template>
  <section class="overflow-hidden rounded-2xl border border-app-border text-app-text shadow-sm">
    <div class="flex items-center justify-between border-b border-app-border p-6">
      <div class="flex items-center gap-2 font-semibold text-app-text">
        <Users class="h-4 w-4 text-app-muted" />
        Leads generated from this experiment
      </div>
      <button
        @click="emit('view-crm')"
        class="text-nuxt-green flex items-center gap-1 text-xs font-bold hover:underline"
      >
        VIEW ALL IN CRM <ExternalLink class="h-3 w-3" />
      </button>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-app-card text-[10px] font-bold uppercase text-app-muted">
            <th class="px-6 py-4">Name</th>
            <th class="px-6 py-4">Stage</th>
            <th class="px-6 py-4 text-right">Value</th>
            <th class="px-6 py-4">Source</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-mono text-sm italic">
          <tr v-for="lead in leads" :key="lead.id" class="transition-colors hover:bg-app-card">
            <td class="px-6 py-4 font-semibold not-italic text-app-text">{{ lead.name }}</td>
            <td class="px-6 py-4">
              <span
                :class="
                  lead.stage === 'Closed'
                    ? 'bg-green-500/10 text-green-700'
                    : 'bg-blue-500/10 text-blue-700'
                "
                class="rounded-full px-2 py-0.5 text-[10px] font-bold"
              >
                {{ lead.stage }}
              </span>
            </td>
            <td class="px-6 py-4 text-right text-app-muted">${{ lead.value || '-' }}</td>
            <td class="px-6 py-4 text-app-muted">{{ lead.source }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
