<template>
  <div>
    <el-container>
      <el-header>
        <div>
          <nuxt-link id="logo" to="/">
            CDTU Drive
          </nuxt-link>
        </div>
        <div class="some-icons">
          <!-- <el-badge :value="12" class="item">
            <i class="fas fa-bell" />
          </el-badge> -->
          <div v-if="!user">
            <el-button type="text" @click="dialog = true">
              LOGIN
            </el-button>
          </div>
          <div v-if="user">
            <nuxt-link to="/user/details">
              <img :src="avatarSrc">
            </nuxt-link>
          </div>
          <div v-if="user" @click="logout">
            <i class="fas fa-sign-out-alt" />
          </div>
        </div>
      </el-header>

      <el-dialog
        title="Login"
        :visible.sync="dialog"
        width="30%"
      >
        <div class="login-form">
          <div>
            <span>ID</span><el-input v-model="id" autocomplete="off" />
          </div>
          <div>
            <span>密码</span><el-input v-model="password" type="password" autocomplete="off" />
          </div>
        </div>

        <span slot="footer" class="dialog-footer">
          <el-button @click="dialog = false">取 消</el-button>
          <el-button type="primary" @click="login">确 定</el-button>
        </span>
      </el-dialog>
    </el-container>
  </div>
</template>

<script>
export default {
  data () {
    return {
      user: null,
      dialog: false,
      id: '',
      password: '',
      avatarSrc: 'https://cdn.harrisonlee.net/hl.jpg'
    }
  },
  created () {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'user/setUser') {
        this.user = state.user
      }
    })
    this.user = this.$store.getters['user/getUser']
    this.avatarSrc = `http://localhost:8080/user/avatar?id=${this.user.id}`
  },
  methods: {
    login () {
      if (this.checkLogin()) {
        this.$axios.post('/api/login', {
          id: this.id,
          password: this.password
        }).then((res) => {
          if (res.data.status === 'OK') {
            this.$message({
              message: '登录成功',
              type: 'success'
            })
            const user = res.data.map.user
            this.$store.commit('user/setUser', user)
          }
        })
      }
    },
    checkLogin () {
      this.dialog = false
      this.id = this.id.trim()
      this.password = this.password.trim()
      if (this.id === '' || this.password === '') {
        this.$message.error('请输入正确的用户ID和密码')
        return false
      } else {
        return true
      }
    },
    logout () {
      this.$axios.get('/api/logout')
        .then((res) => {
          this.$router.push('/login')
          this.$store.commit('user/setUser', null)
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
      text-decoration: none;
      color: inherit;
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
  .login-form {
    span {
      display: inline-block;
      width: 40px;
    }
    .el-input {
      width: 80%;
      margin: 20px 0;
    }
  }

</style>
