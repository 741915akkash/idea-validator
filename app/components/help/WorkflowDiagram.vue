<template>
  <div class="py-2">
    <div class="mx-auto flex flex-col gap-24 px-6 py-10 lg:px-14 lg:py-16">
      <!-- GRAPH GROUPS -->
      <div v-for="(group, groupIndex) in graphGroups" :key="groupIndex" class="flex flex-col gap-5">
        <!-- ROWS OF 3 -->
        <template v-for="(row, rowIndex) in chunkNodes(group.nodes, 3)" :key="rowIndex">
          <!-- ROW -->
          <div class="flex flex-col items-center gap-8 lg:flex-row lg:justify-start lg:gap-0">
            <template v-for="(node, index) in row" :key="node.id">
              <!-- NODE -->
              <div
                class="relative z-10 flex w-full max-w-[320px] shrink-0 items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-5 py-4 shadow-sm lg:w-52"
              >
                <!-- NUMBER -->
                <div
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[14px] font-semibold text-white"
                >
                  {{ workflow.nodes.findIndex((n) => n.id === node.id) + 1 }}
                </div>

                <!-- LABEL -->
                <div class="text-left text-sm font-semibold leading-6 text-gray-900">
                  {{ node.label }}
                </div>
              </div>

              <!-- DESKTOP CONNECTOR -->
              <div
                v-if="index !== row.length - 1"
                class="relative hidden h-4 w-20 shrink-0 overflow-visible lg:block"
              >
                <!-- line -->
                <div class="absolute top-1/2 h-[2px] w-16 -translate-y-1/2 bg-emerald-500" />

                <!-- triangle -->
                <div
                  class="absolute left-16 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[6px] border-l-[10px] border-y-transparent border-l-emerald-500"
                />
              </div>

              <!-- MOBILE CONNECTOR -->
              <div
                v-if="index !== row.length - 1"
                class="relative flex h-10 w-4 items-center justify-center overflow-visible lg:hidden"
              >
                <!-- line -->
                <div class="h-full w-[2px] bg-emerald-500" />

                <!-- arrow -->
                <div
                  class="absolute -bottom-[1px] h-2 w-2 rotate-45 border-b-2 border-r-2 border-emerald-500"
                />
              </div>
            </template>
          </div>

          <!-- CONNECT TO NEXT ROW -->
          <div
            v-if="rowIndex !== chunkNodes(group.nodes, 3).length - 1"
            class="relative hidden h-8 lg:block"
          >
            <!-- vertical from last node -->
            <div class="absolute -top-4 right-[8rem] h-4 w-[2px] bg-emerald-500" />

            <!-- horizontal -->
            <div class="absolute left-[8rem] top-0 h-[2px] w-[calc(100%-16rem)] bg-emerald-500" />

            <!-- vertical into next row -->
            <div class="absolute left-[8rem] top-0 h-11 w-[2px] bg-emerald-500" />

            <!-- triangle entering next row -->
            <div
              class="absolute left-[calc(8rem-5px)] top-[38px] h-0 w-0 border-x-[6px] border-t-[10px] border-x-transparent border-t-emerald-500"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, nextTick, onMounted, watch, onBeforeUnmount } from 'vue'

  const props = defineProps({
    workflow: {
      type: Object,
      required: true
    }
  })

  const containerRef = ref(null)

  const nodeRefs = ref({})
  const positions = ref({})

  const isMobile = ref(false)

  function updateScreen() {
    isMobile.value = window.innerWidth < 1024
  }

  function chunkNodes(nodes, size) {
    const chunks = []

    for (let i = 0; i < nodes.length; i += size) {
      chunks.push(nodes.slice(i, i + size))
    }

    return chunks
  }

  //GRAPH GROUPS
  const graphGroups = computed(() => {
    const groups = []
    let currentEdges = []

    props.workflow.edges.forEach((edge, index) => {
      currentEdges.push(edge)

      const next = props.workflow.edges[index + 1]

      // NEW GROUP
      if (!next || edge[1] !== next[0]) {
        const nodeIds = [...new Set(currentEdges.flat())]

        groups.push({
          nodes: nodeIds.map((id) => props.workflow.nodes.find((n) => n.id === id)),

          edges: [...currentEdges]
        })

        currentEdges = []
      }
    })

    return groups
  })

  // RESPONSIVE ROWS
  const rows = computed(() => {
    // MOBILE = vertical stack
    if (isMobile.value) {
      return props.workflow.nodes.map((node) => [node])
    }

    // DESKTOP = left-to-right rows
    const chunks = []
    const nodesPerRow = 3

    for (let i = 0; i < props.workflow.nodes.length; i += nodesPerRow) {
      const row = props.workflow.nodes.slice(i, i + nodesPerRow)

      chunks.push(row)
    }

    return chunks
  })

  function setNodeRef(el, nodeId) {
    if (!el) return

    nodeRefs.value[nodeId] = el
  }

  async function calculatePositions() {
    await nextTick()

    if (!containerRef.value) return

    const containerRect = containerRef.value.getBoundingClientRect()

    const mapped = {}

    Object.entries(nodeRefs.value).forEach(([nodeId, el]) => {
      if (!el) return

      const rect = el.getBoundingClientRect()

      const left = rect.left - containerRect.left
      const top = rect.top - containerRect.top

      mapped[nodeId] = {
        left,
        top,
        right: left + rect.width,
        bottom: top + rect.height,
        width: rect.width,
        height: rect.height,
        centerX: left + rect.width / 2,
        centerY: top + rect.height / 2
      }
    })

    positions.value = mapped
  }

  // SVG SIZE
  const svgWidth = computed(() => {
    const values = Object.values(positions.value)

    if (!values.length) return 1200

    return Math.max(...values.map((p) => p.right)) + 120
  })

  const svgHeight = computed(() => {
    const values = Object.values(positions.value)

    if (!values.length) return 800

    return Math.max(...values.map((p) => p.bottom)) + 120
  })

  // EDGE RENDERING
  function renderedEdges(group) {
    return group.edges
      .map(([from, to]) => {
        const start = positions.value[from]
        const end = positions.value[to]

        if (!start || !end) return null

        const sameRow = Math.abs(start.centerY - end.centerY) < 40

        // MOBILE VERTICAL
        if (isMobile.value) {
          return {
            key: `${from}-${to}`,

            path: `
              M ${start.centerX} ${start.bottom}
              L ${start.centerX} ${(start.bottom + end.top) / 2}
              L ${end.centerX} ${(start.bottom + end.top) / 2}
              L ${end.centerX} ${end.top}
            `
          }
        }

        // DESKTOP HORIZONTAL SAME ROW
        if (sameRow) {
          return {
            key: `${from}-${to}`,

            path: `
              M ${start.right} ${start.centerY}
              L ${(start.right + end.left) / 2} ${start.centerY}
              L ${(start.right + end.left) / 2} ${end.centerY}
              L ${end.left} ${end.centerY}
            `
          }
        }

        // DESKTOP ROW CHANGE
        return {
          key: `${from}-${to}`,

          path: `
            M ${start.centerX} ${start.bottom}
            L ${start.centerX} ${(start.bottom + end.top) / 2}
            L ${end.centerX} ${(start.bottom + end.top) / 2}
            L ${end.centerX} ${end.top}
          `
        }
      })
      .filter(Boolean)
  }

  onMounted(() => {
    updateScreen()

    calculatePositions()

    window.addEventListener('resize', updateScreen)
    window.addEventListener('resize', calculatePositions)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateScreen)
    window.removeEventListener('resize', calculatePositions)
  })

  watch(
    () => props.workflow,
    async () => {
      await calculatePositions()
    },
    {
      deep: true
    }
  )

  watch(isMobile, async () => {
    await calculatePositions()
  })
</script>
