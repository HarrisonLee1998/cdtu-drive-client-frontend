<template>
  <div class="container">
    <div v-show="playVideo">
      <video :src="targetSrc" controls="controls" />
    </div>
    <div v-for="file in pageInfo.list" :key="file.id">
      {{ file.fname }} <el-button @click="handlePlay(file)">
        播放
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      type: 'video',
      pageInfo: {},
      pageNo: 1,
      pageSize: 50,
      targetSrc: '',
      playVideo: false
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
    },
    handlePlay (file) {
      this.playVideo = true
      this.targetSrc = 'http://localhost:8080/file/content?id=' + file.fid
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
