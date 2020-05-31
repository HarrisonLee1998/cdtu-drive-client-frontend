<template>
  <div class="container">
    <span>
      请输入该分享的提取码
    </span>
    <el-input v-model="pwd" />
    <el-button type="success">
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
