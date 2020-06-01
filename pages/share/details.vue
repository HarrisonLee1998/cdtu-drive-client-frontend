<template>
  <div class="container">
    <div class="btns">
      <el-button v-show="btnShow.saveShare" type="primary" @click="beforeSaveShare">
        保存分享
      </el-button>
      <el-button v-show="btnShow.cancelShare" type="primary" @click="cancelShare">
        取消分享
      </el-button>
    </div>
    <div class="paths">
      <span class="path" @click="go('/')">全部文件</span>
      <span v-for="path in paths" :key="path.path" class="path" @click="go(path.path)">{{ path.name }}</span>
    </div>
    <div class="file-list-header file-item">
      <el-checkbox v-model="selectAll" class="file-item-checkbox" />
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
    <div v-for="(file, i) in fileList" :key="file.id" class="file-item">
      <el-checkbox v-model="select[i]" class="file-item-checkbox" />
      <FileListItem :file="file" class="file-item-info" />
    </div>
    <div v-if="fileList.length === 0" class="empty-list">
      当前目录下没有文件
    </div>

    <!-- 目录树对话框 -->
    <el-dialog
      title="目录树"
      :visible.sync="dialog.folderTreeDialog"
      width="40%"
    >
      <el-tree
        ref="tree"
        :data="nodes"
        node-key="id"
        highlight-current
        :props="defaultProps"
        accordion
        icon-class="far fa-plus-square"
        @node-click="handleNodeClick"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialog.folderTreeDialog = false">取 消</el-button>
        <el-button type="primary" @click="selectFolderTreeFile">确 定</el-button>
      </span>
    </el-dialog>
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
      },
      selectAll: false,
      select: [],
      targetFile: null,
      nodes: [],
      dialog: {
        folderTreeDialog: false
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
    },
    user () {
      this.checkUser()
      this.getFolderTree()
    },
    share () {
      this.checkUser()
    },
    fileList () {
      this.initSelect(false)
    },
    selectAll () {
      this.initSelect(this.selectAll)
    }
  },
  created () {
    this.handlePathName()
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'user/setUser') {
        this.user = state.user
      }
    })
  },
  methods: {
    initSelect (flag) {
      this.select = []
      this.fileList.forEach(() => {
        this.select.push(flag)
      })
    },
    getFileList () {
      this.$axios.get('/api/share/file/folder', {
        params: {
          shareId: this.sid,
          path: this.pathName
        }
      })
        .then((res) => {
          if (res.data.status === 'OK') {
            this.showError = false
            this.fileList = res.data.map.list
            this.share = res.data.map.share
          } else {
            this.showError = true
          }
        })
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
    },
    beforeSaveShare () {
      if (!this.user) {
        this.$message.error('请先登录')
        return
      }
      this.dialog.folderTreeDialog = true
    },
    checkUser () {
      if (this.share && this.user && this.share.uId === this.user.id) {
        this.btnShow.cancelShare = true
        this.btnShow.saveShare = false
      }
    },
    saveShare () {
      if (!this.targetFile) {
        this.$message.error('请选择目标文件夹')
        return
      }
      const ids = this.getIds()
      if (ids.length > 0) {
        this.$axios.post('/api/share/save', {
          ids
        })
          .then((res) => {
            if (res.data.status === 'OK') {
              this.$message.success('保存分享成功')
            } else {
              this.$message.error('保存分享失败')
            }
          })
      }
    },
    cancelShare () {

    },
    getIds () {
      const ids = []
      for (let i = 0; i < this.fileList.length; ++i) {
        if (this.select[i]) {
          ids.push(this.fileList[i].id)
        }
      }
      if (ids.length === 0) {
        this.$message.error('请先选择文件')
      }
      return ids
    },
    getFolderTree () {
      this.$axios.get('/api/file/folder/tree')
        .then((res) => {
          if (res.data.status === 'OK') {
            this.nodes = []
            this.nodes.push(res.data.map.nodes)
          }
        })
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
  .path:not(:last-child) {
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
