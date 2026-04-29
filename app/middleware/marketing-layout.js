export default defineNuxtRouteMiddleware(async () => {
  await bootstrapUser()
  const user = useUser()

  if (user.value) {
    setPageLayout('app')
  }
})
