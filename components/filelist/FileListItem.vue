<template>
  <div>
    <div
      class="file-list-item-info"
      @click.left="selectFile"
      @contextmenu.prevent="showMenu"
    >
      <div v-if="file.isFolder" class="file-list-item-title">
        <i v-if="file.isFolder" class="fas fa-folder file-icon folder-icon" />
        <nuxt-link :to="'/?path=' + encodeURI(file.fpath)">
          <span class="file-name">{{ file.fname }}</span>
        </nuxt-link>
      </div>
      <div v-else class="file-list-item-title">
        <i :class="[iconClass, 'file-icon']" />
        <span class="file-name">{{ file.fname }}</span>
      </div>
      <span class="file-list-item-size">{{ size }}</span>
      <span class="file-list-item-date">{{ file.lastUpdateDate }}</span>
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
          复制到
        </div>
        <div class="menu-item">
          移动到
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    file: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      icons: {
        // file
        docx: 'far fa-file-word',
        html: 'far fa-file-code',
        pdf: 'fas fa-file-pdf',
        txt: 'far fa-file-alt',
        md: 'fab fa-markdown',
        // image
        jpg: 'fas fa-image',
        png: 'fas fa-image',
        jpeg: 'fas fa-image',
        gif: 'fas fa-image',
        bmp: 'fas fa-image',
        mp4: 'fas fa-video',
        mp3: 'fas fa-music'
      }
    }
  },
  computed: {
    size () {
      if (this.file.isFolder) {
        return '-'
      }
      const K = 1024
      const M = K * 1024
      const G = M * 1024
      const size = this.file.fsize
      if (size < K) {
        return size + 'B'
      } else if (size >= K && size < M) {
        return Math.round(size / K * 100) / 100 + 'KB'
      } else if (size >= M && size < G) {
        return Math.round(size / M * 100) / 100 + 'MB'
      } else {
        return Math.round(size / G * 100) / 100 + 'GB'
      }
    },
    iconClass () {
      const s = this.file.fname.split('.')
      const ext = s[s.length - 1]
      if (s.length > 0 && this.icons[ext]) {
        return this.icons[ext]
      } else {
        return 'far fa-question-circle'
      }
    }
  },
  methods: {
    showMenu (e) {
      this.hiddenMenu()
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
    },
    selectFile () {
      this.$emit('toggleSelected', this.file)
    }
  }
}
</script>

<style lang="scss" scoped>
$file-height: 44px;
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
.file-list-item-info {
  width: 100%;
  display: flex;
}
.file-list-item-info:hover,
#click-file {
  background-color: azure;
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
.fa-file-word {
  color: #0f96df;
}
.fa-file-pdf {
  color: deeppink;
}

</style>
