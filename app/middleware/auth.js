export default defineNuxtRouteMiddleware(async (to) => {
  await bootstrapUser()
  const user = useUser()

  if (!user.value) {
    return navigateTo({
      path: '/general/signup-login',
      query: { redirect: to.fullPath }
    })
  }
})
