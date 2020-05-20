<template>
  <div>
    <div class="path-tree">
      <span class="path"><nuxt-link :to="'/?path=' + encodeURI('/')">全部文件</nuxt-link></span>
      <span v-for="(path) in paths" :key="path.path" class="path">
        <nuxt-link :to="'/?path=' + encodeURI(path.path)">{{ path.name }}</nuxt-link>
      </span>
    </div>
    <div class="file-list">
      <div class="file-wrapper">
        <el-checkbox v-model="allSelected" class="file-list-item-checkbox" @change="selectAll" />
        <div class="file-list-item">
          <span class="file-list-item-title header-field">文件名</span>
          <span class="file-list-item-size header-field">大小</span>
          <span class="file-list-item-date header-field">修改日期</span>
        </div>
      </div>
      <div v-for="(file, i) in fileList" :key="i" class="file-wrapper">
        <el-checkbox
          v-model="file.selected"
          class="file-list-item-checkbox"
          @change="checkAllSelected"
        />
        <FileListItem :file="file" class="file-list-item" @toggleSelected="toggleSelected" />
      </div>
      <div v-show="fileList.length === 0 " class="empty-list">
        <div>当前文件夹下没有文件</div>
      </div>
    </div>
  </div>
</template>

<script>
import FileListItem from './FileListItem'
export default {
  components: {
    FileListItem
  },
  props: {
    fileList: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      selected: [],
      allSelected: false,
      pathName: null
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
      this.initSelect(false)
    }
  },
  created () {
  },
  methods: {
    initSelect (flag) {
      this.fileList.forEach((file) => {
        file.selected = flag
      })
    },
    selectAll (selected) {
      this.initSelect(selected)
    },
    checkAllSelected () {
      let flag = true
      for (let i = 0; i < this.fileList.length; ++i) {
        if (!this.fileList[i].selected) {
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
</style>
