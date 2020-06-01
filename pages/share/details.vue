<template>
  <div class="container">
    <div class="btns">
      <el-button v-show="btnShow.saveShare" type="primary">
        保存分享
      </el-button>
      <el-button v-show="btnShow.cancelShare" type="primary">
        取消分享
      </el-button>
    </div>
    <div class="paths">
      <span class="path" @click="go('/')">全部文件</span>
      <span v-for="path in paths" :key="path.path" class="path" @click="go(path.path)">{{ path.name }}</span>
    </div>
    <div class="file-list-header file-item">
      <el-checkbox class="file-item-checkbox" />
      <div class="file-item-info">
        <div class="file-list-item-title">
          文件名
        </div>
        <div class="file-list-item-size">
          文件大小
        </div>
        <div class="file-list-item-date">
          更新日期
        </div>
      </div>
    </div>
    <div v-for="file in fileList" :key="file.id" class="file-item">
      <el-checkbox class="file-item-checkbox" />
      <FileListItem :file="file" class="file-item-info" />
    </div>
    <div v-if="fileList.length === 0" class="empty-list">
      当前目录下没有文件
    </div>
  </div>
</template>

<script>
import FileListItem from '~/components/filelist/FileListItem'
export default {
  layout: 'onlyHeader',
  components: {
    FileListItem
  },
  data () {
    return {
      showError: false,
      fileList: [],
      user: null,
      share: null,
      sid: '',
      pathName: '',
      btnShow: {
        cancelShare: false,
        saveShare: true
      }
    }
  },
  computed: {
    paths () {
      const array = this.pathName.split('/').filter(p => p.trim() !== '')
      const paths = []
      let p = '/'
      array.forEach((s) => {
        const path = {}
        path.name = s
        if (p !== '/') {
          p = p + '/' + s
        } else {
          p = p + s
        }
        path.path = p
        paths.push(path)
      })
      return paths
    }
  },
  watch: {
    $route () {
      this.handlePathName()
    }
  },
  created () {
    this.handlePathName()
  },
  methods: {
    getFileList () {
      this.$axios.get('/api/file/folder/share', {
        params: {
          shareId: this.sid,
          path: this.pathName
        }
      })
        .then((res) => {
          if (res.data.status === 'OK') {
            this.showError = false
            this.fileList = res.data.map.list
          } else {
            this.showError = true
          }
        })
    },
    getShare () {

    },
    handlePathName () {
      const sid = this.$route.query.sid
      const pathName = this.$route.query.path
      if (!sid || sid.trim() === '') {
        this.showError = true
        return
      } else {
        //
        this.sid = sid
      }
      if (!pathName || pathName.trim() === '') {
        this.$router.push(encodeURI(`/share/details?sid=${sid}&path=${pathName}`))
      } else {
        this.pathName = pathName
        this.getFileList()
      }
    },
    go (path) {
      const url = encodeURI(`/share/details?sid=${this.sid}&path=${path}`)
      this.$router.push(url)
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 90%;
  margin: 5% auto;
}
.paths {
  margin: 20px 0;
  .path {
    cursor: pointer;
  }
  .path:last-child {
    color: #409eff;
  }
  .path:not(:last-child)::after {
    content: '>';
    margin: 0 10px;
  }
}
.file-item {
  height: 40px;
  line-height: 40px;
  display: flex;
  justify-content: space-between;
  .file-item-checkbox {
    width: 5%;
  }
  .file-item-info {
    display: flex;
    justify-content: space-between;
    width: 95%;
  }
}
.empty-list {
  height: 100px;
  line-height: 100px;
  text-align: center;
}
</style>
