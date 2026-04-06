<template>
  <div>
    <!-- MOBILE CARDS -->
<div class="space-y-3 md:hidden">
  <div
    v-for="(entry, index) in latestThreeEntries"
    :key="entry.id"
    class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
  >
    <!-- Header -->
    <div class="mb-2 flex items-center justify-between">
      <div class="text-sm font-semibold text-slate-900">
        {{ versionLabel(entry, index) }}
      </div>

      <div class="text-xs text-slate-500">
        v{{ entry.revision_number }}
      </div>
    </div>

    <!-- STACKED SCORES -->
    <div class="space-y-2 text-sm">
      <!-- Market -->
      <div class="flex items-center justify-between">
        <span class="text-slate-500">Market</span>
        <span class="font-medium">
          {{ scoreFor(entry, 'market_score') }}
          <span class="ml-1 text-emerald-600">
            {{ deltaText(entry, index, 'market_score') }}
          </span>
        </span>
      </div>

      <!-- Confidence -->
      <div class="flex items-center justify-between">
        <span class="text-slate-500">Confidence</span>
        <span class="font-medium">
          {{ scoreFor(entry, 'confidence_score') }}
          <span class="ml-1 text-emerald-600">
            {{ deltaText(entry, index, 'confidence_score') }}
          </span>
        </span>
      </div>
    </div>
  </div>
</div>

    <!-- DESKTOP TABLE -->
    <div class="hidden w-full overflow-x-auto md:block">
      <div class="inline-block min-w-full">
        <table
          class="w-full min-w-[640px] table-fixed border-collapse text-xs sm:min-w-[720px] sm:text-sm"
        >
          <colgroup>
            <col class="w-36 sm:w-44" />
            <col
              v-for="entry in latestThreeEntries"
              :key="`col-${entry.id}`"
              :style="dataColumnStyle()"
            />
          </colgroup>
          <thead>
            <tr class="border-b border-slate-200 text-left text-slate-600">
              <th class="sticky left-0 z-10 bg-white px-3 py-2 font-medium"></th>

              <th
                v-for="(entry, index) in latestThreeEntries"
                :key="entry.id"
                class="px-3 py-2 align-top font-medium whitespace-normal break-words leading-tight"
              >
                {{ versionLabel(entry, index) }}
              </th>
            </tr>
          </thead>

          <tbody>
            <!-- Market Score -->
            <tr class="border-b border-slate-100">
              <td class="sticky left-0 z-10 bg-white px-3 py-2.5 font-medium text-slate-700">
                Market Score
              </td>

              <td
                v-for="(entry, index) in latestThreeEntries"
                :key="entry.id"
                class="px-3 py-2.5 align-top"
              >
                {{ scoreFor(entry, 'market_score') }}
                <span class="ml-1 text-emerald-700">
                  {{ deltaText(entry, index, 'market_score') }}
                </span>
              </td>
            </tr>

            <!-- Confidence -->
            <tr>
              <td class="sticky left-0 z-10 bg-white px-3 py-2.5 font-medium text-slate-700">
                Confidence Score
              </td>

              <td
                v-for="(entry, index) in latestThreeEntries"
                :key="entry.id"
                class="px-3 py-2.5 align-top"
              >
                {{ scoreFor(entry, 'confidence_score') }}
                <span class="ml-1 text-emerald-700">
                  {{ deltaText(entry, index, 'confidence_score') }}
                </span>
              </td>
            </tr>

            <!-- Market Breakdown -->
            <tr v-if="marketBreakdownKeys.length">
              <td
                class="sticky left-0 bg-white px-3 py-3 text-xs font-semibold uppercase text-slate-500"
              >
                Market Breakdown
              </td>
              <td v-for="entry in latestThreeEntries" :key="entry.id" />
            </tr>

            <tr v-for="cpKey in marketBreakdownKeys" :key="cpKey">
              <td class="sticky left-0 bg-white px-3 py-2.5 text-slate-700">
                Checkpoint {{ cpKey }}
              </td>

              <td
                v-for="(entry, index) in latestThreeEntries"
                :key="entry.id"
                class="px-3 py-2.5 align-top"
              >
                {{ marketBreakdownValue(entry, cpKey) }}
                <span class="ml-1 text-emerald-700">
                  {{ marketBreakdownDelta(entry, index, cpKey) }}
                </span>
              </td>
            </tr>

            <!-- Confidence Breakdown -->
            <tr v-if="confidenceBreakdownKeys.length">
              <td
                class="sticky left-0 bg-white px-3 py-3 text-xs font-semibold uppercase text-slate-500"
              >
                Confidence Breakdown
              </td>
              <td v-for="entry in latestThreeEntries" :key="entry.id" />
            </tr>

            <tr v-for="cbKey in confidenceBreakdownKeys" :key="cbKey">
              <td class="sticky left-0 bg-white px-3 py-2.5 text-slate-700">
                {{ cbKey.replaceAll('_', ' ') }}
              </td>

              <td
                v-for="(entry, index) in latestThreeEntries"
                :key="entry.id"
                class="px-3 py-2.5 align-top"
              >
                {{ confidenceBreakdownValue(entry, cbKey) }}
                <span class="ml-1 text-emerald-700">
                  {{ confidenceBreakdownDelta(entry, index, cbKey) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    latestThreeEntries: Array,
    marketBreakdownKeys: Array,
    confidenceBreakdownKeys: Array,

    versionLabel: Function,
    scoreFor: Function,
    deltaText: Function,

    marketBreakdownValue: Function,
    marketBreakdownDelta: Function,

    confidenceBreakdownValue: Function,
    confidenceBreakdownDelta: Function
  })

  function dataColumnStyle() {
    const total = Math.max(props.latestThreeEntries?.length || 1, 1)
    return { width: `${100 / total}%` }
  }
</script>
