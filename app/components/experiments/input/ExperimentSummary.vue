<script setup>
  defineProps({
    form: {
      type: Object,
      required: true
    }
  })

  const emit = defineEmits(['save'])
</script>

<template>
  <aside class="space-y-6 self-start lg:sticky lg:top-8 lg:col-span-2">
    <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
      <h3
        class="mb-8 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-900"
      >
        <div class="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
        Experiment Specification
      </h3>

      <div class="space-y-8">
        <!-- Audience Section -->
        <div class="space-y-4">
          <p
            class="border-b border-slate-100 pb-2 text-[11px] font-extrabold uppercase tracking-widest text-slate-500"
          >
            01. Target Audience
          </p>
          <table class="w-full text-left">
            <tbody class="text-sm">
              <tr>
                <td class="py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Persona
                </td>
                <td class="py-2 text-right font-bold text-slate-900">
                  {{ form.audience.persona }}
                </td>
              </tr>
              <tr>
                <td class="py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Stage
                </td>
                <td class="py-2 text-right font-semibold text-slate-600">
                  {{ form.audience.stage }}
                </td>
              </tr>
              <tr>
                <td class="py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Industry
                </td>
                <td class="py-2 text-right font-semibold text-slate-600">
                  {{ form.audience.industry || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Message Section -->
        <div class="space-y-4">
          <p
            class="border-b border-slate-100 pb-2 text-[11px] font-extrabold uppercase tracking-widest text-slate-500"
          >
            02. Messaging Strategy
          </p>
          <table class="w-full text-left">
            <tbody class="text-sm">
              <tr>
                <td class="py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Core Pain
                </td>
                <td class="py-2 text-right font-bold text-slate-900">
                  {{ form.message.pain || '-' }}
                </td>
              </tr>
              <tr>
                <td class="py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Angle
                </td>
                <td class="py-2 text-right">
                  <span
                    class="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-600"
                    >{{ form.message.angle }}</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
          <div class="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p class="mb-1 text-[9px] font-bold uppercase text-slate-400">Hook Preview</p>
            <p class="text-[11px] font-medium italic leading-relaxed text-slate-700">
              "{{ form.message.hook }}"
            </p>
          </div>
        </div>

        <!-- Offer Section -->
        <div class="space-y-4">
          <p
            class="border-b border-slate-100 pb-2 text-[11px] font-extrabold uppercase tracking-widest text-slate-500"
          >
            03. The Offer
          </p>
          <table class="w-full text-left">
            <tbody class="text-sm">
              <tr>
                <td class="py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Type
                </td>
                <td class="py-2 text-right font-bold text-slate-900">{{ form.offer.type }}</td>
              </tr>
              <tr>
                <td class="py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Price
                </td>
                <td class="py-2 text-right font-bold text-emerald-600">₹{{ form.offer.price }}</td>
              </tr>
              <tr>
                <td class="py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Value Prop
                </td>
                <td class="py-2 text-right text-xs font-medium text-slate-600">
                  {{ form.offer.value || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Global Variable Section -->
        <div class="space-y-4">
          <p
            class="border-b border-slate-100 pb-2 text-[11px] font-extrabold uppercase tracking-widest text-slate-500"
          >
            04. Deployment
          </p>
          <table class="w-full text-left">
            <tbody class="text-sm">
              <tr>
                <td
                  class="py-2 text-[11px] font-bold uppercase tracking-wider text-rose-500 text-slate-500"
                >
                  Test Variable
                </td>
                <td class="py-2 text-right">
                  <span
                    class="rounded-md bg-rose-50 px-2 py-1 text-[9px] font-extrabold uppercase text-rose-600 ring-1 ring-rose-200"
                    >{{ form.variable }}</span
                  >
                </td>
              </tr>
              <tr>
                <td class="py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Platform
                </td>
                <td class="py-2 text-right font-bold text-slate-900">
                  {{ form.distribution.platform }}
                </td>
              </tr>
              <tr>
                <td class="py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Volume
                </td>
                <td class="py-2 text-right font-bold text-slate-600">
                  {{ form.distribution.volume }} leads
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="relative pt-6">
          <div
            class="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"
          ></div>
          <button
            @click="emit('save')"
            class="w-full rounded-2xl border border-emerald-500 bg-emerald-600 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:scale-[0.98]"
          >
            Deploy Experiment
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>
