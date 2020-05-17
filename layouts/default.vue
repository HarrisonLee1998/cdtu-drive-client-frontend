<template>
  <div>
    <el-container>
      <el-header>
        <div>
          <div id="logo">
            CDTU Drive
          </div>
        </div>
        <div>右边</div>
      </el-header>
      <div id="main">
        <el-aside id="aside">
          <div v-for="item in items" :key="item.title">
            <div :class="['menu-item', activeLink===item.link ? 'active-menu-item':'']" @click="activeLink = item.link">
              <span><i :class="item.icon" />{{ item.title }}</span>
            </div>
            <div
              v-for="subItem in item.subItems"
              :key="subItem.title"
              :class="['sub-menu-item', activeLink===subItem.link ? 'active-menu-item':'']"
              @click="activeLink = subItem.link"
            >
              <span>{{ subItem.title }}</span>
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
export default {
  data () {
    return {
      items: [
        {
          title: '全部文件',
          icon: 'fas fa-file-alt',
          link: '/filelist',
          subItems: [
            {
              title: '图片',
              link: '/file/picture'
            },
            {
              title: '文档',
              link: '/file/docs'
            },
            {
              title: '视频',
              link: '/file/video'
            },
            {
              title: '音乐',
              link: '/file/music'
            }
          ]
        },
        {
          title: '我的分享',
          icon: 'fas fa-share-alt',
          link: 'share',
          subItems: []
        },
        {
          title: '回收站',
          icon: 'fas fa-trash-alt',
          link: 'trash',
          subItems: []
        }
      ],
      activeLink: ''
    }
  }
}
</script>

<style lang="scss">
  $header-height: 62px;
  $aside-width: 15%;
  $menu-item-height: 38px;
  $main-header-height: 100px;
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
  #main {
    #aside {
      width: $aside-width !important;
      background-color: #f7f7f7;
      position: fixed;
      top: $header-height;
      bottom: 0;
      left: 0;
      font-size: 14px;
      z-index: 12;
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
    }
    .el-main {
      width: 100% - $aside-width !important;
      padding: 0;
      position: relative;
      top: $header-height;
      left: $aside-width;
    }
  }
</style>
