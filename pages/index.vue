<template>
  <div class="container">
    <!--文件列表组件-->
    <FileList :file-list="fileList" :nodes="nodes" :opts="opts" />
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
      file: null,
      fileList: [],
      nodes: [],
      pathName: null,
      newFolderName: '',
      newFolderNameError: '',
      opts: {
        upload: true,
        folder: true,
        share: true,
        group: true,
        guType: 0,
        recycle: true,
        download: true
      }
    }
  },
  watch: {
    $route () {
      this.handlePathName()
    }
  },
  created () {
    this.handlePathName()
    this.getFolderTree()
  },
  mounted () {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'file/setRefreshFolder') {
        if (this.pathName) {
          this.getFileList()
          this.getFolderTree()
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
      this.$axios.get(`/api/file/folder?path=${this.pathName}`).then((res) => {
        const status = res.data.status
        const file = res.data.map.file
        if (status === 'OK' && file) {
          this.file = file
          this.$store.commit('file/setFile', res.data.map.file)
          // file.list.forEach((file) => {
          //   file.selected = false
          // })
          this.fileList = file.list
        } else {
          this.$router.push('/404')
        }
      })
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
  padding: 2.5% 1.5%;
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
