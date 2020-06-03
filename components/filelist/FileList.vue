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

      <el-button v-if="opts.share" type="primary" plain size="medium" @click="dialog.shareDialog = true">
        <i class="fas fa-share-alt" />创建分享
      </el-button>

      <el-button v-if="opts.group" type="primary" plain size="medium">
        <i class="fas fa-users" />添加到共享
      </el-button>
      <el-button type="primary" plain size="medium" @click="handleRecycle(1)">
        <i class="fas fa-recycle" />
        <span v-if="opts.trash">移除回收站</span>
        <span v-else>加入回收站</span>
      </el-button>
      <el-button v-if="opts.trash" type="primary" plain size="medium" @click="dialog.deleteDialog = true">
        <i class="fas fa-trash-alt" />永久删除
      </el-button>
    </div>
    <!--文件夹目录信息-->
    <div v-if="!opts.trash" class="path-line">
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
      <!-- <div class="menu-item-group">
        <div class="menu-item">
          分享
        </div>
        <div class="menu-item">
          共享
        </div>
      </div> -->
      <div class="menu-item-group">
        <!--复制到的模式定义为0， 移动到的模式定义为1-->
        <div class="menu-item" @click="shwoFolderTree(0)">
          复制到
        </div>
        <div class="menu-item" @click="shwoFolderTree(1)">
          移动到
        </div>
      </div>
      <div class="menu-item-group">
        <div class="menu-item" @click="handleRecycle(0)">
          <span v-if="clickFile.isDelete === 0">加入</span>
          <span v-else>移除</span> 回收站
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
          <el-button type="primary" @click="selectFolderTreeFile">确 定</el-button>
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

      <el-dialog
        title="提示"
        :visible.sync="dialog.deleteDialog"
        width="30%"
      >
        <span>是否确认删除</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialog.deleteDialog = false">取 消</el-button>
          <el-button type="primary" @click="deleteFile">确 定</el-button>
        </span>
      </el-dialog>

      <el-dialog
        title="创建分享"
        :visible.sync="dialog.shareDialog"
        width="230px"
      >
        <div>
          <span>选择有效期</span>
          <el-select v-model="shareExpireDays" placeholder="选择有效期">
            <el-option
              v-for="item in expireOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div>
          <el-checkbox v-model="needPwd">
            设置口令
          </el-checkbox>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialog.shareDialog = false">取 消</el-button>
          <el-button type="primary" @click="createShare">确 定</el-button>
        </span>
      </el-dialog>

      <el-dialog
        title="分享信息"
        :visible.sync="dialog.shareInfoDialog"
        width="30%"
      >
        <div>
          <span>链接：</span><el-input v-model="shareInfo.link" readonly />
        </div>
        <div>
          <span>口令：{{ shareInfo.pwd }}</span>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialog.shareInfoDialog = false">取 消</el-button>
          <el-button type="primary" @click="copyShareInfo">复制分享信息</el-button>
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
          guType: 0,
          trash: false
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
        renameFileDialog: false,
        deleteDialog: false,
        shareDialog: false,
        shareInfoDialog: false
      },
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      newFolderName: '',
      newFolderNameError: '',
      renameFileName: '',
      renameFileError: '',
      mode: -1,
      targetFile: null,
      expireOptions: [
        {
          value: 1,
          label: '1天'
        },
        {
          value: 7,
          label: '7天'
        },
        {
          value: 30,
          label: '30天'
        },
        {
          value: -1,
          label: '永久'
        }
      ],
      shareExpireDays: 1,
      needPwd: true,
      shareInfo: {}
    }
  },
  computed: {
    paths () {
      const data = []
      const path = this.$route.query.path
      if (path) {
        const paths = path.split('/').filter(f => f.trim() !== '')
        let temp = ''
        paths.forEach((p) => {
          const obj = {}
          obj.name = p
          temp += '/' + p
          obj.path = temp
          data.push(obj)
        })
      }
      return data
    }
  },
  watch: {
    fileList () {
      this.initSelect()
    },
    allSelected () {
      this.initSelect()
    }
  },
  methods: {
    /* 初始化勾选 */
    initSelect () {
      for (let i = 0; i < this.fileList.length; ++i) {
        this.selected[i] = this.allSelected
      }
    },
    /* 检查是否所有被勾选 */
    checkAllSelected () {
      // let flag = true
      // for (let i = 0; i < this.selected.length; ++i) {
      //   if (!this.selected[i]) {
      //     flag = false
      //     break
      //   }
      // }
      // this.allSelected = flag
    },
    /* 切换勾选 */
    toggleSelected (file) {
      this.fileList.forEach((f) => {
        if (file.id === f.id) {
          f.selected = !f.selected
          this.checkAllSelected()
          return true
        }
      })
    },
    /* 显示菜单并定义相关事件 */
    showMenu (e, file) {
      if (this.opts.trash) {
        return
      }
      this.hiddenMenu()
      this.clickFile = file
      const x = e.clientX
      let y = e.clientY
      if (document.body.clientHeight - y < 200) {
        y = y - 200
      }
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
    /* 隐藏菜单，并关闭某些事件 */
    hiddenMenu () {
      if (this.clickFileEle) {
        this.clickFileEle.removeAttribute('id')
      }
      const menu = this.$refs.contextMenu
      if (menu) {
        menu.style.display = 'none'
      }
      window.removeEventListener('mousewheel', this.hiddenMenu)
      window.removeEventListener('click', this.hiddenMenu)
    },
    /* 新建文件夹前，检验名称是否合理 */
    beforeNewFolder () {
      this.newFolderName = this.newFolderName.trim()
      const isValid = this.checkFileName(this.newFolderName, 'newFolderNameError')
      if (isValid) {
        this.newFolderNameError = ''
        this.dialog.newFolderDialog = false
        this.newFolder()
      }
    },
    /* 发送新建文件夹请求 */
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
    /* 打开重命名窗口 */
    renameFile () {
      this.renameFileName = this.clickFile.fname
      this.dialog.renameFileDialog = true
    },
    /* 发送重命名请求 */
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
    /* 检查文件名是否合法 */
    checkFileName (name, errorAttr) {
      if (name === '') {
        this.newFolderNameError = '名称不能为空'
        return false
      }
      const reg = new RegExp('/')
      if (reg.test(name)) {
        this.newFolderNameError = '名称不能包含字符\'/\''
        return false
      }
      const list = this.fileList
      for (let i = 0; i < list.length; ++i) {
        if (list[i].fname === this.newFolderName) {
          this[errorAttr] = '当前目录下已存在该文件'
          return false
        }
      }
      return true
    },
    /* 显示目录树 */
    shwoFolderTree (mode) {
      this.targetFile = null
      this.mode = mode
      this.dialog.folderTreeDialog = true
    },
    /* 处理目录树选择 */
    handleNodeClick (obj) {
      this.targetFile = obj
    },
    /* 处理目录树选择后进行事件分发 */
    selectFolderTreeFile () {
      this.dialog.folderTreeDialog = false
      if (this.mode === 0) {
        // 复制到
        this.copy()
      } else {
        // 移动到
        this.move()
      }
    },
    /* 发送复制文件的请求 */
    copy () {
      const isValid = this.checkTargetFile()
      if (isValid) {
        this.$axios.patch('/api/file/copy', {
          src: this.clickFile.id,
          desc: this.targetFile.id
        }).then((res) => {
          if (res.data.status === 'OK') {
            this.$message.success('复制成功')
            this.$store.commit('file/setRefreshFolder', new Date())
          } else {
            this.$message.error('复制失败')
          }
        })
      }
    },
    /* 发送移动文件的请求 */
    move () {
      const isValid = this.checkTargetFile()
      if (isValid) {
        this.$axios.patch('/api/file/move', {
          src: this.clickFile.id,
          desc: this.targetFile.id
        }).then((res) => {
          if (res.data.status === 'OK') {
            this.$message.success('移动成功')
            this.$store.commit('file/setRefreshFolder', new Date())
          } else {
            this.$message.error('移动失败')
          }
        })
      }
    },
    /* 检查目标文件 */
    checkTargetFile () {
      if (!this.clickFile) {
        this.$message.error('请先选择源目录')
        return false
      }
      if (!this.targetFile) {
        this.$message.error('请先选择目标目录')
        return false
      }
      const src = this.clickFile.id
      const desc = this.targetFile.id
      if (src === desc) {
        this.$message.error('源目录和目标目录不能为同一个目录')
        return false
      }
      return true
    },
    handleRecycle (flag) {
      let ids = []
      if (flag === 0) {
        ids.push(this.clickFile.id)
      } else {
        ids = this.getIds()
      }
      if (ids.length > 0) {
        this.$axios.patch('/api/file/recycle', {
          ids,
          flag: this.opts.trash ? 0 : 1
        })
          .then((res) => {
            if (res.data.status === 'OK') {
              this.$message.success('操作成功')
              this.$store.commit('file/setRefreshFolder', new Date())
            } else {
              this.$message.error('操作失败')
            }
          })
      }
    },
    deleteFile () {
      this.dialog.deleteDialog = false
      const ids = this.getIds()
      if (ids.length > 0) {
        this.$axios.post('/api/file/deletion', {
          ids
        }).then((res) => {
          if (res.data.status === 'OK') {
            this.$message.success('删除成功')
            this.$store.commit('file/setRefreshFolder', new Date())
          } else {
            this.$message.error('删除失败')
          }
        })
      }
    },
    /* 创建分享 */
    createShare () {
      this.dialog.shareDialog = false
      const ids = this.getIds()
      if (ids.length > 0) {
        this.$axios.post('/api/share', {
          ids,
          days: this.shareExpireDays,
          needPwd: this.needPwd
        }).then((res) => {
          if (res.data.status === 'OK') {
            this.$message.success('分享创建成功')
            this.shareInfo = res.data.map.share
            this.dialog.shareInfoDialog = true
          } else {
            this.$message.error('分享创建失败')
          }
        })
      }
    },
    getIds () {
      const ids = []
      for (let i = 0; i < this.selected.length; ++i) {
        if (this.selected[i]) {
          ids.push(this.fileList[i].id)
        }
      }
      if (ids.length === 0) {
        this.$message.error('请选选择所要处理的文件')
      }
      return ids
    },
    copyShareInfo () {
      this.$message.info('分享信息已复制到剪切板')
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
    a {
      color: #000;
      text-decoration: none;
    }
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
