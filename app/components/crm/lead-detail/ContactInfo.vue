<script setup>
  import { Mail, Phone, Building2, Globe } from 'lucide-vue-next'

  const props = defineProps({
    lead: { type: Object, required: true },
    editingField: String,
    editValue: [String, Number]
  })

  const emit = defineEmits(['start-edit', 'save-edit', 'update-value'])
</script>

<template>
  <div class="border-t border-gray-50 bg-white p-6">
    <h3
      class="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400"
    >
      <Building2 class="h-3 w-3" /> Contact Info
    </h3>
    <div class="space-y-4">
      <!-- Email -->
      <div class="group flex items-center">
        <span class="w-24 shrink-0 text-[11px] font-bold uppercase tracking-wider text-gray-400"
          >Email</span
        >
        <div class="min-w-0 flex-1">
          <input
            v-if="editingField === 'email'"
            id="edit-email"
            :value="editValue"
            @input="$emit('update-value', $event.target.value)"
            @blur="$emit('save-edit')"
            @keyup.enter="$emit('save-edit')"
            class="w-full border-b border-emerald-500 text-sm font-medium text-gray-900 outline-none"
          />
          <span
            v-else
            @click="$emit('start-edit', 'email', lead.email)"
            class="-ml-1 flex cursor-pointer items-center gap-2 rounded px-1 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            {{ lead.email }}
            <Mail
              class="h-3 w-3 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </span>
        </div>
      </div>

      <!-- Phone -->
      <div class="group flex items-center">
        <span class="w-24 shrink-0 text-[11px] font-bold uppercase tracking-wider text-gray-400"
          >Phone</span
        >
        <div class="min-w-0 flex-1">
          <input
            v-if="editingField === 'phone'"
            id="edit-phone"
            :value="editValue"
            @input="$emit('update-value', $event.target.value)"
            @blur="$emit('save-edit')"
            @keyup.enter="$emit('save-edit')"
            class="w-full border-b border-emerald-500 text-sm font-medium text-gray-900 outline-none"
          />
          <span
            v-else
            @click="$emit('start-edit', 'phone', lead.phone || '')"
            class="-ml-1 flex cursor-pointer items-center gap-2 rounded px-1 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 group-hover:text-emerald-600"
            :class="!lead.phone ? 'italic text-gray-300' : ''"
          >
            {{ lead.phone || 'Not provided' }}
            <Phone
              class="h-3 w-3 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </span>
        </div>
      </div>

      <!-- Company -->
      <div class="group flex items-center">
        <span class="w-24 shrink-0 text-[11px] font-bold uppercase tracking-wider text-gray-400"
          >Company</span
        >
        <div class="min-w-0 flex-1">
          <input
            v-if="editingField === 'company'"
            id="edit-company"
            :value="editValue"
            @input="$emit('update-value', $event.target.value)"
            @blur="$emit('save-edit')"
            @keyup.enter="$emit('save-edit')"
            class="w-full border-b border-emerald-500 text-sm font-medium text-gray-900 outline-none"
          />
          <span
            v-else
            @click="$emit('start-edit', 'company', lead.company)"
            class="-ml-1 flex cursor-pointer items-center gap-2 rounded px-1 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            {{ lead.company }}
            <Building2
              class="h-3 w-3 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </span>
        </div>
      </div>

      <!-- Website -->
      <div class="group flex items-center">
        <span class="w-24 shrink-0 text-[11px] font-bold uppercase tracking-wider text-gray-400"
          >Website</span
        >
        <div class="min-w-0 flex-1">
          <input
            v-if="editingField === 'website'"
            id="edit-website"
            :value="editValue"
            @input="$emit('update-value', $event.target.value)"
            @blur="$emit('save-edit')"
            @keyup.enter="$emit('save-edit')"
            class="w-full border-b border-emerald-500 text-sm font-medium text-gray-900 outline-none"
          />
          <span
            v-else
            @click="$emit('start-edit', 'website', lead.website || '')"
            class="-ml-1 flex cursor-pointer items-center gap-2 rounded px-1 text-sm font-medium text-gray-900 underline decoration-gray-100 underline-offset-4 transition-colors hover:bg-gray-50 group-hover:text-emerald-600"
            :class="!lead.website ? 'italic text-gray-300' : ''"
          >
            {{ lead.website || '—' }}
            <Globe
              class="h-3 w-3 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
