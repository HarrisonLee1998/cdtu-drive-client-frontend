<template>
  <div>
    <div
      class="file-list-item-info"
      @click.left="selectFile"
      @contextmenu.prevent="showMenu"
    >
      <div v-if="file.isFolder" class="file-list-item-title">
        <i v-if="file.isFolder" class="fas fa-folder file-icon folder-icon" />
        <nuxt-link v-if="file.isDelete===0" :to="handlePath()">
          <span class="file-name">{{ file.fname }}</span>
        </nuxt-link>
        <span v-else class="file-name">{{ file.fname }}</span>
      </div>
      <div v-else class="file-list-item-title">
        <i :class="[iconClass, 'file-icon']" />
        <span class="file-name">{{ file.fname }}</span>
      </div>
      <span class="file-list-item-size">{{ size }}</span>
      <span class="file-list-item-date">{{ file.lastUpdateDate }}</span>
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
    selectFile () {
      // this.$emit('toggleSelected', this.file)
    },
    showMenu (e) {
      this.$emit('showMenu', e, this.file)
    },
    handlePath () {
      const url = this.$route.path
      const path = this.file.fpath
      const sid = this.$route.query.sid
      const gid = this.$route.query.gid
      if (sid) {
        return encodeURI(`${url}?sid=${sid}&path=${path}`)
      } else if (gid) {
        return encodeURI(`${url}?gid=${gid}&path=${path}`)
      } else {
        return encodeURI(`${url}?path=${path}`)
      }
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
.file-list-item-info:hover{
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

</style>

<style lang="scss">
.fa-file-word {
  color: #0f96df;
}
.fa-file-pdf {
  color: deeppink;
}

</style>
