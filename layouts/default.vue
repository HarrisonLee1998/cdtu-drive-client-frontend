<template>
  <div>
    <div class="header">
      <Header />
    </div>
    <el-container>
      <!-- <el-header>
        <div>
          <div id="logo">
            CDTU Drive
          </div>
        </div>
        <div>右边</div>
      </el-header> -->
      <div id="main">
        <el-aside id="aside">
          <div class="nav">
            <div v-for="item in items" :key="item.title">
              <nuxt-link :to="item.link">
                <div :class="['menu-item', activeLink===item.link ? 'active-menu-item':'']" @click="activeLink = item.link">
                  <span><i :class="item.icon" />{{ item.title }}</span>
                </div>
              </nuxt-link>
              <nuxt-link v-for="subItem in item.subItems" :key="subItem.title" :to="subItem.link">
                <div
                  :class="['sub-menu-item', activeLink===subItem.link ? 'active-menu-item':'']"
                  @click="activeLink = subItem.link"
                >
                  <span>{{ subItem.title }}</span>
                </div>
              </nuxt-link>
            </div>
          </div>
          <div class="space">
            <el-progress :percentage="percentage" :format="format" />
            <div class="space-details">
              <span>{{ uss }} / {{ tss }}</span>
              <span><a href="#">扩容申请</a></span>
            </div>
          </div>
        </el-aside>
        <el-main>
          <nuxt />
        </el-main>
      </div>
    </el-container>
  </div>
</template>

<script>
import Header from '~/components/Header'
export default {
  components: {
    Header
  },
  data () {
    return {
      items: [
        {
          title: '全部文件',
          icon: 'fas fa-file-alt',
          link: '/',
          subItems: [
            {
              title: '图片',
              link: '/file/image'
            },
            {
              title: '文档',
              link: '/file/doc'
            },
            {
              title: '视频',
              link: '/file/video'
            },
            {
              title: '音乐',
              link: '/file/audio'
            }
          ]
        },
        {
          title: '我的分享',
          icon: 'fas fa-share-alt',
          link: '/share',
          subItems: []
        },
        {
          title: '我的共享',
          icon: 'fas fa-users',
          link: '/group',
          subItems: []
        },
        {
          title: '回收站',
          icon: 'fas fa-trash-alt',
          link: '/file/trash',
          subItems: []
        }
      ],
      activeLink: '',
      percentage: 0,
      user: { uss: 0, tss: 0 }
    }
  },
  computed: {
    tss () {
      const value = this.user.tss / (1024 * 1024 * 1024)
      return value.toFixed(2) + 'GB'
    },
    uss () {
      const K = 1024
      const M = K * 1024
      const G = M * 1024
      const size = this.user.uss
      if (size < K) {
        return size + 'B'
      } else if (size >= K && size < M) {
        return Math.round(size / K * 100) / 100 + 'KB'
      } else if (size >= M && size < G) {
        return Math.round(size / M * 100) / 100 + 'MB'
      } else {
        return Math.round(size / G * 100) / 100 + 'GB'
      }
    }
  },
  mounted () {
    const user = this.$store.getters['user/getUser']
    this.user = user
    if (user) {
      this.user = user
      this.percentage = Math.ceil((user.uss / user.tss) * 100)
    }
    this.$store.subscribe((mutation) => {
      if (mutation.type === 'file/setRefreshFolder') {
        this.getUser()
      }
    })
  },
  methods: {
    format (percentage) {
      return percentage === 100 ? '满' : `${percentage}%`
    },
    getUser () {
      this.$axios.get('/api/user', {
        params: {
          id: this.user.id
        }
      }).then((res) => {
        if (res.data.status === 'OK') {
          this.user = res.data.map.user
          this.$store.commit('user/setUser', this.user)
        }
      })
    }
  }
}
</script>

<style lang="scss">
  $header-height: 62px;
  $aside-width: 15%;
  $menu-item-height: 38px;
  $main-header-height: 100px;
  .header {
    height: $header-height;
  }
  #main {
    width: 100%;
    #aside {
      width: $aside-width !important;
      background-color: #f7f7f7;
      position: fixed;
      top: $header-height;
      bottom: 0;
      left: 0;
      font-size: 14px;
      z-index: 12;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      a {
        text-decoration: none;
        color: #000;
      }
      .menu-item, .sub-menu-item {
        height: $menu-item-height;
        line-height: $menu-item-height;
        cursor: pointer;
      }
      .menu-item:hover,
      .sub-menu-item:hover,
      .active-menu-item {
        background-color: rgb(216, 215, 215);
      }
      .menu-item {
        padding-left: 10%;
        i {
          width: 10%;
        }
      }
      .sub-menu-item {
          padding-left: 20%;
      }
      .active-menu-item {
        color: deepskyblue;
      }
      .space {
        height: 100px;
        padding: 0 10px;
        // display: flex;
        // align-items: center;
        .space-details {
          margin-top: 10px;
          display: flex;
          justify-content: space-between;
          .el-progress__text {
            text-align: right;
          }
          a {
            text-decoration: none;
            color: #409eff;
          }
        }
      }
    }
    .el-main {
      width: 100% - $aside-width !important;
      padding: 0;
      position: relative;
      // top: $header-height;
      left: $aside-width;
    }
  }
</style>
