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
      opts: {
        upload: false,
        folder: false,
        share: false,
        group: false,
        guType: 0,
        recycle: true,
        trash: true
      }
    }
  },
  created () {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'file/setRefreshFolder') {
        this.getFileList()
      }
    })
    this.getFileList()
  },
  methods: {
    getFileList () {
      this.$axios.get('/api/file/recycle')
        .then((res) => {
          if (res.data.status === 'OK') {
            this.fileList = res.data.map.list
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
