<template>
  <div class="container">
    <span>
      请输入该分享的提取码
    </span>
    <el-input v-model="pwd" />
    <el-button type="success" @click="checkShare">
      确认
    </el-button>
  </div>
</template>

<script>
export default {
  layout: 'empty',
  data () {
    return {
      pwd: ''
    }
  },
  methods: {
    checkShare () {
      if (this.pwd.trim().length !== 4) {
        this.$message.error('提取码不正确,请重新输入')
        return
      }
      const sid = this.$route.query.sid
      if (sid) {
        this.$axios.get('/api/share/check', {
          params: {
            shareId: sid,
            pwd: this.pwd
          }
        })
          .then((res) => {
            if (res.data.status === 'OK') {
              this.$router.push(encodeURI(`/share/details?sid=${sid}&path=/`))
            } else {
              this.$message.error('提取码不正确,请重新输入')
            }
          })
      } else {
        this.$router.push('/404')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 300px;
  height: 200px;
  position: absolute;
  background-color: #fff;
  box-shadow: #ccc 0 0 10px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  .el-input {
    width: 80%;
  }
}
</style>
