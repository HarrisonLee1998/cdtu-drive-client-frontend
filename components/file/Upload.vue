<template>
  <div>
    <uploader
      ref="uploader"
      :options="options"
      :file-status-text="statusText"
      :auto-start="false"
      @file-added="onFileAdded"
      @file-success="onFileSuccess"
      @file-progress="onFileProgress"
      @file-error="onFileError"
    >
      <uploader-unsupport />
      <!--将上传按钮封装到下拉列表中-->
      <el-dropdown>
        <el-button type="primary">
          <i class="fas fa-cloud-upload-alt" />上传
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <uploader-btn class="upload-btn">
              上传文件
            </uploader-btn>
          </el-dropdown-item>
          <el-dropdown-item>
            <uploader-btn class="upload-btn" :directory="true">
              上传文件夹
            </uploader-btn>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <!-- -->
      <!-- <el-collapse v-model="collapse">
        <el-collapse-item title="上传详情" name="1">
          <uploader-list />
        </el-collapse-item>
      </el-collapse> -->
      <div v-show="panelShow" class="upload-panel">
        <div>
          <div class="upload-panel-title">
            <span>上传信息</span>
            <div>
              <i v-show="!collapse" class="far fa-window-minimize" @click="collapse = true" />
              <i v-show="collapse" class="far fa-window-maximize" @click="collapse = false" />
              <i class="fas fa-times" @click="panelShow = false" />
            </div>
          </div>
          <div class="upload-panel-overview">
            <span>你成功上传了5个文件</span>
          </div>
        </div>
        <div>
          <uploader-list :class="[ collapse? 'collapse' : 'extend' ]" />
        </div>
      </div>
    </uploader>
  </div>
</template>

<script>
import SparkMD5 from 'spark-md5'
export default {
  data () {
    return {
      options: {
        target: 'http://127.0.0.1:8080/chunk',
        testChunks: true,
        simultaneousUploads: 1,
        chunkSize: 1024 * 1024
      },
      attrs: {
        accept: '*'
      },
      statusText: {
        success: '成功',
        error: '出错了',
        uploading: '上传中',
        paused: '暂停中',
        waiting: '等待中',
        md5: '正在准备上传'
      },
      panelShow: false,
      collapse: false
    }
  },
  created () {
    this.options.checkChunkUploadedByResponse = this.checkFile
  },
  methods: {
    complete () {
      console.log('complete', arguments)
    },
    fileComplete (file) {
      this.$axios({
        url: 'http://127.0.0.1:8080/mergeFile',
        method: 'post',
        data: {
          fileName: file.name,
          identifier: file.uniqueIdentifier,
          totalSize: file.size,
          type: file.fileType,
          location: file.relativePath
        },
        headers: { 'Content-Type': 'application/json' }
      }).then(function (response) {
        console.log(response)
      }).catch(function (error) {
        console.log(error)
      })
    },
    onFileProgress (rootFile, file, chunk) {
      console.log(`上传中 ${file.name}，chunk：${chunk.startByte / 1024 / 1024} ~ 
                  ${chunk.endByte / 1024 / 1024}`)
    },
    onFileAdded (file) {
      this.panelShow = true
      this.collapse = false
      this.computeMD5(file)
    },
    computeMD5 (file) {
      const fileReader = new FileReader()
      // const time = new Date().getTime()
      const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
      let currentChunk = 0
      const chunkSize = this.options.chunkSize
      const chunks = Math.ceil(file.size / chunkSize)
      const spark = new SparkMD5.ArrayBuffer()

      // 文件状态设为"计算MD5"
      // this.statusSet(file.id, 'md5')
      file.pause()
      loadNext()

      fileReader.onload = (e) => {
        spark.append(e.target.result)
        if (currentChunk < chunks) {
          currentChunk++
          loadNext()
          // 实时展示MD5的计算进度
          // this.$nextTick(() => {
          //   $(`.myStatus_${file.id}`).text('校验MD5 ' + ((currentChunk / chunks) * 100).toFixed(0) + '%')
          // })
        } else {
          const md5 = spark.end()
          this.computeMD5Success(md5, file)
          // console.log(`MD5计算完毕：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${file.size} 用时：${new Date().getTime() - time} ms`)
        }
      }
      fileReader.onerror = function () {
        this.error(`文件${file.name}读取出错，请检查该文件`)
        file.cancel()
      }
      function loadNext () {
        const start = currentChunk * chunkSize
        const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize
        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end))
      }
    },
    computeMD5Success (md5, file) {
    // 将自定义参数直接加载uploader实例的opts上
      // Object.assign(this.$refs.uploader.opts, {
      //   query: {
      //     ...this.params
      //   }
      // })
      // 需要先请求后台，判断文件是否以及存在
      console.log('文件不存在，开始上传')
      file.uniqueIdentifier = md5
      console.log(file.resume)
      file.resume()
      // this.statusRemove(file.id)
    },
    // 请求回调
    checkFile (chunk, message) {
      message = JSON.parse(message)
      console.log(message.existed)
      return message.existed
      // this.$axios({
      //   url: '/api/chunk',
      //   method: 'get',
      //   data: {
      //     chunk: JSON.stringify(chunk)
      //   }
      // }).then((res) => {
      //   console.log(res)
      //   return res.data.existed
      // }).catch(() => {
      //   return false
      // })
    },
    onFileSuccess (rootFile, file, response, chunk) {
      const res = JSON.parse(response)
      console.log(res)
      // 服务器自定义的错误，这种错误是Uploader无法拦截的
      // if (!res.result) {
      //   this.$message({ message: '上传成功', type: 'success' })
      //   return
      // }
      // if (res.existed || res.result) {
      //   this.$message({ message: '上传成功', type: 'success' })
      // }

      // 如果服务端返回需要合并
      if (res.needMerge) {
        // 发送合并请求).then((data) => {
        // 文件合并成功
        console.log('需要合并吗')
        console.log(rootFile, file, chunk)
        this.fileComplete(file)
      }
    },

    onFileError (rootFile, file, response, chunk) {
      // console.log(error)
    }
  }
}
</script>

<style lang="scss">
.upload-btn {
  border-style: none;
  text-align: center;
  width: 100px;
}
.el-dropdown-menu__item {
  padding: 0;
  margin: 0;
}
.fa-cloud-upload-alt {
  margin-right: 10px;
}
.upload-panel {
  width: 70%;
  min-width: 500px;
  background-color: #fff;
  box-shadow: #ccc 0 0 10px;
  position: fixed;
  right: 10%;
  bottom: 0;
}
.upload-panel-title {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  i {
    cursor: pointer;
  }
  i:not(:last-child){
    margin-right: 10px;
  }
}
.upload-panel-overview {
  background-color: deepskyblue;
  padding: 10px;
}
.uploader-file-status {
  display: inline;
}
.uploader-list {
  width: 100%;
  overflow-y: auto;
  transition: 0.3s all linear;
}
.collapse {
  height: 0;
}
.extend {
  height: 400px;
}
</style>

<style>
.uploader-file-info {
  display: flex;
  justify-content: space-between;
}
.uploader-file-name {
  width: 20%;
}
.uploader-file-size,
.uploader-file-status {
  width: 10%;
}
.uploader-file-actions {
  width: 30%;
}
</style>
