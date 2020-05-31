<template>
  <div>
    分享详情
  </div>
</template>

<script>
export default {
  data () {
    return {
      pathName: '/'
    }
  },
  created () {
    const sid = this.$route.query.sid
    console.log(sid)
  }
}
</script>
