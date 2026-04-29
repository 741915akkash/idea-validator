import { defineStore } from 'pinia'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    currentUser: null // 🔥 ADD THIS
  }),

  getters: {
    me: (state) => state.currentUser
  },

  actions: {
    setUsers(data) {
      if (Array.isArray(data)) {
        this.users = data
      } else if (Array.isArray(data?.rows)) {
        this.users = data.rows
      } else {
        this.users = []
      }

      // 🔥 auto sync current user if exists
      if (this.currentUser?.id) {
        const updated = this.users.find((u) => u.id === this.currentUser.id)
        if (updated) {
          this.currentUser = updated
        }
      }
    },

    setCurrentUser(user) {
      this.currentUser = user
    },

    updateCurrentUser(updated) {
      if (!this.currentUser) return

      this.currentUser = {
        ...this.currentUser,
        ...updated
      }

      // also update inside users array
      const index = this.users.findIndex((u) => u.id === updated.id)
      if (index !== -1) {
        this.users[index] = {
          ...this.users[index],
          ...updated
        }
      }
    }
  }
})
