<script setup>
  import { Check, X, ClipboardList, Users, Sparkles } from 'lucide-vue-next'

  const categories = [
    {
      name: 'Validator',
      icon: ClipboardList,
      features: [
        { name: 'Active ideas', free: '2', growth: '5', founder: '5' },
        { name: 'Archived ideas', free: '3', growth: '50', founder: '100' },
        { name: 'Revisions per idea', free: '30', growth: 'Unlimited', founder: 'Unlimited' },
        { name: 'Freeform interviews', free: '30/mo', growth: 'Unlimited', founder: 'Unlimited' },
        { name: 'Structured validation (AI)', free: '❌', growth: 'Full', founder: 'Full' },
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
        { name: 'Contacts', free: '100', growth: '5,000', founder: '25,000' },
        { name: 'Pipelines', free: '1', growth: 'Unlimited', founder: 'Unlimited' },
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
  ]

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
