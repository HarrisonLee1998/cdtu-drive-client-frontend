export default async function (context) {
  const { $axios, route, redirect } = context
  const white = ['/login', '/404', '/share/details', '/share/entry']
  const path = route.path
  if (!white.includes(path)) {
    try {
      await $axios({
        url: '/api/login/check',
        method: 'get'
      }).then((res) => {
        // 放行
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
