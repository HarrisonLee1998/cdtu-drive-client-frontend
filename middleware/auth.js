export default async function (context) {
  // 这里只需要发起请求，所有的后续处理，在axios拦截器那里进行
  const { $axios, route, redirect } = context
  const white = ['/login', '/404', '/share/details', '/share/entry']
  const path = route.path
  if (!white.includes(path)) {
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
  } else if (route.path === '/share/details') {
    const sid = route.query.sid
    await $axios({
      url: '/api/share/check',
      params: {
        shareId: sid,
        pwd: ''
      }
    }).then((res) => {
      if (res.data.status === 'OK') {
        // 放行
      } else {
        //
        const url = encodeURI(`/share/entry?sid=${sid}`)
        redirect(url)
      }
    })
  }
}
