<template>
  <div class="container">
    <div class="btns">
      <el-button type="primary" @click="dialog.userDialog = true">
        查看用户
      </el-button>
      <el-button v-show="groupUser.guType < 2" type="primary" @click="dialog.updateDialog = true">
        修改共享
      </el-button>
      <el-button v-show="groupUser.guType === 0" type="danger" @click="dialog.deleteDialog = true">
        删除共享
      </el-button>
    </div>
    <FileList v-show="showList" :file-list="fileList" :opts="opts" :nodes="nodes" />
    <div class="dialogs">
      <el-dialog
        title="修改共享属性"
        :visible.sync="dialog.updateDialog"
        width="30%"
      >
        <div>
          <div>
            <el-upload
              class="avatar-uploader"
              action="http://localhost:8080/group/avatar"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
              name="file"
              :data="otherData"
            >
              <img v-if="imageUrl" :src="imageUrl" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon" />
            </el-upload>
          </div>
          <div>
            <div class="group-info-field">
              <span class="group-info-filed" />
              <el-input v-model="group.title" placeholder="请输入内容" />
            </div>
            <div class="group-info-field">
              <span class="group-info-field-label">简介</span>
              <el-input
                v-model="group.brief"
                type="textarea"
                autosize
                placeholder="简介"
              />
            </div>
            <div class="group-info-field">
              <el-checkbox v-model="group.isReadable">
                是否可读
              </el-checkbox>
            </div>
            <div class="group-info-field">
              <el-checkbox v-model="group.isWriteable">
                是否可写
              </el-checkbox>
            </div>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialog.updateDialog = false">取 消</el-button>
          <el-button type="primary" @click="saveModify">确 定</el-button>
        </span>
      </el-dialog>

      <el-dialog
        title="删除"
        :visible.sync="dialog.deleteDialog"
        width="30%"
      >
        <span>是否确认删除</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialog.deleteDialog = false">取 消</el-button>
          <el-button type="danger" @click="deleteGroup">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import FileList from '~/components/filelist/FileList'
export default {
  components: {
    FileList
  },
  data () {
    return {
      gId: null,
      fileList: [],
      opts: {
      },
      path: '/',
      group: {},
      groupUser: {},
      showList: true,
      nodes: [],
      dialog: {
        userDialog: false,
        updateDialog: false,
        deleteDialog: false
      },
      imageUrl: '',
      otherData: {}
    }
  },
  watch: {
    $route () {
      this.handlePath()
    }
  },
  created () {
    this.handlePath()
    this.getGroup()
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'file/setRefreshFolder') {
        this.getGroupFiles()
      }
    })
  },
  methods: {
    getGroup () {
      this.$axios.get(`/api/group?gId=${this.gId}`)
        .then((res) => {
          if (res.data.status === 'OK') {
            this.group = res.data.map.group
            this.imageUrl = `http://localhost:8080/group/avatar?id=${this.group.id}`
            this.getGroupUser()
          }
        })
    },
    getGroupFiles () {
      this.$axios.get(`/api/file/folder?gId=${this.gId}&path=${encodeURI(this.path)}`)
        .then((res) => {
          if (res.data.status === 'OK') {
            this.fileList = res.data.map.file.list
            this.$store.commit('file/setFile', res.data.map.file)
          }
        })
    },
    getGroupUser () {
      this.$axios.get(`/api/group/user?gId=${this.gId}`)
        .then((res) => {
          console.log(res)
          if (res.data.status === 'OK') {
            this.groupUser = res.data.map.groupUser
            this.parseOpts()
          }
        })
    },
    parseOpts () {
      const opts = {}
      opts.share = false
      opts.recycle = false
      opts.trash = false
      if (this.group.isReadable === 1) {
        this.showList = true
        opts.download = true
      } else {
        this.showList = false
        opts.download = false
      }
      if (this.groupUser.guType < 2) {
        opts.upload = true
        opts.folder = true
      }
      if (this.group.isWriteable === 1 && this.groupUser.guType === 2) {
        opts.upload = true
        opts.folder = true
        opts.gyType = this.groupUser.guType
      }
      this.group.isReadable = this.group.isReadable === 1
      this.group.isWriteable = this.group.isWriteable === 1
      this.opts = opts
    },
    handlePath () {
      const id = this.$route.query.gid
      const path = this.$route.query.path
      if (id && path) {
        this.gId = id
        this.path = path
        this.getGroupFiles()
        this.getFolderTree()
      } else {
        this.$router.push('/404')
      }
    },
    handleAvatarSuccess (res, file) {
      this.imageUrl = URL.createObjectURL(file.raw)
      // window.location.reload()
    },
    beforeAvatarUpload (file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      this.otherData.id = this.group.id
      return isJPG && isLt2M
    },
    checkGroup () {
      if (this.group.title.trim() === '') {
        this.$message.error('共享名称不能为空')
        return false
      }
      return true
    },
    saveModify () {
      this.dialog.updateDialog = false
      if (this.checkGroup()) {
        this.$axios.patch('/api/group', {
          id: this.group.id,
          title: this.group.title,
          brief: this.group.brief,
          isReadable: this.group.isReadable,
          isWriteable: this.group.isWriteable
        })
          .then((res) => {
            if (res.data.status === 'OK') {
              this.$message.success('保存成功')
            } else {
              this.$message.error('保存失败')
            }
          })
      }
    },
    deleteGroup () {
      this.dialog.deleteDialog = false
      this.$axios.delete('/api/group/?gId=' + this.group.id)
        .then((res) => {
          if (res.data.status === 'OK') {
            this.$message.success('删除成功')
            this.$router.push('/group')
          } else {
            this.$message.error('删除失败')
          }
        })
    },
    getFolderTree () {
      this.$axios.get('/api/file/folder/tree?gId=' + this.gId)
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
  margin: 2%;
  .btns {
    margin: 20px 0;
  }
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
