<template>
  <div>
    <el-container>
      <el-header>
        <div>
          <div id="logo">
            CDTU Drive
          </div>
        </div>
        <div class="some-icons">
          <el-badge :value="12" class="item">
            <i class="fas fa-bell" />
          </el-badge>
          <div>
            <img src="https://cdn.harrisonlee.net/hl.jpg">
          </div>
          <div @click="logout">
            <i class="fas fa-sign-out-alt" />
          </div>
        </div>
      </el-header>
    </el-container>
  </div>
</template>

<script>
export default {
  methods: {
    logout () {
      this.$axios.get('/api/logout')
        .then((res) => {
          this.$router.push('/login')
        })
    }
  }
}
</script>

<style  lang="scss" scoped>
$header-height: 62px;
  .el-header{
    background-color: #fff;
    color: #000;
    text-align: center;
    height: $header-height !important;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ccc;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 12;
    #logo {
      font-size: 30px;
      font-weight: bolder;
    }
  }
  .some-icons {
    height: $header-height;
    display: flex;
    align-items: center;
    i {
      font-size: 24px;
      cursor: pointer;
    }
    img {
      height: 40px;
      width: auto;
      border-radius: 50%;
    }
  }
  .some-icons > div:not(:last-child) {
    margin-right: 100px;
  }
</style>
