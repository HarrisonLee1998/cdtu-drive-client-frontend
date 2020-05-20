export default function ({ app, redirect, $axios }) {
  $axios.onError((error) => {
    try {
      if (error.response.status === 401) {
        redirect('/login')
      }
    } catch (error) {
      // app.$message.error('暂无权限，请先登录')
    }
  })
  $axios.onResponse((response) => {
    if (response.data.status === 'NOT_FOUND') {
      redirect('/404')
    } else if (response.data.status === 'INTERNAL_SERVER_ERROR') {
      // app.$message.error('系统内部出现错误')
    }
  })
}
