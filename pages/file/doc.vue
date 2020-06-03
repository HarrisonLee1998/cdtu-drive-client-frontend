<template>
  <div class="container">
    <div v-for="file in pageInfo.list" :key="file.id">
      {{ file.fname }}
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      type: 'document',
      pageInfo: {},
      pageNo: 1,
      pageSize: 50
    }
  },
  created () {
    this.getData()
  },
  methods: {
    getData () {
      this.$axios.get(`/api/file/${this.pageNo}/${this.pageSize}/${this.type}`)
        .then((res) => {
          if (res.data.status === 'OK') {
            this.pageInfo = res.data.map.pageInfo
          }
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 90%;
  margin: 5% auto;
}
</style>
