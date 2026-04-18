export default defineNuxtRouteMiddleware(async (to) => {
  await bootstrapUser()
  const user = useUser()

  if (!user.value) {
    return navigateTo({
      path: '/signup-login',
      query: { redirect: to.fullPath }
    })
  }
})
