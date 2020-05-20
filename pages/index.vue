<template>
  <div class="container">
    <!--上传组件-->
    <div class="function-area">
      <Uploader />
      <el-button type="primary" plain size="medium" @click="dialog1 = true">
        <i class="fas fa-folder-open" />新建文件夹
      </el-button>

      <el-button type="primary" plain size="medium">
        <i class="fas fa-share-alt" />创建分享
      </el-button>

      <el-button type="primary" plain size="medium">
        <i class="fas fa-users" />创建共享
      </el-button>
    </div>

    <el-dialog
      title="请输入新文件夹的名称"
      :visible.sync="dialog1"
      width="30%"
    >
      <el-input v-model="newFolderName" />
      <div v-show="newFolderNameError.trim()!==''">
        {{ newFolderNameError }}
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialog1 = false">取 消</el-button>
        <el-button type="primary" @click="beforeNewFolder">确 定</el-button>
      </span>
    </el-dialog>

    <!-- <el-dialog
      title="目录树"
      :visible.sync="dialog2"
      width="30%"
    >
      <el-tree
        :data="fileTree.list"
        show-checkbox
        default-expand-all
        node-key="id"
        ref="tree"
        highlight-current
        :props="defaultProps">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialog2 = false">取 消</el-button>
        <el-button type="primary" @click="handleFolderTree">确 定</el-button>
      </span>
    </el-dialog> -->

    <!--文件列表组件-->
    <FileList :file-list="fileList" />
  </div>
</template>

<script>
import Uploader from '~/components/file/Upload'
import FileList from '~/components/filelist/FileList'
export default {
  components: {
    FileList,
    Uploader
  },
  data () {
    return {
      file: null,
      fileList: [],
      fileTree: null,
      pathName: null,
      dialog1: false,
      dialog2: false,
      newFolderName: '',
      newFolderNameError: ''
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
  mounted () {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'file/setRefreshFolder') {
        if (this.pathName) {
          this.getFileList()
        }
      }
    })
  },
  methods: {
    handlePathName () {
      const pathName = this.$route.query.path
      if (!pathName || pathName.trim() === '') {
        this.$router.push('/?path=' + encodeURI('/'))
      } else {
        this.pathName = pathName
        this.getFileList()
      }
      // if (pathName && pathName.trim() !== '') {
      //   this.$store.commit('file/setPathName', pathName)
      // }
    },
    getFileList () {
      this.$axios.get(`/api/file/folder/current?path=${this.pathName}`).then((res) => {
        const status = res.data.status
        const file = res.data.map.file
        if (status === 'OK' && file) {
          this.file = file
          this.$store.commit('file/setFile', res.data.map.file)
          this.fileList = file.list
        } else {
          this.$router.push('/404')
        }
      })
    },
    beforeNewFolder () {
      this.newFolderName = this.newFolderName.trim()
      if (this.newFolderName === '') {
        this.newFolderNameError = '名称不能为空'
        return
      }
      const reg = new RegExp('/')
      if (reg.test(this.newFolderName)) {
        this.newFolderNameError = '文件夹名称不能包含字符\'/\''
        return false
      }
      const list = this.fileList
      for (let i = 0; i < list.length; ++i) {
        if (list[i].fname === this.newFolderName) {
          this.newFolderNameError = '当前目录下已存在该文件夹'
          return false
        }
      }
      this.newFolderNameError = ''
      this.dialog1 = false
      this.newFolder()
    },
    newFolder () {
      const fileUser = new FormData()
      fileUser.append('fName', this.newFolderName)
      fileUser.append('fPid', this.file.id)
      this.$axios.post('/api/file/file/folder', fileUser)
        .then((res) => {
          if (res.data.status === 'OK') {
            this.$message.success('添加成功')
            this.$store.commit('file/setRefreshFolder', new Date())
          } else {
            this.$message.error('添加失败')
          }
        }).catch(() => {
          this.$message.error('添加失败')
        })
    },
    getFolderTree () {
      this.$axios.get('/api/file/file/folder/tree')
        .then((res) => {
          if (res.data.status === 'OK') {
            this.fileTree = res.data.map.file
          }
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 2.5% 1.5%;
}
.function-area {
  display: flex;
  margin-bottom: 10px;
}
.function-area:not(:last-child) {
  margin-right: 10%;
}
</style>
/**
    private String id;
    private String uId;
    private String fId;
    @NotBlank
    private String fName;
    @NotBlank
    private String fPath;
    private String fType;
    private Integer isFolder;
    private String fPid;
    private LocalDateTime lastUpdateDate;
    private Integer isDelete;
    private List<FileUser>list;
    private Long fSize;
       */
}
