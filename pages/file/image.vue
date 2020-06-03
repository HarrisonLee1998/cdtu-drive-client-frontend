<template>
  <div class="container">
    <div class="images">
      <div v-for="img in pageInfo.list" :key="img.id">
        <img :src="'http://localhost:8080/file/content?id=' + img.fid">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      type: 'image',
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
.images {
  display: flex;
  flex-wrap: wrap;
  img {
    width: 200px;
    height: 200px;
    margin: 5px;
  }
  img:hover {
    cursor: pointer;
  }
}
</style>
