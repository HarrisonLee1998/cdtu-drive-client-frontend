/* eslint-disable no-self-assign */
<template>
  <div>
    <div class="uploader">
      <el-dropdown>
        <el-button type="primary" size="medium">
          <i class="fas fa-upload" /> 上传
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <input
              id="fileUpload"
              ref="fileInput"
              type="file"
              multiple
              class="upload-btn"
              @change="uploadFile"
            >
            <label for="fileUpload">上传文件</label>
          </el-dropdown-item>
          <el-dropdown-item>
            <input
              id="folderUpload"
              ref="folderInput"
              type="file"
              multiple
              webkitdirectory
              class="upload-btn"
              @change="uploadFolder"
            >
            <label for="folderUpload">上传文件夹</label>
          </el-dropdown-item>
          <el-dropdown-item>
            <div @click="showPanel = true">
              打开上传面板
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div v-show="showPanel" class="upload-panel">
      <div>
        <div class="upload-panel-title">
          <span>上传信息</span>
          <div>
            <i v-show="!collapse" class="far fa-window-minimize" @click="collapse = true" />
            <i v-show="collapse" class="far fa-window-maximize" @click="collapse = false" />
            <i class="fas fa-times" @click="showPanel = false" />
          </div>
        </div>
        <div class="upload-panel-overview">
          <div>
            <span>Total: {{ uploadList.length }}</span>
            <span v-show="succeedCount > 0">Succeed: {{ succeedCount }}</span>
            <span v-show="failedCount > 0">Failed: {{ failedCount }}</span>
          </div>
          <el-button type="text" @click="clearUploadList">
            清空列表
          </el-button>
        </div>
      </div>
      <div :class="[ collapse ? 'collapse' : 'extend', 'upload-list' ]">
        <div v-for="(file, i) in uploadList" :key="i" class="upload-list-item">
          <div class="upload-list-item-info">
            <div class="upload-list-item-name">
              {{ file.name }}
            </div>
            <div class="upload-list-item-status">
              {{ file.status }}
            </div>
            <div class="upload-list-item-pause">
              <div v-show="file.percentage !== 100" class="icons">
                <i v-show="file.paused" class="far fa-pause-circle" @click="pause(file, false)" />
                <i v-show="!file.paused" class="far fa-play-circle" @click="pause(file, true)" />
              </div>
            </div>
          </div>
          <el-progress :percentage="file.percentage" color="#f56c6c" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SparkMD5 from 'spark-md5'
export default {
  data () {
    return {
      uploadList: [],
      uploadQueue: [],
      chunkSize: 1024 * 1024 * 5,
      parallel: 3,
      start: 0,
      collapse: false,
      parentFileId: '232930c07321fc061fa4f0c1c4239898',
      showPanel: false,
      types: {
        image: ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp'],
        video: ['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv', 'wmv'],
        audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac'],
        document: ['doc', 'txt', 'docx', 'pages', 'epub', 'pdf', 'numbers', 'csv', 'xls', 'xlsx', 'keynote', 'ppt', 'pptx', 'md', 'rtf']
      },
      succeedCount: 0,
      failedCount: 0
    }
  },
  created () {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'file/setFile') {
        this.parentFileId = state.file.file.id
      }
    })
  },
  methods: {
    uploadFile () {
      this.handleFiles('fileUpload')
    },
    handleFiles (eleId) {
      if (!this.parentFileId) {
        this.$message({ message: '系统内部出现错误', center: true, type: 'error' })
        return
      }
      this.showPanel = true
      this.collapse = false
      // 清空文件列表
      const input = document.getElementById(eleId)
      const files = input.files
      input.type = 'text'
      input.type = 'file'
      const curLen = this.uploadList.length
      for (let i = 0; i < files.length; ++i) {
        files[i].percentage = 0
        this.uploadList.push(files[i])
        if (files[i].size === 0) {
          this.showError = true
          this.updateObject(files[i], 'status', 'error')
        } else {
          files[i].status = '正在准备上传...'
          files[i].index = curLen + i
          this.uploadQueue.push(files[i].index)
        }
      }
      for (let i = 0; i < this.parallel; ++i) {
        this.uploadHepler()
      }
    },
    uploadHepler () {
      if (this.uploadQueue.length > 0) {
        const file = this.uploadList[this.uploadQueue.shift()]
        this.computeMD5(file)
      }
    },
    uploadFolder () {
      this.handleFiles('folderUpload')
    },
    computeMD5 (file) {
      this.updateObject(file, 'status', '正在计算md5...')
      const fileReader = new FileReader()
      // const time = new Date().getTime()
      const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
      let currentChunk = 0
      const chunkSize = 1024 * 1024 * 1
      const chunks = Math.ceil(file.size / chunkSize)
      const spark = new SparkMD5.ArrayBuffer()
      loadNext()

      fileReader.onload = (e) => {
        spark.append(e.target.result)
        if (file.paused) {
          return
        }
        if (currentChunk < chunks) {
          currentChunk++
          loadNext()
        } else {
          const md5 = spark.end()
          file.md5 = md5
          this.checkChunk(file)
        }
      }
      fileReader.onerror = function () {
        console.log('计算出错')
      }
      function loadNext () {
        const start = currentChunk * chunkSize
        const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize
        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
      }
    },
    async checkChunk (file) {
      this.updateObject(file, 'status', '正在获取分片信息')
      const data = new FormData()
      data.append('identifier', file.md5)
      data.append('totalSize', file.size)
      data.append('parentFileId', this.parentFileId)
      data.append('filename', file.name)
      data.append('mime', file.type)
      data.append('type', this.getType(file))
      const url = '/api/chunk/check'
      await this.$axios.post(url, data).then((res) => {
        const status = res.data.map.status
        const ids = res.data.map.ids
        file.status = status
        file.ids = ids
        if (status === 'success') {
          this.addFileUser(file)
        } else {
          this.upload(file)
        }
      }).catch(() => {
        // 拒绝上传
        this.updateObject(file, 'status', '出错了')
      })
    },
    async upload (file) {
      this.updateObject(file, 'status', '正在上传...')
      const url = '/api/chunk/upload/'
      const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
      let start, end
      const size = this.chunkSize
      const chunks = Math.ceil(file.size / size)
      file.uploaded = file.ids.length
      const f = file
      // const type = this.getType(file)
      for (let i = 0; i < chunks && !file.paused; ++i) {
        // 如果当前Chunk ID不存在, 才上传
        if (!file.ids.includes(i)) {
          const data = new FormData()
          data.append('identifier', file.md5)
          start = i * size
          end = start + size
          if (end > f.size) {
            end = f.size
          }
          data.append('chunkNumber', i)
          const fslice = blobSlice.call(file, start, end)
          data.append('file', fslice)
          // 异步请求
          await this.$axios.post(url, data).then((res) => {
            file.uploaded += 1
            let percentage = Math.ceil(((file.uploaded + 1) / chunks) * 100)
            percentage = percentage <= 100 ? percentage : 100
            this.updateObject(file, 'percentage', percentage)
          }).catch(() => {
            file.status = 'error'
          })

          if (file.status === 'error') {
            this.uploadHepler()
            return
          }
        }
        if (file.uploaded === chunks) {
          this.updateObject(file, 'status', '正在合并分块')
          this.merge(file)
        }
      }
    },
    merge (file) {
      const chunk = new FormData()
      chunk.append('filename', file.name)
      chunk.append('identifier', file.md5)
      chunk.append('totalSize', file.size)
      chunk.append('mime', file.type)
      chunk.append('type', this.getType(file))
      chunk.append('location', '')
      chunk.append('relativePath', file.webkitRelativePath)
      chunk.append('parentFileId', this.parentFileId)
      this.$axios.post('/api/chunk/merge', chunk).then(() => {
        this.updateObject(file, 'status', 'success')
      }).catch(() => {
        this.updateObject(file, 'status', 'error')
        this.uploadHepler()
      })
    },
    addFileUser (file) {
      const chunk = new FormData()
      chunk.append('identifier', file.md5)
      chunk.append('relativePath', file.webkitRelativePath)
      chunk.append('parentFileId', this.parentFileId)
      chunk.append('filename', file.name)
      chunk.append('totalSize', file.size)
      chunk.append('mime', file.type)
      chunk.append('type', this.getType(file))
      this.$axios.post('/api/file/user', chunk).then((res) => {
        if (res.data.status === 'OK') {
          this.updateObject(file, 'percentage', 100)
          this.updateObject(file, 'status', 'success')
        } else {
          this.updateObject(file, 'status', 'error')
        }
      }).catch(() => {
        this.updateObject(file, 'status', 'error')
      })
    },
    updateObject (file, key, value) {
      // vm.$set(vm.items, indexOfItem, newValue)
      if (key && value) {
        file[key] = value
      }
      this.$set(this.uploadList, file.index, file)
      if (key === 'status' && value === 'success') {
        this.succeedCount++
        this.$store.commit('file/setRefreshFolder', new Date())
      } else if (key === 'status' && value === 'error') {
        this.failedCount++
      }
      this.uploadHepler()
    },
    getType (file) {
      let s = file.name.split('.')
      if (s && s.length > 0) {
        s = s[s.length - 1]
        for (const type in this.types) {
          if (this.types[type].includes(s)) {
            return type
          }
        }
      }
      return 'unknown'
    },
    pause (file, flag) {
      file.paused = flag
      if (flag) {
        this.updateObject(file, 'status', '暂停中')
      } else {
        this.uploadQueue.push(file.index)
        this.uploadHepler()
      }
    },
    clearUploadList () {
      this.uploadList.forEach((file) => {
        file.paused = true
      })
      this.uploadList = []
      this.uploadQueue = []
      this.succeedCount = 0
      this.failedCount = 0
    }
  }
}
</script>

<style lang="scss">
.uploader {
  width: 100px;
}
.upload-btn {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}
.upload-btn + label {
  display: inline-block;
}
.upload-btn:focus + label,
.upload-btn + label:hover {
    background-color: azure;
}
.upload-panel {
  width: 50%;
  background-color: #fff;
  box-shadow: #ccc 0 0 10px;
  position: fixed;
  right: 10%;
  bottom: 0;
}

.upload-panel-title {
  display: flex;
  justify-content: space-between;
  padding: 10px 5px;
  background-color: deepskyblue;
  color: #fff;
  i {
    cursor: pointer;
  }
  i:not(:last-child){
    margin-right: 10px;
  }
}
.upload-panel-overview {
  border-bottom: 1px solid #ccc;
  padding: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.upload-list {
  padding: 5px;
  overflow-y: auto;
  overflow-y: auto;
  transition: 0.3s all linear;
}
.collapse {
  padding: 0;
  height: 0;
}
.extend {
  height: 300px;
}
.upload-list-item-info {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  .upload-list-item-name {
    width: 60%;
  }
  .upload-list-item-status {
    width: 30%;
  }
  .upload-list-item-pause {
    width: 10%;
  }
}
</style>
