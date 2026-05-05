import { defineStore } from 'pinia'

function normalizeLead(rawLead) {
  const lead = { ...rawLead }
  const sequenceId = lead.sequence_id ?? lead.sequence?.id ?? null
  const sequenceName = lead.sequence_name ?? lead.sequence?.name ?? null
  const hasNextFollowUpAt = Object.prototype.hasOwnProperty.call(lead, 'next_follow_up_at')
  const followUp = hasNextFollowUpAt ? lead.next_follow_up_at : (lead.follow_up ?? null)

  let sequence = lead.sequence ?? null

  if (!sequence && (sequenceId || sequenceName)) {
    sequence = {
      id: sequenceId,
      name: sequenceName,
      current_step: null,
      total_steps: null,
      next_in: null
    }
  }

  return {
    ...lead,
    follow_up: followUp,
    sequence
  }
}

export const useLeadsStore = defineStore('leads', {
  state: () => ({
    leads: [],
    filters: [],
    sort: {
      field: 'created_at',
      direction: 'desc'
    }
  }),

  getters: {
    filteredLeads(state) {
      let data = [...state.leads]

      state.filters.forEach((filter) => {
        if (filter.field === 'stage') {
          data = data.filter((l) => l.stage === filter.value)
        }

        if (filter.field === 'company') {
          data = data.filter((l) => l.company?.toLowerCase().includes(filter.value.toLowerCase()))
        }
      })

      data.sort((a, b) => {
        const field = state.sort.field

        if (state.sort.direction === 'asc') return a[field] > b[field] ? 1 : -1

        return a[field] < b[field] ? 1 : -1
      })

      return data
    }
  },

  actions: {
    setLeads(data) {
      this.leads = data.map((l) => {
        const normalized = normalizeLead(l)

        return {
          ...normalized,
          activities: normalized.activities || []
        }
      })
    },

    addLead(lead) {
      const newLead = normalizeLead({
        ...lead,
        activities: lead?.activities || []
      })

      this.leads = [newLead, ...this.leads] // ✅ NEW reference (important)
    },

    setActivities(leadId, activities) {
      const lead = this.leads.find((l) => l.id === leadId)
      if (!lead) return

      lead.activities = activities
    },

    addActivity(leadId, activity) {
      const lead = this.leads.find((l) => l.id === leadId)
      if (!lead) return

      if (!lead.activities) lead.activities = []

      // prevent duplicate (important)
      const exists = lead.activities.find((a) => a.id === activity.id)
      if (exists) return

      lead.activities.unshift({
        id: activity.id || Date.now(),
        ...activity,
        created_at: activity.created_at || activity.date || new Date().toISOString()
      })
    },

    updateLead(updated) {
      if (!updated) return

      const index = this.leads.findIndex((l) => l.id === updated.id)

      if (index !== -1) {
        const newLeads = [...this.leads]

        newLeads[index] = normalizeLead({
          ...newLeads[index],
          ...updated
        })

        this.leads = newLeads // 🔥 NEW ARRAY REFERENCE
      }
    }
  }
})
