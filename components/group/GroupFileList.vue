<template>
  <div>
    <FileList v-show="showList" :file-list="fileList" :opts="opts" :nodes="nodes" />
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
      group: {},
      groupUser: {},
      showList: true,
      nodes: []
    }
  },
  created () {
    const id = this.$route.query.gid
    if (id) {
      this.gId = id
      this.getGroup()
      this.getGroupFiles()
    } else {
      this.$router.push('/404')
    }
  },
  methods: {
    getGroup () {
      this.$axios.get(`/api/group?gId=${this.gId}`)
        .then((res) => {
          if (res.data.status === 'OK') {
            this.group = res.data.map.group
            this.getGroupUser()
          }
        })
    },
    getGroupFiles () {
      this.$axios.get(`/api/file/folder?gId=${this.gId}&path=${encodeURI('/')}`)
        .then((res) => {
          if (res.data.status === 'OK') {
            this.fileList = res.data.map.file.list
          }
        })
    },
    getGroupUser () {
      this.$axios.get(`/api/group/user?gId=${this.gId}`)
        .then((res) => {
          if (res.data.status === 'OK') {
            this.groupUser = res.data.map.groupUser
            this.parseOpts()
          }
        })
    },
    parseOpts () {
      const opts = {}
      opts.share = false
      if (this.group.isReadable === 1) {
        this.showList = true
      } else {
        this.showList = false
      }
      if (this.groupUser.guType < 2) {
        opts.upload = true
        opts.folder = true
        opts.recycle = true
        opts.trash = true
      }
      if (this.group.isWriteable === 0 && this.groupUser.guType === 2) {
        opts.upload = false
        opts.folder = false
        opts.gyType = this.groupUser.guType
        opts.recycle = false
        opts.trash = false
      }
      this.opts = opts
    }
  }
}
</script>
