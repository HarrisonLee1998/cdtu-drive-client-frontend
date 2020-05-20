export default async function (context) {
  // 这里只需要发起请求，所有的后续处理，在axios拦截器那里进行
  const { $axios, route, redirect } = context
  const white = ['/login', '/404']
  if (!white.includes(route.path)) {
    try {
      await $axios({
        url: '/api/login/check',
        method: 'get'
      }).then((res) => {
        // redirect('/')
      })
    } catch (error) {
      redirect('/login')
    }
  }
}
