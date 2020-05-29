<template>
  <div>
    <div class="path-tree">
      <span class="path"><nuxt-link :to="'/?path=' + encodeURI('/')">全部文件</nuxt-link></span>
      <span v-for="(path) in paths" :key="path.path" class="path">
        <nuxt-link :to="'/?path=' + encodeURI(path.path)">{{ path.name }}</nuxt-link>
      </span>
    </div>
    <div class="file-list">
      <div class="file-wrapper">
        <el-checkbox v-model="allSelected" class="file-list-item-checkbox" @change="selectAll" />
        <div class="file-list-item">
          <span class="file-list-item-title header-field">文件名</span>
          <span class="file-list-item-size header-field">大小</span>
          <span class="file-list-item-date header-field">修改日期</span>
        </div>
      </div>
      <div v-for="(file, i) in fileList" :key="i" class="file-wrapper">
        <el-checkbox
          v-model="file.selected"
          class="file-list-item-checkbox"
          @change="checkAllSelected"
        />
        <FileListItem
          :file="file"
          class="file-list-item"
          @toggleSelected="toggleSelected"
          @showMenu="showMenu"
        />
      </div>
      <div v-show="fileList.length === 0 " class="empty-list">
        <div>当前文件夹下没有文件</div>
      </div>
    </div>
    <div ref="contextMenu" class="context-menu">
      <div class="menu-item-group">
        <div class="menu-item">
          打开
        </div>
        <div class="menu-item">
          下载
        </div>
      </div>
      <div class="menu-item-group">
        <div class="menu-item">
          分享
        </div>
        <div class="menu-item">
          共享
        </div>
      </div>
      <div class="menu-item-group">
        <div class="menu-item">
          复制到
        </div>
        <div class="menu-item">
          移动到
        </div>
      </div>
      <div class="menu-item-group">
        <div class="menu-item">
          删除
        </div>
        <div class="menu-item">
          重命名
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FileListItem from './FileListItem'
export default {
  components: {
    FileListItem
  },
  props: {
    fileList: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      selected: [],
      allSelected: false,
      pathName: null,
      clickFile: {},
      clickFileEle: null
    }
  },
  computed: {
    paths () {
      const data = []
      const path = this.$route.query.path
      const paths = path.split('/').filter(f => f.trim() !== '')
      let temp = ''
      paths.forEach((p) => {
        const obj = {}
        obj.name = p
        temp += '/' + p
        obj.path = temp
        data.push(obj)
      })
      return data
    }
  },
  watch: {
    fileList () {
      this.initSelect(false)
    }
  },
  created () {
  },
  methods: {
    initSelect (flag) {
      this.fileList.forEach((file) => {
        file.selected = flag
      })
    },
    selectAll (selected) {
      this.initSelect(selected)
    },
    checkAllSelected () {
      let flag = true
      for (let i = 0; i < this.fileList.length; ++i) {
        if (!this.fileList[i].selected) {
          flag = false
          break
        }
      }
      this.allSelected = flag
    },
    toggleSelected (file) {
      this.fileList.forEach((f) => {
        if (file.id === f.id) {
          f.selected = !f.selected
          this.checkAllSelected()
          return true
        }
      })
    },
    showMenu (e, file) {
      this.clickFile = file
      const x = e.clientX
      const y = e.clientY
      const menu = this.$refs.contextMenu
      this.clickFileEle = e.path[1]
      this.clickFileEle.setAttribute('id', 'clickFileEle')
      menu.style.display = 'block'
      menu.style.position = 'fixed'
      menu.style.top = y + 'px'
      menu.style.left = x + 'px'
      window.addEventListener('mousewheel', this.hiddenMenu)
      window.addEventListener('click', this.hiddenMenu)
    },
    hiddenMenu () {
      if (this.clickFileEle) {
        this.clickFileEle.removeAttribute('id')
      }
      const menu = this.$refs.contextMenu
      menu.style.display = 'none'
      window.removeEventListener('mousewheel', this.hiddenMenu)
      window.removeEventListener('click', this.hiddenMenu)
    }
  }
}
</script>

<style lang="scss" scoped>
$file-height: 44px;
.file-wrapper {
  .file-list-item-checkbox {
    width: 5%;
  }
  .file-list-item {
    width: 95%;
    display: flex;
    justify-content: space-between;
  }
  display: flex;
  height: $file-height;
  line-height: $file-height;
  justify-content: space-between;
  align-items: center;
}
.header-field:hover{
  background-color: azure;
}

.empty-list {
  text-align: center;
}
.path {
    a {
    text-decoration: none;
    color: #409eff;
  }
  font-size: 14px;
}
.path:not(:last-child)::after {
  content: '>';
  margin: 5px;
}
.context-menu {
  display: none;
  z-index: 100;
  min-width:100px;
  min-height:200px;
  background:#fff;
  box-shadow:#ccc 0px 0px 10px;//将h-shadow,v-shadow设为0px,实现四周阴影
  border-radius: 5px;
  .menu-item-group:not(:last-child) {
    border-bottom: 1px solid #ccc;
  }
  .menu-item {
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    text-align: center;
    cursor: pointer;
    padding: 0 5px;
    margin-bottom: 5px 0;
  }
  .menu-item:hover {
    background-color: #036598;
    color: #fff;
  }
  .menu-item-group::first-child > .menu-item:first-child {
    border-radius: 5px 5px 0 0;
  }
  .menu-item-group::last-child > .menu-item:last-child {
    border-radius: 0 0 5px 5px;
  }
}
</style>

<style lang="scss">
  .file-list-item-title {
    width: 70%;
  }
  .file-list-item-size{
    width: 15%;
  }
  .file-list-item-date {
    width: 15%;
  }
  #clickFileEle {
    background-color: azure;
  }
</style>
