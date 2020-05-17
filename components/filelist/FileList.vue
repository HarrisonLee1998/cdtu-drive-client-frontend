<template>
  <div>
    <div class="file-list">
      <div class="file-list-header file">
        <el-checkbox name="type" class="file-list-item-checkbox" @change="selectAll" />
        <span class="file-list-item-title header-field">文件名</span>
        <span class="file-list-item-size header-field">大小</span>
        <span class="file-list-item-date header-field">修改日期</span>
      </div>
      <div v-for="(file, i) in files" :key="i" class="file">
        <el-checkbox v-model="file.selected" name="type" class="file-list-item-checkbox" />
        <div
          class="file-list-item-info"
          @click.left="file.selected = !file.selected"
          @contextmenu.prevent="showMenu"
        >
          <div class="file-list-item-title">
            <i v-if="file.isFolder" class="fas fa-folder file-icon folder-icon" />
            <i v-else :class="[icons[file.fileType], 'file-icon']" />
            <span class="file-name">{{ file.fileName }}</span>
          </div>
          <span class="file-list-item-size">{{ file.fileSize }}</span>
          <span class="file-list-item-date">{{ file.fileDate }}</span>
        </div>
      </div>
    </div>
    <div ref="contextMenu" class="context-menu">
      这是菜单
    </div>
  </div>
</template>

<script>
// import FileListItem from './FileListItem'
export default {
  components: {
    // FileListItem
  },
  data () {
    return {
      files: [],
      clickFile: null,
      icons: {
        docx: 'far fa-file-word',
        img: 'fas fa-image',
        video: 'fas fa-video',
        music: 'fas fa-music'
      }
    }
  },
  created () {
    // 模拟获取数据
    this.initData()
  },
  methods: {
    initData () {
      const data = []
      const types = ['docx', 'video', 'img', 'music']
      for (let i = 0; i < 30; ++i) {
        const obj = {}
        if (new Date().getTime() % 2 === 0) {
          obj.isFolder = true
          obj.fileSize = '-'
        } else {
          obj.isFolder = false
          obj.fileSize = Math.ceil(Math.random() * 1000)
          obj.fileType = types[obj.fileSize % types.length]
        }
        obj.fileName = Math.random().toString(36).substr(2)
        obj.fileDate = this.$moment(new Date()).format('yyyy/MM/DD HH:mm')
        obj.selected = false
        data.push(obj)
      }
      data.sort((x, y) => {
        if (x.isFolder === y.isFolder) {
          return 0
        } else if (y.isFolder) {
          return 1
        } else {
          return -1
        }
      })
      this.files = data
    },
    selectAll (selected) {
      if (selected) {
        this.files.forEach((file) => {
          file.selected = true
        })
      } else {
        this.files.forEach((file) => {
          file.selected = false
        })
      }
    },
    showMenu (e) {
      if (this.clickFile) {
        this.clickFile.removeAttribute('id', 'click-file')
      }
      const x = e.clientX
      const y = e.clientY
      const menu = this.$refs.contextMenu
      const file = e.path[1]
      this.clickFile = file
      file.setAttribute('id', 'click-file')
      menu.style.display = 'block'
      menu.style.position = 'fixed'
      menu.style.top = y + 'px'
      menu.style.left = x + 'px'
      window.addEventListener('mousewheel', this.hiddenMenu)
      window.addEventListener('click', this.hiddenMenu)
    },
    hiddenMenu () {
      if (this.clickFile) {
        this.clickFile.removeAttribute('id', 'click-file')
      }
      const menu = this.$refs.contextMenu
      menu.style.display = 'none'
      window.removeEventListener('mousewheel', this.hiddenMenu)
      window.removeEventListener('click', this.hiddenMenu)
    }
  }
}
</script>

<style lang="scss">
$file-height: 44px;
.file {
  display: flex;
  justify-content: space-between;
  height: $file-height;
  line-height: $file-height;
  .file-list-item-checkbox {
    width: 5%;
  }
  .file-list-item-info {
    width: 95%;
    display: flex;
    align-items: center;
  }
  .file-list-item-title {
    width: 80%;
  }
  .file-list-item-size{
    width: 5%;
  }
  .file-list-item-date {
    width: 15%;
  }
  .file:not(:last-child) {
    border-bottom: 1px solid #eee;
  }
}
.file-list-item-info:hover,
.header-field:hover,
#click-file {
  background-color: azure;
}

.context-menu {
  display: none;
  z-index: 100;
  width:150px;
  height:200px;
  background:#fff;
  box-shadow:#ccc 0px 0px 10px;//将h-shadow,v-shadow设为0px,实现四周阴影
}

.file-icon {
  margin-right: 10px;
  font-size: 16px;
}
.folder-icon {
  color: #ffd659;
}
.file-name {
  font-size: 12px;
  cursor: pointer;
}
.file-name:hover {
  color: deepskyblue;
}
</style>
