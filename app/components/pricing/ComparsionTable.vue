<script setup>
  import { Check, X, ClipboardList, Users, Sparkles } from 'lucide-vue-next'
  import { computed } from 'vue'

  const { data: pricingLimits } = await useFetch('/api/billing/public-limits', {
    default: () => ({ tiers: {} })
  })

  function formatLimit(entry, { showMonthlySuffix = false, trueLabel = '✅' } = {}) {
    if (!entry) return null
    if (entry.enabled === false) return '❌'
    if (entry.limit == null) return 'Unlimited'
    if (typeof entry.limit !== 'number') return null
    const base = Number(entry.limit).toLocaleString('en-US')
    if (showMonthlySuffix && entry.period === 'monthly') return `${base}/mo`
    if (typeof trueLabel === 'string' && entry.limit > 0 && entry.enabled === true) return base
    return base
  }

  const dynamicLimits = computed(() => {
    const tiers = pricingLimits.value?.tiers || {}
    const free = tiers.free || {}
    const growth = tiers.growth || {}
    const founder = tiers.founder || {}

    return {
      activeIdeas: {
        free: formatLimit(free.activeIdeas) || '2',
        growth: formatLimit(growth.activeIdeas) || '5',
        founder: formatLimit(founder.activeIdeas) || '5'
      },
      archivedIdeas: {
        free: formatLimit(free.archivedIdeas) || '3',
        growth: formatLimit(growth.archivedIdeas) || '50',
        founder: formatLimit(founder.archivedIdeas) || '100'
      },
      revisionsPerIdea: {
        free: formatLimit(free.revisionsPerIdea) || '30',
        growth: formatLimit(growth.revisionsPerIdea) || 'Unlimited',
        founder: formatLimit(founder.revisionsPerIdea) || 'Unlimited'
      },
      freeformInterviewsPerIdeaPerMonth: {
        free:
          formatLimit(free.freeformInterviewsPerIdeaPerMonth, { showMonthlySuffix: true }) || '30/mo',
        growth: formatLimit(growth.freeformInterviewsPerIdeaPerMonth) || 'Unlimited',
        founder: formatLimit(founder.freeformInterviewsPerIdeaPerMonth) || 'Unlimited'
      },
      structuredValidation: {
        free: free.structuredValidation?.enabled ? 'Full' : '❌',
        growth: growth.structuredValidation?.enabled ? 'Full' : '❌',
        founder: founder.structuredValidation?.enabled ? 'Full' : '❌'
      },
      contacts: {
        free: formatLimit(free.contacts) || '500',
        growth: formatLimit(growth.contacts) || '10,000',
        founder: formatLimit(founder.contacts) || '25,000'
      },
      pipelines: {
        free: formatLimit(free.pipelines) || '1',
        growth: formatLimit(growth.pipelines) || 'Unlimited',
        founder: formatLimit(founder.pipelines) || 'Unlimited'
      }
    }
  })

  const categories = computed(() => [
    {
      name: 'Validator',
      icon: ClipboardList,
      features: [
        {
          name: 'Active ideas',
          free: dynamicLimits.value.activeIdeas.free,
          growth: dynamicLimits.value.activeIdeas.growth,
          founder: dynamicLimits.value.activeIdeas.founder
        },
        {
          name: 'Archived ideas',
          free: dynamicLimits.value.archivedIdeas.free,
          growth: dynamicLimits.value.archivedIdeas.growth,
          founder: dynamicLimits.value.archivedIdeas.founder
        },
        {
          name: 'Revisions per idea',
          free: dynamicLimits.value.revisionsPerIdea.free,
          growth: dynamicLimits.value.revisionsPerIdea.growth,
          founder: dynamicLimits.value.revisionsPerIdea.founder
        },
        {
          name: 'Freeform interviews',
          free: dynamicLimits.value.freeformInterviewsPerIdeaPerMonth.free,
          growth: dynamicLimits.value.freeformInterviewsPerIdeaPerMonth.growth,
          founder: dynamicLimits.value.freeformInterviewsPerIdeaPerMonth.founder
        },
        {
          name: 'Structured validation (AI)',
          free: dynamicLimits.value.structuredValidation.free,
          growth: dynamicLimits.value.structuredValidation.growth,
          founder: dynamicLimits.value.structuredValidation.founder
        },
        { name: 'AI scoring & breakdown', free: '❌', growth: '✅', founder: '✅' },
        { name: 'Compare revisions', free: '✅', growth: '✅', founder: '✅' },
        { name: 'Notes & diff tracking', free: '✅', growth: '✅', founder: '✅' },
        { name: 'History view', free: '✅', growth: '✅', founder: '✅' }
      ]
    },
    {
      name: 'CRM',
      icon: Users,
      features: [
        {
          name: 'Contacts',
          free: dynamicLimits.value.contacts.free,
          growth: dynamicLimits.value.contacts.growth,
          founder: dynamicLimits.value.contacts.founder
        },
        {
          name: 'Pipelines',
          free: dynamicLimits.value.pipelines.free,
          growth: dynamicLimits.value.pipelines.growth,
          founder: dynamicLimits.value.pipelines.founder
        },
        {
          name: 'Stages per pipeline',
          free: 'Unlimited',
          growth: 'Unlimited',
          founder: 'Unlimited'
        },
        { name: 'Custom fields', free: 'Basic', growth: 'Custom', founder: 'Custom' },
        { name: 'Notes & activity', free: 'Basic', growth: 'Full', founder: 'Full' }
      ]
    },
    {
      name: 'AI & Growth Engine',
      icon: Sparkles,
      features: [
        {
          name: 'Social lead finder',
          free: '❌',
          growth: 'Included (when released)',
          founder: 'Generous (when released)',
          badge: 'COMING SOON'
        },
        {
          name: 'Market research agent',
          free: '❌',
          growth: 'Included (when released)',
          founder: 'Generous (when released)',
          badge: 'COMING SOON'
        },
        { name: 'AI priority / speed', free: '❌', growth: 'Standard', founder: 'High' },
        { name: 'Early feature access', free: '❌', growth: '✅', founder: '✅' },
        { name: 'Priority support', free: '❌', growth: '✅', founder: '✅' }
      ]
    }
  ])

  const isCheck = (val) => val === '✅'
  const isCross = (val) => val === '❌'
</script>

<template>
  <div class="mt-20 sm:mt-32">
    <h2 class="mb-8 text-center text-2xl font-extrabold text-slate-900 sm:mb-12 sm:text-3xl">
      Compare features
    </h2>

    <!-- SCROLL CONTAINER -->
    <div class="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
      <table class="w-full min-w-[720px] table-fixed border-collapse bg-white text-left">
        <!-- HEADER -->
        <thead>
          <tr class="bg-slate-100">
            <th class="min-w-[220px] px-6 py-4 text-sm font-semibold text-slate-700">
              <div class="max-w-[220px]">Feature</div>
            </th>
            <th class="min-w-[150px] px-6 py-4 text-center text-sm font-semibold text-slate-700">
              Free
            </th>
            <th class="min-w-[150px] px-6 py-4 text-center text-sm font-semibold text-slate-700">
              Growth
            </th>
            <th class="min-w-[150px] px-6 py-4 text-center text-sm font-semibold text-slate-700">
              Founder
            </th>
          </tr>
        </thead>

        <!-- BODY -->
        <tbody>
          <template v-for="cat in categories" :key="cat.name">
            <tr class="border-t border-slate-200 bg-slate-100">
              <td colspan="4" class="px-6 py-3 text-sm font-semibold text-slate-900">
                <div class="flex items-center gap-2">
                  <component :is="cat.icon" class="h-5 w-5 text-emerald-500" />
                  {{ cat.name }}
                </div>
              </td>
            </tr>

            <tr
              v-for="f in cat.features"
              :key="f.name"
              class="border-b border-slate-100 bg-white transition hover:bg-slate-50"
            >
              <td class="px-6 py-4 text-sm text-slate-700 align-top">
                <div class="flex flex-col items-start gap-1">
                  <span class="max-w-[220px] break-words whitespace-normal">{{ f.name }}</span>
                  <span
                    v-if="f.badge"
                    class="inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 ring-1 ring-emerald-600/20"
                  >
                    {{ f.badge }}
                  </span>
                </div>
              </td>

              <td class="px-6 py-4 text-center align-middle">
                <Check v-if="isCheck(f.free)" class="mx-auto block h-5 w-5 text-emerald-600" />
                <X v-else-if="isCross(f.free)" class="mx-auto block h-5 w-5 text-rose-500" />
                <span v-else class="text-sm font-medium text-slate-800">
                  {{ f.free }}
                </span>
              </td>

              <td class="px-6 py-4 text-center align-middle">
                <Check v-if="isCheck(f.growth)" class="mx-auto block h-5 w-5 text-emerald-600" />
                <X v-else-if="isCross(f.growth)" class="mx-auto block h-5 w-5 text-rose-500" />
                <span v-else class="text-sm font-medium text-slate-800">
                  {{ f.growth }}
                </span>
              </td>

              <td class="px-6 py-4 text-center align-middle">
                <Check v-if="isCheck(f.founder)" class="mx-auto block h-5 w-5 text-emerald-600" />
                <X v-else-if="isCross(f.founder)" class="mx-auto block h-5 w-5 text-rose-500" />
                <span v-else class="text-sm font-medium text-slate-800">
                  {{ f.founder }}
                </span>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
