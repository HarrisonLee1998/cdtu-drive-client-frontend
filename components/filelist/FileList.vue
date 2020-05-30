<template>
  <div>
    <!--按钮区-->
    <div class="btns">
      <Uploader v-if="opts.upload" />
      <el-button
        v-if="opts.folder"
        type="primary"
        plain
        size="medium"
        @click="dialog.newFolderDialog = true"
      >
        <i class="fas fa-folder-open" />新建文件夹
      </el-button>

      <el-button type="primary" plain size="medium" @click="dialog.folderTreeDialog = true">
        <i class="fas fa-share-alt" />创建分享
      </el-button>

      <el-button type="primary" plain size="medium">
        <i class="fas fa-users" />创建共享
      </el-button>
    </div>
    <!--文件夹目录信息-->
    <div class="path-line">
      <span class="path"><nuxt-link :to="'/?path=' + encodeURI('/')">全部文件</nuxt-link></span>
      <span v-for="(path) in paths" :key="path.path" class="path">
        <nuxt-link :to="'/?path=' + encodeURI(path.path)">{{ path.name }}</nuxt-link>
      </span>
    </div>
    <!--文件列表-->
    <div class="file-list">
      <div class="file-wrapper">
        <el-checkbox v-model="allSelected" class="file-list-item-checkbox" />
        <div class="file-list-item">
          <span class="file-list-item-title header-field">文件名</span>
          <span class="file-list-item-size header-field">大小</span>
          <span class="file-list-item-date header-field">修改日期</span>
        </div>
      </div>
      <div v-for="(file, i) in fileList" :key="i" class="file-wrapper">
        <el-checkbox
          v-model="selected[i]"
          class="file-list-item-checkbox"
          @change="checkAllSelected"
        />
        <!-- @change="checkAllSelected" -->
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
    <!--右键菜单-->
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
        <div class="menu-item" @click="renameFile">
          重命名
        </div>
      </div>
    </div>
    <!-- 对话框 -->
    <div class="newFolderDialog">
      <el-dialog
        title="请输入新文件夹的名称"
        :visible.sync="dialog.newFolderDialog"
        width="30%"
      >
        <el-input v-model="newFolderName" />
        <div v-show="newFolderNameError.trim()!==''">
          {{ newFolderNameError }}
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialog.newFolderDialog = false">取 消</el-button>
          <el-button type="primary" @click="beforeNewFolder">确 定</el-button>
        </span>
      </el-dialog>

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
          <el-button type="primary" @click="handleFolderTree">确 定</el-button>
        </span>
      </el-dialog>

      <el-dialog
        title="重命名文件"
        :visible.sync="dialog.renameFileDialog"
        width="30%"
      >
        <el-input v-model="renameFileName" />
        <div v-show="renameFileError.trim()!==''">
          {{ renameFileError }}
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialog.renameFileDialog = false">取 消</el-button>
          <el-button type="primary" @click="rename">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import FileListItem from './FileListItem'
import Uploader from '~/components/file/Upload'
export default {
  components: {
    FileListItem,
    Uploader
  },
  props: {
    fileList: {
      type: Array,
      required: true
    },
    nodes: {
      type: Array,
      required: true
    },
    opts: {
      type: Object,
      default: () => {
        return {
          upload: false,
          folder: false,
          share: false,
          group: false,
          guType: 0
        }
      }
    }
  },
  data () {
    return {
      selected: [],
      allSelected: false,
      pathName: null,
      clickFile: {},
      clickFileEle: null,
      dialog: {
        newFolderDialog: false,
        folderTreeDialog: false,
        renameFileDialog: false
      },
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      newFolderName: '',
      newFolderNameError: '',
      renameFileName: '',
      renameFileError: ''
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
      this.initSelect()
    },
    allSelected () {
      if (this.allSelected) {
        this.initSelect()
      }
    }
  },
  methods: {
    initSelect () {
      for (let i = 0; i < this.fileList.length; ++i) {
        this.selected[i] = this.allSelected
      }
    },
    checkAllSelected () {
      let flag = true
      for (let i = 0; i < this.selected.length; ++i) {
        if (!this.selected[i]) {
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
      this.hiddenMenu()
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
    },
    beforeNewFolder () {
      this.newFolderName = this.newFolderName.trim()
      const isValid = this.checkFileName(this.newFolderName, 'newFolderNameError')
      if (isValid) {
        this.newFolderNameError = ''
        this.dialog.newFolderDialog = false
        this.newFolder()
      }
    },
    newFolder () {
      const fileUser = new FormData()
      const currentFolder = this.$store.getters['file/getFile']
      fileUser.append('fName', this.newFolderName)
      fileUser.append('fPid', currentFolder.id)
      this.$axios.post('/api/file/folder', fileUser)
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
    handleFolderTree () {
      this.dialog.folderTreeDialog = false
    },
    handleNodeClick (obj) {
      console.log(obj)
    },
    renameFile () {
      this.renameFileName = this.clickFile.fname
      this.dialog.renameFileDialog = true
    },
    rename () {
      this.renameFileName = this.renameFileName.trim()
      const isValid = this.checkFileName(this.renameFileName, 'renameFileError')
      if (isValid) {
        this.dialog.renameFileDialog = false
        this.$axios.patch('/api/file/rename', {
          id: this.clickFile.id,
          name: this.renameFileName
        }).then((res) => {
          if (res.data.status === 'OK') {
            this.$message.success('修改成功')
            this.$store.commit('file/setRefreshFolder', new Date())
          } else {
            this.$message.error('修改失败')
          }
        })
      }
    },
    checkFileName (name, errorAttr) {
      if (name === '') {
        this.newFolderNameError = '名称不能为空'
        return false
      }
      const reg = new RegExp('/')
      if (reg.test(name)) {
        this.newFolderNameError = '文件夹名称不能包含字符\'/\''
        return false
      }
      const list = this.fileList
      for (let i = 0; i < list.length; ++i) {
        if (list[i].fname === this.newFolderName) {
          this[errorAttr] = '当前目录下已存在该文件夹'
          return false
        }
      }
      return true
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

.btns {
  display: flex;
  margin-bottom: 10px;
}
.btns:not(:last-child) {
  margin-right: 10%;
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
